import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNotEmpty()
  @IsString()
  product: string;

  @IsNumber()
  quantity: number;
}

class ShippingAddressDto {
  @IsNotEmpty()
  @IsString()
  recipientName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}

export class CreateOrderDto {
  @IsEnum(['store', 'delivery'])
  orderType: 'store' | 'delivery';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // @Type(() => Number)
  // @IsNumber()
  // totalAmount: number;
  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
  @IsOptional()
  @IsString()
  status?: string;
  @IsOptional()
  @IsString()
  note?: string;
  @IsOptional()
  @IsString()
  user?: string;
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;
}
export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum([
    'pending',
    'purched',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'completed',
  ])
  status: string;
}
