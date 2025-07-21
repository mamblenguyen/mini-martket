import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    enum: ['store', 'delivery'],
    required: true,
    default: 'store',
  })
  orderType: 'store' | 'delivery';

  @Prop([
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ])
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({
    default: 'pending',
    enum: [
      'pending',
      'purched',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'completed',
    ],
  })
  status: string;

  @Prop({
    type: {
      recipientName: { type: String },
      phone: { type: String },
      address: { type: String },
    },
  })
  shippingAddress?: {
    recipientName?: string;
    phone?: string;
    address?: string;
  };

  @Prop()
  paymentMethod?: string;

  @Prop()
  note?: string;

  // Thêm trường mã đơn hàng
  @Prop({ required: true, unique: true })
  orderCode: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
