import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class CommentService {
  constructor(private firebaseService: FirebaseService) {}

  createComment(data: {
    productId: string;
    userId: string;
    content: string;
    parentId?: string;
    avatar?:string
  }) {
    return this.firebaseService.addComment(data);
  }

  getComments(productId: string) {
    return this.firebaseService.getCommentsByProduct(productId);
  }

  deleteComment(productId: string, commentId: string) {
    return this.firebaseService.deleteComment(productId, commentId);
  }

  getReplies(productId: string, parentId: string) {
    return this.firebaseService.getReplies(productId, parentId);
  }
}
