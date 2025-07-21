import { IsOptional, IsString } from "class-validator";

// dto/create-contact.dto.ts
export class CreateContactDto {
  @IsOptional()
  @IsString()
  fullname: string;
   @IsOptional()
  @IsString()
  email: string;
   @IsOptional()
  @IsString()
  phone: string;
   @IsOptional()
  @IsString()
  description: string;
}

// dto/reply-contact.dto.ts
export class ReplyContactDto {
     @IsOptional()
  @IsString()
  reply: string;
}
