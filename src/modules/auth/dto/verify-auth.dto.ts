import {
  IsEmail,
  IsString,
} from 'class-validator';

export class VerifyAuthDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'OTP must be a string' })
  otp:string


}
