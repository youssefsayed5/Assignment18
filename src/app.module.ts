import path from 'node:path';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { MongoConnectionModule } from './database/Monogo.connection.js';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { RedisConnectionModule } from './database/connectionRedis.js';
import { EmailModule } from './common/email/email.module.js';
import {MiddleWare} from './common/middleware/logger.middleware.js'

const envFilePath = path.resolve(
  process.cwd(),
  'src',
  'config',
  `${process.env.NODE_ENV ?? 'dev'}.env`,
);

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    MongoConnectionModule,
  RedisConnectionModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(MiddleWare).forRoutes(AppController)
  }
}
