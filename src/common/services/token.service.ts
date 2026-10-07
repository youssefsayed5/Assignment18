
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { UserRoleEnum } from '../enum/user.enum.js';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(
    userId: Types.ObjectId,
    email: string,
    role: string,
  ): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.configService.getOrThrow<string>(
      role.toUpperCase() === UserRoleEnum.ADMIN
        ? 'ADMIN_ACCESS_SIGNATURE'
        : 'USER_ACCESS_SIGNATURE',
    );

    const expiresIn = this.configService.getOrThrow<string>(
      role.toUpperCase() === UserRoleEnum.ADMIN
        ? 'JWT_EXPIRES_ADMIN'
        : 'JWT_EXPIRES_USER',
    );

    const option: any = {
      secret,
    };

    if (expiresIn) {
      option.expiresIn = expiresIn;
    }

    return this.jwtService.signAsync(payload, option);
  }

  async generateRefreshToken(
    userId: Types.ObjectId,
    email: string,
    role: string,
  ): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.configService.getOrThrow<string>(
      role.toUpperCase() === UserRoleEnum.ADMIN
        ? 'ADMIN_REFRESH_SIGNATURE'
        : 'USER_REFRESH_SIGNATURE',
    );

    const expiresIn = this.configService.getOrThrow<string>(
      role.toUpperCase() === UserRoleEnum.ADMIN
        ? 'JWT_EXPIRES_ADMIN_refresh'
        : 'JWT_EXPIRES_USER_refresh',
    );

    const option: any = {
      secret,
    };

    if (expiresIn) {
      option.expiresIn = expiresIn;
    }

    return this.jwtService.signAsync(payload, option);
  }

  async verifyToken(token: string, role: string): Promise<any> {
    try {
      const secret = this.configService.getOrThrow<string>(
        role.toUpperCase() === UserRoleEnum.ADMIN
          ? 'ADMIN_ACCESS_SIGNATURE'
          : 'USER_ACCESS_SIGNATURE',
      );

      return await this.jwtService.verifyAsync(token, {
        secret,
      });
    } catch (err) {
      console.log('ACCESS TOKEN ERROR:', err);

      throw new BadRequestException('Not verified 1');
    }
  }

  async refreshToken(token: string, role: string): Promise<string> {
    try {
      const secret = this.configService.getOrThrow<string>(
        role.toUpperCase() === UserRoleEnum.ADMIN
          ? 'ADMIN_REFRESH_SIGNATURE'
          : 'USER_REFRESH_SIGNATURE',
      );

      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      return this.generateToken(
        new Types.ObjectId(payload.sub),
        payload.email,
        role,
      );
    } catch (err) {
      console.log('REFRESH TOKEN ERROR:', err);

      throw new BadRequestException('Not verified 2');
    }
  }

  async decodeToken(token: string): Promise<any> {
    try {
      return this.jwtService.decode(token);
    } catch (err) {
      console.log('DECODE TOKEN ERROR:', err);

      throw new BadRequestException('Not verified 3');
    }
  }
}
