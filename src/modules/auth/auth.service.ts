import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { VerifyAuthDto } from './dto/verify-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { IUser } from '../../common/interfaces/user.interface.js';
import { otpGenerator } from '../../common/otp/otp.js';
import { hashWord, compareWord } from '../../common/security/HashWord.js';
import { EmailService } from '../../common/email/email.service.js';
import { TokenService } from '../../common/services/token.service.js';
import { GetProfileAuthDto } from './dto/getprofile.dto.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

type AuthUser = IUser & {
  otp?: string;
  otpExpiresAt?: Date;
  otpSentAt?: Date;
  otpAttempts?: number;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<AuthUser>,
    private readonly emailService: EmailService,
    private readonly jwt_token: TokenService,
  ) {}

  private async sendOtpEmail(
    email: string,
    name: string,
    otp: string | number,
  ): Promise<void> {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Email Confirmation',
      template: 'confirmation',
      context: {
        name,
        otp,
        expiresInMinutes: OTP_TTL_MS / 60000,
      },
    });
  }

  async signUp(createAuthDto: CreateAuthDto): Promise<{ message: string }> {
    const email = createAuthDto.email.toLowerCase();

    const existing = await this.userModel.findOne({
      $or: [{ email }, { username: createAuthDto.username }],
    });

    if (existing) {
      throw new ConflictException(
        existing.email === email
          ? 'Email already exists'
          : 'Username already exists',
      );
    }

    const otp = otpGenerator();
    const [hashedOtp, hashedPassword] = await Promise.all([
      hashWord(String(otp)),
      hashWord(createAuthDto.password),
    ]);

    let user;
    try {
      user = await this.userModel.create({
        fname: createAuthDto.fname,
        lname: createAuthDto.lname,
        username: createAuthDto.username,
        email,
        password: hashedPassword,
        phone: createAuthDto.phoneNumber,
        age: createAuthDto.age,
        gender: createAuthDto.gender,
        confirmEmail: false,
        otp: hashedOtp,
        otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
        otpSentAt: new Date(),
        otpAttempts: 0,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Email or username already exists');
      }
      throw error;
    }

    try {
      await this.sendOtpEmail(user.email, user.fname, otp);
    } catch (error) {
      await this.userModel.deleteOne({ _id: user._id });
      throw error;
    }

    return {
      message: 'Account created. Check your email for the confirmation code.',
    };
  }

  async verifyEmail(
    verifyAuthDto: VerifyAuthDto,
  ): Promise<{ message: string }> {
    const email = verifyAuthDto.email.toLowerCase();
    const user = await this.userModel.findOne({ email }).select('+otp');

    if (!user) {
      throw new BadRequestException('Invalid or expired code');
    }

    if (user.confirmEmail) {
      return { message: 'Email already confirmed' };
    }

    if (
      !user.otp ||
      !user.otpExpiresAt ||
      new Date() > user.otpExpiresAt ||
      (user.otpAttempts ?? 0) >= OTP_MAX_ATTEMPTS
    ) {
      throw new BadRequestException('Invalid or expired code');
    }

    const isOtpValid = await compareWord(String(verifyAuthDto.otp), user.otp);

    if (!isOtpValid) {
      user.otpAttempts = (user.otpAttempts ?? 0) + 1;
      if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
        user.otp = undefined;
        user.otpExpiresAt = undefined;
      }
      await user.save();
      throw new BadRequestException('Invalid or expired code');
    }

    user.confirmEmail = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.otpSentAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    return { message: 'Email confirmed successfully' };
  }

  async resendOtp(rawEmail: string): Promise<{ message: string }> {
    const email = rawEmail.toLowerCase();
    const genericResponse = {
      message: 'If the account exists, a new code was sent.',
    };

    const user = await this.userModel.findOne({ email }).select('+otp');

    if (!user || user.confirmEmail) {
      return genericResponse;
    }

    if (
      user.otpSentAt &&
      Date.now() - user.otpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      throw new HttpException(
        'Please wait before requesting another code',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = otpGenerator();
    user.otp = await hashWord(String(otp));
    user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    user.otpSentAt = new Date();
    user.otpAttempts = 0;
    await user.save();

    await this.sendOtpEmail(user.email, user.fname, otp);

    return genericResponse;
  }

  async login(
    loginAuthDto: LoginAuthDto,
  ): Promise<{ message: string; access_token: string; refreshToken: string }> {
    const user = await this.userModel
      .findOne({ email: loginAuthDto.email.toLowerCase() })
      .select('+password');

    const isPasswordValid =
      !!user &&
      (await compareWord(loginAuthDto.password, user.password as string));

    if (!user || !isPasswordValid || !user.confirmEmail) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = String(
      await this.jwt_token.generateToken(
        user._id,
        user.email,
        user.role || 'user',
      ),
    );

    const refreshToken = String(
      await this.jwt_token.generateRefreshToken(
        user._id,
        user.email,
        user.role || 'user',
      ),
    );
    return {
      message: 'done',
      access_token,
      refreshToken,
    };
  }

  async getProfile(
    getprofile: GetProfileAuthDto,
  ): Promise<{ message: string; userid: AuthUser }> {
    if (!getprofile.email) {
      throw new BadRequestException('Email is required');
    }

    const userid = await this.userModel.findOne({
      email: getprofile.email,
    });

    if (!userid) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Done',
      userid,
    };
  }
}