import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token is required' })
  refresh_token: string;

  @IsOptional()
  @IsIn(['web', 'mobile'], { message: 'Device must be either web or mobile' })
  device?: 'web' | 'mobile';
}
