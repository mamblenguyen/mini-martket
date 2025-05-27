import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Brand {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  logo?: string;

  @Prop()
  slug?: string;
}

export type BrandDocument = Brand & Document;
export const BrandSchema = SchemaFactory.createForClass(Brand);
