import { Controller, Post, Get, Put, Delete, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/brand.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';
import multerS3 from 'multer-s3';
import { s3Client } from 'src/providers/storage/aws-s3/aws.config';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { uploadToS3 } from 'src/providers/storage/aws-s3/upload-to-s3';
import { memoryStorage } from 'multer';
import { Brand } from './schemas/brand.schema';

// Tạo bộ lưu trữ tùy chỉnh cho multer với S3
const multerS3Storage = multerS3({
  s3: s3Client, // Sử dụng client S3 đã cấu hình
  bucket: process.env.AWS_S3_BUCKET!, // Bucket của bạn
  contentType: multerS3.AUTO_CONTENT_TYPE, // Tự động xác định loại nội dung
  key: (req, file, cb) => {
    cb(null, `brands/${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`);
  },
});

@Controller('brands')
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
@UseInterceptors(
  FileInterceptor('logo', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  }),
)
async create(
  @UploadedFile() file: Express.Multer.File,
  @Body() createBrandDto: CreateBrandDto,
) {
  try {
    if (file) {
      const logoUrl = await uploadToS3(file, 'brand');
      createBrandDto.logo = logoUrl;
    }

    const brand = await this.brandService.create(createBrandDto);
    return new ResponseData(brand, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  } catch (error) {
    console.error('Error creating brand:', error);
    return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
  }
}

@Put(':id')
@UseInterceptors(
  FileInterceptor('logo', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  }),
)
async update(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @Body() updateBrandDto: CreateBrandDto, // hoặc UpdateBrandDto nếu có
) {
  try {
    if (file) {
      const logoUrl = await uploadToS3(file, 'brand');
      updateBrandDto.logo = logoUrl;
    }

    const brand = await this.brandService.update(id, updateBrandDto);
    return new ResponseData(brand, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  } catch (error) {
    console.error('Error updating brand:', error);
    return new ResponseData(null, HttpStatus.ERROR, HttpMessage.ERROR);
  }
}
  @Get()
  async findAll(): Promise<ResponseData<Brand[]>>  {
       try {
            const brand = await this.brandService.findAll();
            return new ResponseData<Brand[]>(
              brand,
            HttpStatus.SUCCESS,
            HttpMessage.SUCCESS,
          );
        } catch (error) {
          console.error('Error fetching topics:', error);
          return new ResponseData<Brand[]>(
            null,
            HttpStatus.ERROR,
            HttpMessage.ERROR,
          );
        }
  }

  @Get(':id')
 async findOne(@Param('id') id: string) : Promise<ResponseData<Brand>>{
     try {
            const brand = await this.brandService.findOne(id); // Lấy thông tin brand theo ID
            return new ResponseData<Brand>(
            brand,
            HttpStatus.SUCCESS,
            HttpMessage.SUCCESS,
          );
        } catch (error) {
          console.error('Error fetching topics:', error);
          return new ResponseData<Brand>(
            null,
            HttpStatus.ERROR,
            HttpMessage.ERROR,
          );
        }
  }


  @Get('slug/:slug')
 async findBySlug(@Param('slug') slug: string) : Promise<ResponseData<Brand>>{
     try {
            const brand = await this.brandService.findBySlug(slug); // Lấy thông tin brand theo ID
            return new ResponseData<Brand>(
            brand,
            HttpStatus.SUCCESS,
            HttpMessage.SUCCESS,
          );
        } catch (error) {
          console.error('Error fetching topics:', error);
          return new ResponseData<Brand>(
            null,
            HttpStatus.ERROR,
            HttpMessage.ERROR,
          );
        }
  }

  
  @Delete(':id')
 async remove(@Param('id') id: string) : Promise<ResponseData<Brand>>{

    try {
      const brand = await this.brandService.remove(id); // Xóa brand theo ID // Lấy thông tin brand theo ID
      return new ResponseData<Brand>(
      brand,
      HttpStatus.SUCCESS,
      HttpMessage.SUCCESS,
    );
  } catch (error) {
    console.error('Error fetching topics:', error);
    return new ResponseData<Brand>(
      null,
      HttpStatus.ERROR,
      HttpMessage.ERROR,
    );
  }
  }
}
