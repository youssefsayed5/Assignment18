import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { VerifyAuthDto } from './dto/verify-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { ResendOtpDto } from './dto/resend-otp.dto.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { imageUploadOptions } from '../../common/utils/multer/multer.js';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  signUp(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signUp(createAuthDto);
  }

  @Post('verify')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  verify(@Body() verifyAuthDto: VerifyAuthDto) {
    return this.authService.verifyEmail(verifyAuthDto);
  }

  @Post('resend-otp')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto.email);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: any) {
    return {
      message: 'Done',
      results: req.user,
    };
  }

  @Post('upload-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Image is required');

    return {
      message: 'Done',
      filename: file.filename,
      url: `${process.env.SERVER_URL || 'http://localhost:8000'}/uploads/${file.filename}`,
    };
  }
}
