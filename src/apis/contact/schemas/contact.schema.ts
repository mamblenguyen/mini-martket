// contact.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  description: string;

  @Prop({ default: null })
  reply: string;

  @Prop({ default: null })
  repliedAt: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
