import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { BooksModule } from '../books/books.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [BooksModule, PrismaModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
