import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { env } from '../config/env.service.js';

export const clientRedis = createClient({
  url: env.redisConnection as string,
});

clientRedis.on('error', (error) => {
  console.error('Redis Error:', error);
});

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: clientRedis,
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisConnectionModule {}
