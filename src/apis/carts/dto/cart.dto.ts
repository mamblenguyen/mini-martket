import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}


export class UpdateCartItemDto {
  @IsString()
  userId: string;

  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class RemoveCartItemDto {
  @IsString()
  userId: string;

  @IsString()
  productId: string;
}

export class ClearCartDto {
  @IsString()
  userId: string;
}