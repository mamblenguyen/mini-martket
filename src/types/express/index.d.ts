import { UserPayload } from '../../interfaces/user.interface'; // hoặc đường dẫn đến kiểu `UserPayload` bạn dùng

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
