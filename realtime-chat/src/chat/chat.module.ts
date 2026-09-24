import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      Message,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'my-secret-key',
    }),
  ],
  controllers: [
    ChatController,
  ],
  providers: [ChatGateway, ChatService],
  exports: [
    ChatService,
  ],
})
export class ChatModule { }
