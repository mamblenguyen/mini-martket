import { Controller, Post, Body } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  async sendSms(@Body() body: {
    phoneNumber: string;
    username: string;
    products: string[];
    price: number;
    address: string;
  }) {
    return this.smsService.sendSms(
      body.phoneNumber,
      body.username,
      body.products,
      body.price,
      body.address,
    );
  }
}
