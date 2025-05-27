import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Variant, VariantDocument } from './schemas/variant.schema';
import { CreateVariantDto } from './dto/variant.dto';
import slugify from 'slugify';

@Injectable()
export class VariantService {
  constructor(
    @InjectModel(Variant.name) private variantModel: Model<VariantDocument>,
  ) {}

  create(createVariantDto: CreateVariantDto) {
    if (!createVariantDto.slug && createVariantDto.name) {
      createVariantDto.slug = slugify(createVariantDto.name, {
        lower: true,
        strict: true,
      });
    }
    return this.variantModel.create(createVariantDto);
  }

  findAll() {
    return this.variantModel.find();
  }

  findOne(id: string) {
    return this.variantModel.findById(id);
  }

  async findOneBySlug(slug: string): Promise<Variant> {
      return this.variantModel.findOne({slug}).exec();
    }


  update(id: string, updateVariantDto: CreateVariantDto) {
     if (!updateVariantDto.slug && updateVariantDto.name) {
      updateVariantDto.slug = slugify(updateVariantDto.name, {
        lower: true,
        strict: true,
      });
    }
    return this.variantModel.findByIdAndUpdate(id, updateVariantDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.variantModel.findByIdAndDelete(id);
  }
}
