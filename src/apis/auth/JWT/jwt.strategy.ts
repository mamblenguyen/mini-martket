// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { PassportStrategy } from '@nestjs/passport';
// import { Model } from 'mongoose';
// import { Strategy, ExtractJwt } from 'passport-jwt';
// import { User } from '../UserSchema/user.schema';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
  
//   constructor(
    
//     @InjectModel(User.name)
//     private userModel: Model<User>,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET,
//     });
//   }

//   async validate(payload) {
//         console.log('token : ' , process.env.JWT_SECRET);

//     const { id, email } = payload;

//     const user = await this.userModel.findOne({ 
//       $or: [{ _id: id }, { email: email }] 
//     });
//     if (!user) {
//       throw new UnauthorizedException('Login first to access this endpoint.');
//     }

//     return user;
//   }
// }

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User } from '../UserSchema/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // DÙNG ConfigService
    });
  }

  async validate(payload: any) {
    const { id, email } = payload;

    const user = await this.userModel.findOne({
      $or: [{ _id: id }, { email: email }],
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized: Token is invalid or user not found.');
    }

    return user; // Đây là giá trị sẽ inject vào `@Request()`
  }
}
