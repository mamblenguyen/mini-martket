// comment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: null })
  parentId?: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
