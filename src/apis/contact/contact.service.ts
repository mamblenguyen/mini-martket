// contact.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from './email.service';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { CreateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private model: Model<ContactDocument>,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateContactDto) {
    const created = new this.model(dto);
    return created.save();
  }

  async findAll() {
    return this.model.find().sort({ createdAt: -1 });
  }

  async reply(id: string, replyContent: string) {
    const contact = await this.model.findById(id);
    if (!contact) throw new NotFoundException('Liên hệ không tồn tại');

    // Gửi email
    await this.emailService.sendReply(contact.email, replyContent, contact.fullname);

    // Cập nhật vào DB
    contact.reply = replyContent;
    contact.repliedAt = new Date();
    return contact.save();
  }
}
