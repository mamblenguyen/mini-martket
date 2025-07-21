// email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import mjml2html from 'mjml';
import { transporter } from 'src/providers/mail/mailler';

@Injectable()
export class EmailService {
  async sendReply(to: string, replyContent: string, fullname: string) {
    const mjmlPath = path.join(__dirname, 'templates', 'reply.mjml');
    let mjmlTemplate = fs.readFileSync(mjmlPath, 'utf8');
    mjmlTemplate = mjmlTemplate
      .replace('{{fullname}}', fullname)
      .replace('{{reply}}', replyContent);

    const { html } = mjml2html(mjmlTemplate);

    await transporter.sendMail({
      from: '"Hỗ trợ khách hàng" <your-email@gmail.com>',
      to,
      subject: `Phản hồi từ đội ngũ hỗ trợ`,
      html,
    });
  }
}
