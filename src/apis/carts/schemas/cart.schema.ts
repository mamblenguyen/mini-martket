import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';


export type CartDocument = Cart & Document;

@Schema({ _id: false }) // embedded schema, không tạo _id riêng
export class CartItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, default: 1 })
  quantity: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
