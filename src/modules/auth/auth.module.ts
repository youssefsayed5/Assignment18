import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD, Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerStorage,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { UserModel } from '../../database/Model/user.model.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { EmailModule } from '../../common/email/email.module.js';
import { TokenModule } from '../../common/services/token.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserModel }]),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    EmailModule,
    TokenModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useFactory: (
        options: ThrottlerModuleOptions,
        storage: ThrottlerStorage,
        reflector: Reflector,
      ) => new ThrottlerGuard(options, storage, reflector),
      inject: ['THROTTLER:MODULE_OPTIONS', ThrottlerStorage, Reflector],
    },
  ],
})
export class AuthModule {}
