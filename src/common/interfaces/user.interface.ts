import { GenderEnum, providerEnum, UserRoleEnum } from '../enum/user.enum.js';

export interface IUser {
  id: string;
  username: string;
  fname: string;
  lname: string;
  unique_name: string;
  email: string;
  password?: string;
  passwordChangedAt?: Date;
  age: number;
  phone: string;
  profileImage?: string;
  confirmEmail: boolean;
  isBlocked?: boolean;
  gender?: GenderEnum;
  role?: UserRoleEnum;
  provider?: providerEnum;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserUpdateData {
  name?: string;
  username?: string;
  unique_name?: string;
  phone?: string;
  phoneNumber?: string;
  profileImage?: string;
  password?: string;
  newPassword?: string;
  uniqueName?: string;
  bio?: string;
  age?: number | string;
  gender?: GenderEnum;
}
