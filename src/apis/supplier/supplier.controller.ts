import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/supplier.dto';
import { SupplierService } from './supplier.service';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async create(@Body() createBrandDto: CreateSupplierDto) {
    try {
      const brand = await this.supplierService.create(createBrandDto);
      return new ResponseData(brand, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }

  @Get()
  async findAll() {
    try {
      const brand = await this.supplierService.findAll();
      return new ResponseData(brand, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const brand = await this.supplierService.findOne(id);
      return new ResponseData(brand, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }

 @Get('slug/:slug')
  async findOneSlug(@Param('slug') slug: string) {
    try {
      const brand = await this.supplierService.findOneBySlug(slug);
      return new ResponseData(brand, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }


  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBrandDto: CreateSupplierDto) {
    try {
      const brand = await this.supplierService.update(id, updateBrandDto);
      return new ResponseData(brand, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const brand = await this.supplierService.remove(id);
      return new ResponseData(brand, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }
}
