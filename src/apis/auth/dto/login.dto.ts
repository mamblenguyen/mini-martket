import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn, IsOptional } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email' })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  readonly password: string;

  @IsOptional()
  @IsIn(['web', 'mobile'], { message: 'Device must be either web or mobile' })
  readonly device?: 'web' | 'mobile';
}
