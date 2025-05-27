import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
