import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/apis/auth/UserSchema/user.schema';  // Adjust the import based on your project structure

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'default_secret_key'; 
        const decoded = jwt.verify(token, secret) as User; 

        req.user = decoded;  
      } catch (err) {
        console.error('Invalid token', err);
      }
    }

    next();
  }
}
