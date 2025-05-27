import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Variant {
  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop()
  stock?: number;
@Prop()
  slug?: string;

  @Prop()
  description?: string;

  @Prop()
  image?: string;
  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  // product: mongoose.Types.ObjectId; // biết thuộc về product nào
}

export type VariantDocument = Variant & Document;
export const VariantSchema = SchemaFactory.createForClass(Variant);
