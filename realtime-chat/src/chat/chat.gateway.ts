import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { TypingDto } from './dto/typing.dto';

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    userName: string;
  };
}


@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  // ============================================
  // SOCKET INITIALIZATION + JWT AUTH
  // ============================================

  afterInit(server: Server) {
    console.log('✅ Socket.IO initialized');

    server.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth?.token;

        if (!token) {
          return next(
            new Error('Authentication required'),
          );
        }

        const secret =
          this.configService.get<string>('JWT_SECRET');

        if (!secret) {
          console.error(
            '❌ JWT_SECRET is not configured',
          );

          return next(
            new Error('JWT configuration missing'),
          );
        }

        // Verify JWT
        const payload = this.jwtService.verify<{
          sub: string;
        }>(token, {
          secret,
        });

        if (!payload?.sub) {
          return next(
            new Error('Invalid token payload'),
          );
        }

        // Get user from database
        const user =
          await this.usersService.findOne(payload.sub);

        if (!user) {
          return next(
            new Error('User not found'),
          );
        }

        // Store authenticated user data
        socket.data.userId = user.id;
        socket.data.userName = user.name;

        console.log(
          `✅ Socket authenticated: ${user.name}`,
        );

        next();
      } catch (error) {
        console.error(
          '❌ Socket authentication failed:',
          error instanceof Error
            ? error.message
            : error,
        );

        next(
          new Error('Invalid token'),
        );
      }
    });
  }

  // ============================================
  // CONNECTION
  // ============================================

  handleConnection(socket: AuthenticatedSocket) {
    console.log(
      `🟢 User connected: ${socket.data.userName} (${socket.id})`,
    );
  }

  // ============================================
  // DISCONNECT
  // ============================================

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log(
      `🔴 User disconnected: ${socket.data.userName} (${socket.id})`,
    );
  }

  // ============================================
  // JOIN ROOM
  // ============================================

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { userId, userName } = socket.data;

    if (!userId) {
      throw new WsException('Unauthorized');
    }

    if (!data?.roomId?.trim()) {
      throw new WsException(
        'Room ID is required',
      );
    }

    const roomId = data.roomId.trim();

    try {
      // Check room access
      const allowed =
        await this.chatService.canJoinRoom(
          userId,
          roomId,
        );

      if (!allowed) {
        throw new WsException(
          'Access denied',
        );
      }

      // Join Socket.IO room
      await socket.join(roomId);

      console.log(
        `🟢 ${userName} joined room: ${roomId}`,
      );

      return {
        success: true,
        roomId,
      };
    } catch (error) {
      console.error(
        'Join room error:',
        error instanceof Error
          ? error.message
          : error,
      );

      if (error instanceof WsException) {
        throw error;
      }

      throw new WsException(
        'Unable to join room',
      );
    }
  }

  // ============================================
  // SEND MESSAGE
  // ============================================

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { userId, userName } = socket.data;

    if (!userId) {
      throw new WsException('Unauthorized');
    }

    if (!data?.roomId?.trim()) {
      throw new WsException(
        'Room ID is required',
      );
    }

    if (!data?.message?.trim()) {
      throw new WsException(
        'Message cannot be empty',
      );
    }

    const roomId = data.roomId.trim();
    const messageText = data.message.trim();

    try {
      // Check room access
      const allowed =
        await this.chatService.canJoinRoom(
          userId,
          roomId,
        );

      if (!allowed) {
        throw new WsException(
          'Access denied',
        );
      }

      // Save message
      const message =
        await this.chatService.createMessage(
          userId,
          roomId,
          messageText,
        );

      // Add sender name
      const messageWithSender = {
        ...message,
        senderName: userName,
      };

      // Broadcast to room
      this.server
        .to(roomId)
        .emit(
          'newMessage',
          messageWithSender,
        );

      console.log(
        `💬 ${userName} sent message in ${roomId}`,
      );

      return {
        success: true,
        message: messageWithSender,
      };
    } catch (error) {
      console.error(
        'Send message error:',
        error instanceof Error
          ? error.message
          : error,
      );

      if (error instanceof WsException) {
        throw error;
      }

      throw new WsException(
        'Unable to send message',
      );
    }
  }

  // ============================================
  // TYPING
  // ============================================

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: TypingDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { userId, userName } = socket.data;

    if (!userId) {
      throw new WsException(
        'Unauthorized',
      );
    }

    if (!data?.roomId?.trim()) {
      return;
    }

    const roomId = data.roomId.trim();

    // Send only to other users
    socket
      .to(roomId)
      .emit('userTyping', {
        userId,
        userName,
      });
  }
}