import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors, UploadedFile
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { ResponseData } from 'src/global/globalClass';
import { HttpMessage, HttpStatus } from 'src/global/globalEnum';
import { FileInterceptor } from '@nestjs/platform-express';
import { Category } from './schemas/category.schema';
import { uploadToS3 } from 'src/providers/storage/aws-s3/upload-to-s3';
import { memoryStorage } from 'multer';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(), // ❗ giữ file trong RAM
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    try {
      if (file) {
        const imageUrl = await uploadToS3(file, 'category');
        createCategoryDto.image = imageUrl;
      }
  
      const category = await this.categoryService.create(createCategoryDto);
      return new ResponseData<Category>(
        category,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      console.error('Error creating category:', error);
      return new ResponseData<Category>(
        null,
        HttpStatus.ERROR,
        HttpMessage.ERROR,
      );
    }
  }
  
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(), // ❗ RAM thôi, chưa upload
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      if (file) {
        const imageUrl = await uploadToS3(file, 'category');
        updateCategoryDto.image = imageUrl;
      }
  
      const category = await this.categoryService.update(id, updateCategoryDto);
      return new ResponseData<Category>(
        category,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      console.error('Error updating category:', error);
      return new ResponseData<Category>(
        null,
        HttpStatus.ERROR,
        HttpMessage.ERROR,
      );
    }
  }

  @Get()
  async findAll(): Promise<ResponseData<Category[]>> {
    try {
        const categories = await this.categoryService.findAllCategory();
        return new ResponseData<Category[]>(
        categories,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData<Category[]>(
        null,
        HttpStatus.ERROR,
        HttpMessage.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
        const categories = await this.categoryService.findOne(id);
        return new ResponseData<Category>(
        categories,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData<Category>(
        null,
        HttpStatus.ERROR,
        HttpMessage.ERROR,
      );
    }
  }

  @Get('slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    try {
        const categories = await this.categoryService.findOneBySlug(slug);
        return new ResponseData<Category>(
        categories,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData<Category>(
        null,
        HttpStatus.ERROR,
        HttpMessage.ERROR,
      );
    }
  }
  

  @Delete(':id')
 async remove(@Param('id') id: string) {
    try {
        const categories = await this.categoryService.remove(id);
        return new ResponseData<Category>(
        categories,
        HttpStatus.SUCCESS,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      console.error('Error fetching topics:', error);
      return new ResponseData<Category>(
        null,
        HttpStatus.ERROR,
        HttpMessage.ERROR,
      );
    }
  }
}
