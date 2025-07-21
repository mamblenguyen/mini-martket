import { Injectable } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

@Injectable()
export class SmsService {
  private snsClient: SNSClient;

  constructor() {
    this.snsClient = new SNSClient({
      region: 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  private buildMessage(username: string, products: string[], price: number, address: string): string {
    const productList = products.join(', ');
    return `Xin cảm ơn quý khách ${username} đã đặt hàng thành công! Sản phẩm bao gồm: ${productList} với giá là ${price} tại địa chỉ ${address}. Đơn hàng đang được xác nhận và chuyển đến quý khách sớm nhất.`;
  }

  async sendSms(phoneNumber: string, username: string, products: string[], price: number, address: string) {
    const message = this.buildMessage(username, products, price, address);

    const command = new PublishCommand({
      Message: message,
      PhoneNumber: phoneNumber, // Ví dụ: +84901234567
    });

    try {
      const result = await this.snsClient.send(command);
      console.log('SMS sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
}
