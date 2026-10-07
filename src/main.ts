import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { env } from './config/env.service.js'; 
import { compareWord, hashWord } from './common/security/HashWord.js';
import { UseInterceptors, ValidationPipe } from '@nestjs/common';
import {ResponseInterceptor} from './Interceptors/transform.interceptor.js'
import { LoggingInterceptor } from './Interceptors/logger.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);  

UseInterceptors(ResponseInterceptor);
UseInterceptors(LoggingInterceptor);


  await app.listen(env.port);
  console.log(`Server is running.......`);
}

await bootstrap();
