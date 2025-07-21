import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import slugify from 'slugify';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum TypeLogin {
  GOOGLE = 'google',
  BASIC = 'basic',
}

@Schema({ timestamps: true })
export class User {
  _id: string;

  @Prop({ required: true, unique: true })
  email: string;

  // @Prop({ required: true })
  // password: string;

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: false })
  address?: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false, type: Date })
  birthday?: Date;

  @Prop({ required: false, default: '' })
password?: string;

@Prop({ required: false, default: '' })
phone?: string;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop()
  slug: string;

  @Prop({ default: null })
  refreshToken: string | null;

  @Prop({ default: null })
  refreshTokenMobile: string | null;

  @Prop({ default: null })
  passwordResetToken: string | null;

  @Prop({ default: null })
  passwordResetExpires: string | null;

  @Prop({ enum: TypeLogin, default: TypeLogin.BASIC })
  typeLogin: string;

  @Prop({ default: true })
  active: boolean;

  async generateSlug() {
    this.slug = slugify(this.fullname, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
