import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (!createCategoryDto.slug && createCategoryDto.name) {
      createCategoryDto.slug = slugify(createCategoryDto.name, {
        lower: true,
        strict: true,
      });
    }
    const createdCategory = new this.categoryModel(createCategoryDto);
    return await createdCategory.save();
  }

  async findAllCategory(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    return this.categoryModel.findById(id).exec();
  }
  async findOneBySlug(slug: string): Promise<Category> {
    return this.categoryModel.findOne({slug}).exec();
  }
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    if (!updateCategoryDto.slug && updateCategoryDto.name) {
      updateCategoryDto.slug = slugify(updateCategoryDto.name, {
        lower: true,
        strict: true,
      });
    }
    return this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Category> {
    const category = await this.categoryModel.findByIdAndDelete(id);
    return category;
  }
}
