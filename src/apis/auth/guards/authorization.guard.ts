import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '../UserSchema/user.schema';

interface DecodedToken {
    role: UserRole;
}

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
            return false;  // No token provided
        }

        try {
            const secret = process.env.JWT_SECRET || 'default_secret_key'; // Add a fallback

            const decoded = jwt.verify(token, secret) as unknown;

            const userRole = decoded as DecodedToken; // Cast the decoded token to DecodedToken
            if (userRole.role === UserRole.ADMIN) {
                return true;
            } else {
                return false;
            }
        } catch (err: any) {
            if (err instanceof jwt.TokenExpiredError) {
                console.log('Token has expired');
            } else {
                console.log('Token authentication error:', err.message);
            }
            return false;  // In case of any error (expired or invalid token), return false
        }
    }
}
