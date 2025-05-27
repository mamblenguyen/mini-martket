import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Product, ProductSchema } from '../product/schemas/product.schema';

// order.module.ts
@Module({
    imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema } , {
      name: Product.name, schema: ProductSchema 
    }])],
    controllers: [OrderController],
    providers: [OrderService],
  })
  export class OrderModule {}
  