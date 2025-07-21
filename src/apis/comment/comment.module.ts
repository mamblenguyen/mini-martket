// comment.module.ts
import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { FirebaseService } from './firebase.service';

@Module({
  controllers: [CommentController],
  providers: [CommentService, FirebaseService],
})
export class CommentModule {}
