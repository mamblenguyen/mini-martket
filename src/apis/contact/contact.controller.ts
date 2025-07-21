// contact.controller.ts
import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, ReplyContactDto } from './dto/contact.dto';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @Get()
  async findAll() {
    return this.contactService.findAll();
  }

  @Patch(':id/reply')
  async reply(@Param('id') id: string, @Body() dto: ReplyContactDto) {
    return this.contactService.reply(id, dto.reply);
  }
}
