import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { CreateVariantDto } from './dto/variant.dto';
import { VariantService } from './variant.service';
import { extname } from 'path';
import multerS3 from 'multer-s3';
// import { s3Client } from 'src/providers/storage/aws-s3/aws.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseData } from '@src/global/globalClass';
import { HttpMessage, HttpStatus } from '@src/global/globalEnum';
import { Variant } from './schemas/variant.schema';
import { uploadToS3 } from '@src/providers/storage/aws-s3/upload-to-s3';
import { memoryStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
// const multerS3Storage = multerS3({
//   s3: s3Client, // Sử dụng client S3 đã cấu hình
//   bucket: process.env.AWS_S3_BUCKET!, // Bucket của bạn
//   contentType: multerS3.AUTO_CONTENT_TYPE, // Tự động xác định loại nội dung
//   key: (req, file, cb) => {
//     cb(
//       null,
//       `variant/${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`,
//     );
//   },
// });
  @UseGuards(AuthGuard('jwt'))

@Controller('variant')
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createVariantDto: CreateVariantDto,
  ) {
    try {
      if (file) {
        const imageUrl = await uploadToS3(file, 'variant');
        createVariantDto.image = imageUrl;
      }

      const variant = await this.variantService.create(createVariantDto);
      return new ResponseData<Variant>(
        variant,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      console.error('Error creating variant:', error);
      return new ResponseData<Variant>(
        null,
        HttpStatus.ERROR,
        HttpMessage.ERROR,
      );
    }
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateVariantDto: CreateVariantDto, // hoặc UpdateVariantDto nếu bạn có riêng
  ) {
    try {
      if (file) {
        const imageUrl = await uploadToS3(file, 'variant');
        updateVariantDto.image = imageUrl;
      }

      const variant = await this.variantService.update(id, updateVariantDto);
      return new ResponseData<Variant>(
        variant,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      console.error('Error updating variant:', error);
      return new ResponseData<Variant>(
        null,
        HttpStatus.ERROR,
        HttpMessage.ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      const variant = await this.variantService.findAll();
      return new ResponseData(variant, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const variant = await this.variantService.findOne(id);
      return new ResponseData(variant, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }

   @Get('slug/:slug')
  async findOneSlug(@Param('slug') slug: string) {
    try {
      const brand = await this.variantService.findOneBySlug(slug);
      return new ResponseData(brand, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const variant = await this.variantService.remove(id);
      return new ResponseData(variant, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
    }
  }
}
