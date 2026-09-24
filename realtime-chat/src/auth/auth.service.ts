import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import {
  JwtService,
} from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,

    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    name: string,
  ) {

    const existing =
      await this.usersService.findByEmail(email);

    if (existing) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await this.usersService.create({
        email,
        password: hashedPassword,
        name,
      });

    return this.generateToken(user);
  }

  async login(
    email: string,
    password: string,
  ) {

    const user =
      await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const valid =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!valid) {
      throw new UnauthorizedException();
    }

    return this.generateToken(user);
  }

  private generateToken(user: any) {

    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      accessToken:
        this.jwtService.sign(payload),

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}