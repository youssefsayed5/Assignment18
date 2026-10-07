// email.module.ts
import { Module } from '@nestjs/common';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EmailService } from './email.service.js';
import { env } from '../../config/env.service.js'; 

const __dirname = dirname(fileURLToPath(import.meta.url));

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: env.googleAccount,
          pass: env.passwordAccount,
        },
      },
      template: {
        dir: join(__dirname, 'template'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    } satisfies MailerOptions),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
