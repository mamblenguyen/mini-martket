import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsMongoId,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;


  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  price: number;
  
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsMongoId()
  brand: string;

  @IsMongoId()
  supplier: string;
  @IsMongoId()
  category: string;

  @IsMongoId({ each: true })
  variants: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // mỗi phần tử trong mảng phải là string
  images?: string[];

}
