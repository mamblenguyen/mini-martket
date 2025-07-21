import { User } from 'src/apis/auth/UserSchema/user.schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
