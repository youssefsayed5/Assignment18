


import {
    IsBoolean,
  IsEmail,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class LoginAuthDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsStrongPassword(
    {},
    {
      message:
        'Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol',
    },
  )
  password:string



}
