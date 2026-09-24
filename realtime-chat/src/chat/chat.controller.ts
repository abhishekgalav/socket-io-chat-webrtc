import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  @Get('rooms/:roomId/messages')
  async getMessages(
    @Param('roomId') roomId: string,
  ) {
    console.log(`Fetching messages for room: ${roomId}`,
    );
    return this.chatService.getMessages(roomId);
  }
}