import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';
import { CreateBrandDto } from './dto/brand.dto';
import slugify from 'slugify';

@Injectable()
export class BrandService {
  constructor(@InjectModel(Brand.name) private brandModel: Model<BrandDocument>) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    if (!createBrandDto.slug && createBrandDto.name) {
      createBrandDto.slug = slugify(createBrandDto.name, {
            lower: true,
            strict: true,
          });
        }
    return this.brandModel.create(createBrandDto);
  }

  findAll() {
    return this.brandModel.find();
  }

  findOne(id: string) {
    return this.brandModel.findById(id);
  }
  findBySlug(slug: string) {
    return this.brandModel.findOne({slug});
  }
  update(id: string, updateBrandDto: CreateBrandDto) {
    return this.brandModel.findByIdAndUpdate(id, updateBrandDto, { new: true });
  }

  remove(id: string) {
    return this.brandModel.findByIdAndDelete(id);
  }
}
