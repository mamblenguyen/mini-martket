import { Injectable } from '@nestjs/common';
import admin from "firebase-admin";
import * as fs from 'fs';


@Injectable()
export class FirebaseService {
  private db: admin.database.Database;

  constructor() {
    const serviceAccountPath =
      process.env.NODE_ENV === 'production'
        ? '/etc/secrets/keyfirebase.json' // đường dẫn thực tế trên Render
        : './src/providers/storage/firebase/keyfirebase.json'; // đường dẫn local

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Không tìm thấy file keyfirebase.json tại ${serviceAccountPath}`);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DB_URL,
      });
    }

    this.db = admin.database();
  }

 async addComment(data: any) {
  if (!data || !data.productId || !data.userId || !data.content) {
    throw new Error('Thiếu dữ liệu bắt buộc: productId, userId hoặc content');
  }

  const createdAt = Date.now();
  const newCommentRef = this.db.ref(`comments/${data.productId}`).push();

  const commentData = {
    userId: data.userId,
    userName: data.userName || 'Ẩn danh',
    content: data.content,
    parentId: data.parentId || null,
    createdAt,
    avatar: data.avatar || null,
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
