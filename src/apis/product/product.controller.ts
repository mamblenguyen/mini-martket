import { Controller, Post, Get, Put, Delete, Param, Body, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product.dto';
import {  FilesInterceptor } from '@nestjs/platform-express';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { Product } from './schemas/product.schema';
import { memoryStorage } from 'multer';
import { uploadToS3 } from 'src/providers/storage/aws-s3/upload-to-s3';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(), // ❗ giữ file trong RAM, không upload ngay
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
    async create(
      @UploadedFiles() files: Express.Multer.File[],
      @Body() createProductDto: CreateProductDto,
    ) {
      try {
        if (files?.length > 0) {
          const imageUrls = await Promise.all(files.map(file => uploadToS3(file , 'product')));
          createProductDto.images = imageUrls;
        }

        const product = await this.productService.createWithBarcode(createProductDto);
        return new ResponseData<Product>(
          product,
          HttpStatus.SUCCESS,
          HttpMessage.SUCCESS,
        );
      } catch (error) {
        console.error('Error creating product:', error);
        return new ResponseData<Product>(
          null,
          HttpStatus.ERROR,
          HttpMessage.ERROR,
        );
      }
    }
  
  @Get()
 async findAll() {
    try {
      const variant = await this.productService.findAll();
      return new ResponseData(variant, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }

  @Get(':id')
 async findOne(@Param('id') id: string) {
    try {
      const variant = await this.productService.findOne(id);
      return new ResponseData(variant, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }
  @Get('barcode/:barcode')
  async findOneByBarcode(@Param('barcode') barcode: string) {
     try {
       const variant = await this.productService.findOneByBarcode(barcode);
       return new ResponseData(variant, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
     } catch (error) {
       console.error('Error fetching topics:', error);
       return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
     }
   }

  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(), // ảnh chưa được upload lên S3
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() updateProductDto: CreateProductDto,
  ) {
    try {
      if (files?.length > 0) {
        const imageUrls = await Promise.all(files.map(file => uploadToS3(file, 'product')));
        updateProductDto.images = [
          ...(updateProductDto.images || []), // ảnh cũ nếu có
          ...imageUrls,
        ];
      }
  
      const product = await this.productService.update(id, updateProductDto);
  
      return new ResponseData<Product>(
        product,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      console.error('Error updating product:', error);
      return new ResponseData<Product>(
        null,
        HttpStatus.ERROR,
        HttpMessage.ERROR,
      );
    }
  }
  
  
  @Delete(':id')
 async remove(@Param('id') id: string) {
    try {
      const variant = await this.productService.remove(id);
      return new ResponseData(variant, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }
}
