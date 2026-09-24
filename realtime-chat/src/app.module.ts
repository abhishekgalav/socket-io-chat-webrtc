import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',

      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),

      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,

      database: process.env.DATABASE_NAME,

      autoLoadEntities: true,

      synchronize: true,
    }),
    AuthModule, 
    UsersModule, 
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
