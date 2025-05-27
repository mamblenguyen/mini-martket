import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Supplier {
  @Prop()
  name: string;

  @Prop()
  contact?: string;

  @Prop()
  address?: string;

  @Prop()
  slug?: string;
}

export type SupplierDocument = Supplier & Document;
export const SupplierSchema = SchemaFactory.createForClass(Supplier);
