import { Body, Controller, Post, Get, Delete, UseGuards, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // WebAuthn Registration
  @UseGuards(AuthGuard)
  @Get('passkey/register-options')
  getRegistrationOptions(@Request() req) {
    return this.authService.getRegistrationOptions(Number(req.user.sub));
  }

  @UseGuards(AuthGuard)
  @Post('passkey/register-verify')
  verifyRegistration(@Request() req, @Body() body: { response: any, name?: string }) {
    return this.authService.verifyRegistration(Number(req.user.sub), body.response, body.name);
  }

  @UseGuards(AuthGuard)
  @Delete('passkey/:credentialID')
  deletePasskey(@Request() req, @Param('credentialID') credentialID: string) {
    return this.authService.deleteAuthenticator(Number(req.user.sub), credentialID);
  }

  // WebAuthn Authentication (Login)
  @Post('passkey/login-options')
  getAuthenticationOptions(@Body('email') email: string) {
    return this.authService.getAuthenticationOptions(email);
  }

  @Post('passkey/login-verify')
  verifyAuthentication(@Body() body: { response: any, email: string }) {
    return this.authService.verifyAuthentication(body.response, body.email);
  }

  // WebAuthn Password Recovery
  @Post('passkey/recovery-reset')
  async recoveryReset(@Body() body: { response: any, email: string, newPassword: string }) {
    const res = await this.authService.verifyAuthentication(body.response, body.email, true);
    if (res.success && res.userId) {
      return this.authService.resetPasswordWithPasskey(res.userId, body.newPassword);
    }
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.authService.me(req.user);
  }
}
