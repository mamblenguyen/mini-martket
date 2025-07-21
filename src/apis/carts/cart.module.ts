import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { UserSchema } from '../auth/UserSchema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      {
        name: Product.name,
        schema: ProductSchema,
      },
     { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService, MongooseModule], // Cho phép product sử dụng category
})
export class CartModule {}
