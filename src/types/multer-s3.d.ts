// types/multer-s3.d.ts
import 'multer';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        location?: string; // Thêm location từ multer-s3
        key?: string;
        bucket?: string;
      }
    }
  }
}
