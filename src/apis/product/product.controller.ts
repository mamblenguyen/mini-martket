import { Controller, Post, Get, Put, Delete, Param, Body, UseInterceptors, UploadedFile, UploadedFiles, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product.dto';
import {  FilesInterceptor } from '@nestjs/platform-express';
import { ResponseData } from '@src/global/globalClass';
import { HttpMessage, HttpStatus } from '@src/global/globalEnum';
import { Product } from './schemas/product.schema';
import { memoryStorage } from 'multer';
import { uploadToS3 } from '@src/providers/storage/aws-s3/upload-to-s3';
import { AuthGuard } from '@nestjs/passport';
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @UseGuards(AuthGuard('jwt'))

  @Post()
@UseInterceptors(
  FilesInterceptor('images', 5, {
    storage: memoryStorage(), // giữ file trong RAM, chưa upload ngay
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }),
)
async create(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() createProductDto: CreateProductDto,
) {
  try {
    const imageUrls = files?.length
      ? await Promise.all(files.map(file => uploadToS3(file, 'product')))
      : [];

    createProductDto.images = imageUrls;

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
    @UseGuards(AuthGuard('jwt'))

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

@Get('slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
     try {
       const variant = await this.productService.findOneBySlug(slug);
       return new ResponseData(variant, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
     } catch (error) {
       console.error('Error fetching topics:', error);
       return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
     }
   }


   @Get('related/:slug')
async findRelated(@Param('slug') slug: string) {
  try {
    const relatedProducts = await this.productService.findRelatedProductsByCategory(slug);
    return new ResponseData(relatedProducts, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
  }
}
  @UseGuards(AuthGuard('jwt'))

 @Put(':id')
@UseInterceptors(
  FilesInterceptor('images', 5, {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  }),
)
async update(
  @Param('id') id: string,
  @UploadedFiles() files: Express.Multer.File[],
  @Body() updateProductDto: CreateProductDto,
) {
  try {
    const newImageUrls = files?.length
      ? await Promise.all(files.map(file => uploadToS3(file, 'product')))
      : [];

    updateProductDto.images = [
      ...(updateProductDto.images || []),
      ...newImageUrls,
    ];

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

  
    @UseGuards(AuthGuard('jwt'))

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
