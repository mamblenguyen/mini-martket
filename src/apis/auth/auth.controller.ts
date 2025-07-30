import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Response,
  Res,
  UnauthorizedException,
  Query,
  UseGuards,
  Req,
  Param,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/register.tdo';

import { HttpStatus, HttpMessage } from '@src/global/globalEnum';
import { ResponseData } from '@src/global/globalClass';
import { AuthGuard } from '@nestjs/passport';
import { response } from 'express';
import { User } from './UserSchema/user.schema';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { CreateGoogleUserDto } from './dto/create-google-user.dto';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { uploadToS3 } from '@src/providers/storage/aws-s3/upload-to-s3';

UnauthorizedException;
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Login with Google (google Auth20)
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async callback(@Req() req, @Res() res) {
    const jwt = await this.authService.loginGoogle(req.user);
    res.set('authorization', jwt.accessToken);

    res.cookie('token', jwt.accessToken, {
      sameSite: 'none',
      secure: true,
      httpOnly: false, // Chỉ server có thể truy cập cookie (tăng bảo mật)
      maxAge: 7 * 24 * 60 * 60 * 1000, // Thời gian sống của cookie (7 ngày)
    });
    res.cookie('refreshToken', jwt.refreshToken, {
      sameSite: 'none',
      secure: true,
      httpOnly: false,
    });
    res.cookie('typeLogin', 'google', {
      sameSite: 'none',
      secure: true,
    });
    res.redirect(`${process.env.BASEURL_FE}/home`);
  }
  @Get('LoginGoogle')
  @UseGuards(AuthGuard('jwt'))
  async testLogin(@Req() req, @Res() res) {
    try {
      const accessToken = await req.headers.authorization.split(' ')[1];
      const refreshToken =
        await this.authService.generateRefreshToken(accessToken);
      res.cookie('accessToken', accessToken, { httpOnly: true });
      res.cookie('refreshToken', refreshToken, { httpOnly: true });
      res.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  //Login with facebook

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return HttpStatus.SUCCESS;
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req, @Res() res): Promise<any> {
    const jwt = await this.authService.loginFacebook(req.user);
    res.set('authorization', jwt.accessToken);
    res.json({
      accessToken: jwt.accessToken,
      refreshToken: jwt.refreshToken,
    });
    return {
      accessToken: jwt.accessToken,
      refreshToken: jwt.refreshToken,
      statusCode: HttpStatus.SUCCESS,
    };
  }

  @Post('/register')
  @UseInterceptors(FileInterceptor('avatar'))
  async register(
    @Body() userDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseData<User | null>> {
    try {
      const savedUser = await this.authService.register(userDto, file);
      return new ResponseData<User>(
        savedUser,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error: any) {
      console.error('Registration error:', error.message);
      return new ResponseData<User | null>(
        null,
        HttpStatus.ERROR,
        error.message || HttpMessage.ERROR,
      );
    }
  }

  @Post('/google-login')
  async googleLoginFirebase(
    @Body() user: CreateGoogleUserDto,
  ): Promise<ResponseData<{ user: User; token: string }>> {
    try {
      const result = await this.authService.loginWithGoogle(user);
      return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error: any) {
      return new ResponseData<{ user: User; token: string } | null>(
        null,
        HttpStatus.ERROR,
        error.message || HttpMessage.ERROR,
      );
    }
  }

  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const device = loginDto.device || 'web'; // default to 'web'
      const { accessToken, refreshToken } = await this.authService.login(
        loginDto,
        device,
      );
      return { accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  @Post('/refresh-token')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { refresh_token, device = 'web' } = refreshTokenDto;

    try {
      const { accessToken, refreshToken } = await this.authService.refreshToken(
        refresh_token,
        device,
      );
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('/logout')
  async logout(
    @Body() body: any,
    // @Res() res,
  ): Promise<{ message: string }> {
    console.log(body);
    const { refresh_token } = body;

    try {
      await this.authService.logout(refresh_token);
      // res.clearCookie('accessToken');
      // res.clearCookie('refreshToken');
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
  @Post('/forgot-password')
  async forgotPassword(
    @Body() body: any,
    @Res() res,
  ): Promise<{ message: string }> {
    const { email } = body;
    try {
      await this.authService.forgotPassword(email);
      return res
        .status(200)
        .json({ message: 'Password reset email sent successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
  @Post('/reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    try {
      await this.authService.resetPassword(token, newPassword);
      return { message: 'Password reset successful' };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
@UseGuards(AuthGuard('jwt'))
@Get('me')
async getMe(@Req() req): Promise<ResponseData<User>> {
  try {
    const userId = req.user.id;
    const user = await this.authService.findOne(userId);
    return new ResponseData<User>(user, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new ResponseData<User>(null, HttpStatus.ERROR, HttpMessage.ERROR);
  }
}
    @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<User>> {
    try {
      const brand = await this.authService.findOne(id); // Lấy thông tin brand theo ID
      return new ResponseData<User>(
        brand,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error: any) {
      console.error('Error fetching topics:', error);
      return new ResponseData<User>(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseData<User>> {
    try {
      if (file) {
        const avatarUrl = await uploadToS3(file, 'avatar'); // upload lên S3
        updateUserDto.avatar = avatarUrl;
      }

      const updatedUser = await this.authService.update(id, updateUserDto);
      return new ResponseData<User>(
        updatedUser,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error: any) {
      console.error('Error updating user:', error);
      return new ResponseData<User>(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }

  @Post('change-password')
  async changePassword(@Body() dto: ChangePasswordDto) {
    const { userId, oldPassword, newPassword, confirmPassword } = dto;
    return await this.authService.changePassword(dto);
  }
}
