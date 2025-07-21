import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createComment(
    @Body()
    body: {
      productId: string;
      userId: string;
      content: string;
      parentId?: string;
      userName?: string;
    },
  ) {
    const result = await this.commentService.createComment(body);
    return result;
  }

  @Get('product/:productId')
  async getComments(@Param('productId') productId: string) {
    const comments = await this.commentService.getComments(productId);
    return comments;
  }

  @Get(':productId/replies/:parentId')
  getReplies(
    @Param('productId') productId: string,
    @Param('parentId') parentId: string,
  ) {
    return this.commentService.getReplies(productId, parentId);
  }

  @Delete(':productId/:commentId')
  deleteComment(
    @Param('productId') productId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.commentService.deleteComment(productId, commentId);
  }
}
