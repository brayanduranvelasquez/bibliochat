import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [PrismaModule, AuthModule, BooksModule, ChatModule],
  providers: [],
})
export class AppModule {}
