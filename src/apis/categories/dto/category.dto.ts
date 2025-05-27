import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateCategoryDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;
  
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
