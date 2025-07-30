// src/types/multer-s3.d.ts
import 'multer';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        /** Tên gốc của file */
        originalname: string;

        /** Buffer chứa dữ liệu file */
        buffer: Buffer;

        /** MIME type của file */
        mimetype: string;

        /** Đường dẫn URL tới file sau khi upload (dành cho multer-s3) */
        location?: string;

        /** Tên file lưu trong S3 */
        key?: string;

        /** Tên bucket đã upload */
        bucket?: string;
      }
    }
  }
}

export {};
