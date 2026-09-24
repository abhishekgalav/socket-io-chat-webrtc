import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository:
      Repository<Message>,
  ) { }

  async createMessage(
    userId: string,
    roomId: string,
    message: string,
  ) {

    const entity =
      this.messageRepository.create({
        userId,
        roomId,
        message,
      });

    return this.messageRepository.save(entity);
  }

  async getMessages(
    roomId: string,
  ) {

    return this.messageRepository.find({
      where: {
        roomId,
      },

      order: {
        createdAt: 'ASC',
      },
    });
  }

  async canJoinRoom(
    userId: string,
    roomId: string,
  ): Promise<boolean> {
    return true;
  }
}
