import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

import { GenderEnum, UserRoleEnum, providerEnum } from '../../common/index.js';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true, versionKey: false },
})
export class User {
  @Prop({
    type: String,
    required: [true, 'First name is required'],
    minlength: [3, 'First name must be at least 3 characters'],
    maxlength: [20, 'First name must be at most 20 characters'],
    trim: true,
  })
  fname: string;

  @Prop({
    type: String,
    required: [true, 'Last name is required'],
    minlength: [3, 'Last name must be at least 3 characters'],
    maxlength: [20, 'Last name must be at most 20 characters'],
    trim: true,
  })
  lname: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, 'Username is required'],
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username must be at most 20 characters'],
    trim: true,
  })
  username: string;

  @Prop({
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  })
  email: string;

  @Prop({ type: Boolean, default: false })
  confirmEmail: boolean;

  @Prop({
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  })
  password: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: Number, min: [0, 'Age cannot be negative'] })
  age?: number;

  @Prop({ type: Date })
  changedPasswordAt?: Date;

  @Prop({
    type: String,
    enum: {
      values: Object.values(GenderEnum),
      message: '{VALUE} is not a valid gender',
    },
  })
  gender?: GenderEnum;

  @Prop({
    type: String,
    enum: {
      values: Object.values(providerEnum),
      message: '{VALUE} is not a valid provider',
    },
    default: providerEnum.SYSTEM,
  })
  provider?: providerEnum;

  @Prop({
    type: String,
    enum: {
      values: Object.values(UserRoleEnum),
      message: '{VALUE} is not a valid role',
    },
    default: UserRoleEnum.USER,
  })
  role?: UserRoleEnum;

  @Prop({ type: String })
  profileImage?: string;

  @Prop({ type: Date })
  deletedAt?: Date;
  @Prop({ type: Date })
  createdAt: Date;
  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: String, select: false })
  otp?: string;

  @Prop({ type: Date })
  otpExpiresAt?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserModel = SchemaFactory.createForClass(User);

UserModel.virtual('fullName').get(function (this: UserDocument) {
  return `${this.fname} ${this.lname}`;
});
