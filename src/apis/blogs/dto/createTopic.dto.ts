import { IsString, IsOptional } from 'class-validator';

export class CreateTopicDto {
    @IsString()
    name: string;
  
    @IsString()
    description: string;
  
    @IsOptional()
    @IsString()
    title?: string;
  
    @IsOptional()
    @IsString()
    slug?: string;
  }
  
