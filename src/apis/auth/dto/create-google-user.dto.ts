import { IsEmail, IsString } from 'class-validator';

export class CreateGoogleUserDto {
  @IsEmail()
  email?: string;

  @IsString()
  fullname?: string;
  
  @IsString()
  avatar?: string;
}
