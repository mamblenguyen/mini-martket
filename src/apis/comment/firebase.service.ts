import { Injectable } from '@nestjs/common';
import admin from "firebase-admin";
import serviceAccountRaw from '../../../src/providers/storage/firebase/keyfirebase.json';
const serviceAccount = serviceAccountRaw as admin.ServiceAccount;

@Injectable()
export class FirebaseService {
  private db: admin.database.Database;

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://mini-market-a2cb8-default-rtdb.asia-southeast1.firebasedatabase.app/',
      });
    }
    this.db = admin.database();
  }

  async addComment(data: {
    productId: string;
    userId: string;
    content: string;
    parentId?: string;
    userName?: string;
    avatar?:string
  }) {
    const createdAt = Date.now();
    const newCommentRef = this.db.ref(`comments/${data.productId}`).push();

    const commentData = {
      userId: data.userId,
      userName: data.userName || 'Ẩn danh',
      content: data.content,
      parentId: data.parentId || null,
      createdAt,
      avatar : data.avatar || null
    };

    await newCommentRef.set(commentData);
    return { id: newCommentRef.key };
  }

  async getCommentsByProduct(productId: string) {
    const snapshot = await this.db.ref(`comments/${productId}`).once('value');
    const comments = snapshot.val() || {};

    return Object.entries(comments)
      .map(([id, data]: any) => ({ id, ...(data as any) }))
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async getReplies(productId: string, parentId: string) {
    const snapshot = await this.db.ref(`comments/${productId}`).once('value');
    const comments = snapshot.val() || {};

    return Object.entries(comments)
      .filter(([_, data]: any) => data.parentId === parentId)
      .map(([id, data]: any) => ({ id, ...(data as any) }))
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async deleteComment(productId: string, commentId: string) {
    await this.db.ref(`comments/${productId}/${commentId}`).remove();
  }
}
