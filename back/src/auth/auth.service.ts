import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

@Injectable()
export class AuthService {
  private readonly rpID = process.env.RP_ID || 'localhost';
  private readonly rpName = process.env.RP_NAME || 'BiblioChat';
  private readonly origin = process.env.FRONTEND_URL || 'http://localhost:5173';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private toBase64URL(buffer: Uint8Array): string {
    return Buffer.from(buffer)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone, address } = registerDto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isVerified: true,
        profile: {
          create: { firstName, lastName, phone: phone || '', address: address || '' },
        },
      },
      include: { profile: true },
    });

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Esta cuenta no existe');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email },
    };
  }

  async getRegistrationOptions(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { authenticators: true },
    });

    if (!user) throw new BadRequestException('Usuario no encontrado');

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userID: Buffer.from(user.id.toString()),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: user.authenticators.map((auth) => ({
        id: auth.credentialID,
        type: 'public-key',
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    await this.prisma.user.update({
      where: { id: Number(userId) },
      data: { currentChallenge: options.challenge },
    });

    return options;
  }

  async verifyRegistration(userId: number, body: any, name?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user || !user.currentChallenge) {
      throw new BadRequestException('Challenge no encontrado');
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      requireUserVerification: false, // Permitir mayor compatibilidad con dispositivos
    });

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;
      
      const count = await this.prisma.authenticator.count({ where: { userId: Number(userId) } });
      if (count >= 5) {
        throw new BadRequestException('Límite de 5 Passkeys alcanzado');
      }

      await this.prisma.authenticator.create({
        data: {
          userId: Number(userId),
          credentialID: credential.id,
          publicKey: Buffer.from(credential.publicKey),
          counter: BigInt(credential.counter),
          credentialDeviceType,
          credentialBackedUp,
          transports: (body.response.transports || []).join(','),
          name: name || 'Dispositivo',
        },
      });

      await this.prisma.user.update({
        where: { id: Number(userId) },
        data: { currentChallenge: null },
      });

      return { success: true };
    }

    throw new BadRequestException('Fallo la verificación de Passkey');
  }

  async getAuthenticationOptions(email?: string) {
    const user = email ? await this.prisma.user.findUnique({
      where: { email },
      include: { authenticators: true },
    }) : null;

    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      allowCredentials: user?.authenticators.map((auth) => ({
        id: auth.credentialID,
        type: 'public-key',
      })),
      userVerification: 'preferred',
    });

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { currentChallenge: options.challenge },
      });
    }

    return options;
  }

  async verifyAuthentication(body: any, email: string, isReset = false) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { authenticators: true },
    });

    if (!user || !user.currentChallenge) {
      throw new BadRequestException('Challenge no encontrado');
    }

    const authenticator = user.authenticators.find(
      (auth) => auth.credentialID === body.id,
    );

    if (!authenticator) {
      throw new BadRequestException('Passkey no reconocida');
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      requireUserVerification: false, // Permitir mayor compatibilidad con dispositivos
      credential: {
        id: authenticator.credentialID,
        publicKey: authenticator.publicKey,
        counter: Number(authenticator.counter),
      },
    });

    const { verified, authenticationInfo } = verification;

    if (verified) {
      await this.prisma.authenticator.update({
        where: { credentialID: authenticator.credentialID },
        data: { counter: BigInt(authenticationInfo.newCounter) },
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { currentChallenge: null },
      });

      if (isReset) {
         return { success: true, userId: user.id };
      }

      const payload = { sub: user.id, email: user.email };
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: { id: user.id, email: user.email },
      };
    }

    throw new BadRequestException('Verificación fallida');
  }

  async deleteAuthenticator(userId: number, credentialID: string) {
    const authenticator = await this.prisma.authenticator.findUnique({
      where: { credentialID },
    });

    if (!authenticator || authenticator.userId !== Number(userId)) {
      throw new UnauthorizedException('No tienes permiso para eliminar esta llave');
    }

    await this.prisma.authenticator.delete({
      where: { credentialID },
    });

    return { success: true };
  }

  async resetPasswordWithPasskey(userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return { success: true };
  }

  async me(payload: any) {
    const userId = Number(payload.sub);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, authenticators: true },
    });

    if (!user) {
      throw new UnauthorizedException(`Usuario no encontrado (ID: ${userId})`);
    }

    const { password: _, ...result } = user as any;
    
    // Serializar BigInt a Number para evitar error de stringify y arreglar tipos
    if (result.authenticators) {
      result.authenticators = result.authenticators.map((auth: any) => ({
        ...auth,
        counter: Number(auth.counter)
      }));
    }

    return result;
  }
}
