import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string; // Có thể là URL hoặc đường dẫn ảnh

  @IsOptional()
  @IsString()
  typeLogin?: string; // Có thể là URL hoặc đường dẫn ảnh
}

export class ChangePasswordDto {
  @IsOptional()
  @IsString()
  userId : string;
  @IsOptional()
  @IsString()
  oldPassword: string;
  @IsOptional()
  @IsString()
  newPassword: string;
  @IsOptional()
  @IsString()
  confirmPassword: string;
}