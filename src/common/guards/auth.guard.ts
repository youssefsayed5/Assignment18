import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { TokenService } from '../services/token.service.js';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../database/Model/user.model.js';
import { Model } from 'mongoose';
import { UserRoleEnum } from '../enum/user.enum.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHandler = request.headers.authorization;

    if (!authHandler) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [roleSchema, token] = authHandler.split(' ');
    const role = roleSchema?.toLowerCase();

    if (!token || (role !== UserRoleEnum.USER && role !== UserRoleEnum.ADMIN)) {
      throw new UnauthorizedException('Invalid authorization');
    }

    const payload = await this.tokenService.verifyToken(token, role);

    const userDoc = await this.userModel
      .findById(payload.sub)
      .select('-password');

    if (!userDoc) {
      throw new UnauthorizedException('User not found');
    }

    request.user = userDoc;

    return true;
  }
}
