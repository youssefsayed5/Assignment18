import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
  Min,
} from 'class-validator';

import { GenderEnum } from '../../../common/index.js';

export class GetProfileAuthDto {
  
  @IsString({ message: 'First name must be a string' })
  @Length(3, 20, { message: 'First name must be between 3 and 20 characters' })
  fname: string;

  @IsString({ message: 'Last name must be a string' })
  @Length(3, 20, { message: 'Last name must be between 3 and 20 characters' })
  lname: string;

  @IsString({ message: 'Username must be a string' })
  @Length(3, 20, { message: 'Username must be between 3 and 20 characters' })
  username: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;


  @IsOptional()
  @IsPhoneNumber('EG', {
    message: 'Please provide a valid Egyptian phone number',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsInt({ message: 'Age must be a whole number' })
  @Min(0, { message: 'Age cannot be negative' })
  age?: number;

  @IsOptional()
  @IsEnum(GenderEnum, { message: 'Gender must be either male or female' })
  gender?: GenderEnum;
}
