import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

export const MongoConnectionModule = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    uri: configService.getOrThrow<string>('DATABASE_URL'),
    onConnectionCreate: (connection: Connection): void => {
      connection.on('connected', () => {
        console.log(`Mongoose connected successfully`);
      });
    },
  }),
});
