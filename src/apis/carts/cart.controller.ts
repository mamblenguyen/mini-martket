import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Types } from 'mongoose';
import { AddToCartDto, ClearCartDto, RemoveCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { AuthGuard } from '@nestjs/passport';

// DTO
@UseGuards(AuthGuard('jwt'))
@Controller('cart')
// @UseGuards(AuthGuard) // Nếu có auth guard thì bật lên nhé
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Thêm sản phẩm vào giỏ hàng
@Post('add')
  async addToCart(@Body() dto: AddToCartDto) {
    return this.cartService.addToCart(dto.userId, dto.productId, dto.quantity);
  }

  // Đặt route tạo đơn vận chuyển trước route get cart theo userId
  @Get('create-shipping-order')
  async createOrder() {
    return this.cartService.createShippingOrder();
  }

  @Get(':userId')
  async getCart(@Param('userId') userId: string) {
    return this.cartService.getCartByUser(userId);
  } 

  @Put('update')
  async updateItem(@Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(dto.userId, dto.productId, dto.quantity);
  }

  @Delete('remove')
  async removeItem(@Body() dto: RemoveCartItemDto) {
    return this.cartService.removeItem(dto.userId, dto.productId);
  }

  @Delete('clear')
  async clearCart(@Body() dto: ClearCartDto) {
    return this.cartService.clearCart(dto.userId);
  }
}
