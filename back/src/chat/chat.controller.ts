import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Res,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/auth.guard';
import express from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthGuard)
  @Post()
  async chat(
    @Body() body: { messages: any[]; slug?: string },
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const userId = req['user'].sub;
    const slug = body.slug || null;

    const result = await this.chatService.chat(userId, slug, body.messages);
    res.set('Access-Control-Expose-Headers', 'x-chat-slug');
    result.pipeUIMessageStreamToResponse(res);
  }

  @UseGuards(AuthGuard)
  @Post('start')
  async start(@Body() body: { message: string }, @Req() req: express.Request) {
    const userId = req['user'].sub;
    return this.chatService.createConversation(userId, body.message);
  }

  @UseGuards(AuthGuard)
  @Get('conversations')
  async getConversations(@Req() req: express.Request) {
    const userId = req['user'].sub;
    return this.chatService.getConversations(userId);
  }

  @UseGuards(AuthGuard)
  @Get('conversations/:slug')
  async getConversation(
    @Param('slug') slug: string,
    @Req() req: express.Request,
  ) {
    const userId = req['user'].sub;
    return this.chatService.getConversation(userId, slug);
  }

  @UseGuards(AuthGuard)
  @Delete('conversations/:slug')
  @HttpCode(204)
  async deleteConversation(
    @Param('slug') slug: string,
    @Req() req: express.Request,
  ) {
    const userId = req['user'].sub;
    const deleted = await this.chatService.deleteConversation(userId, slug);
    if (!deleted) {
      return { error: 'Conversación no encontrada' };
    }
    return { success: true };
  }
}
