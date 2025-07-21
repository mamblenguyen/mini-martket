import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  stock?: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' })
  brand: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' })
  supplier: mongoose.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variant' }] })
  variants: mongoose.Types.ObjectId[];

  @Prop()
  barcodeImage : string;

  @Prop()
  barcode : string;
  @Prop()
  slug : string;
  
  @Prop({ type: [String], default: [] })
  images: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
