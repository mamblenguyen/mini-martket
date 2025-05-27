import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  slug: string;

  @Prop({ type: String })
  image: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
