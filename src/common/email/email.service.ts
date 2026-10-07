// email.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { env } from '../../config/env.service.js'; 

export interface SendEmailOptions<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  to: string;
  subject: string;
  template: string;
  context?: T;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail({
    to,
    subject,
    template,
    context,
  }: SendEmailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail({
        from: `"Your App" <${env.googleAccount}>`,
        to,
        subject,
        template,
        context,
      });

      this.logger.log(`Email sent: "${subject}"`);
    } catch (error) {
      this.logger.error(
        `Failed to send email "${subject}"`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
