import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { CreateSupplierDto } from './dto/supplier.dto';
import slugify from 'slugify';

@Injectable()
export class SupplierService {
  constructor(@InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>) {}

  create(createSupplierDto: CreateSupplierDto) {
     if (!createSupplierDto.slug && createSupplierDto.name) {
          createSupplierDto.slug = slugify(createSupplierDto.name, {
            lower: true,
            strict: true,
          });
        }
    return this.supplierModel.create(createSupplierDto);
  }

  findAll() {
    return this.supplierModel.find();
  }

  findOne(id: string) {
    return this.supplierModel.findById(id);
  }

 async findOneBySlug(slug: string): Promise<Supplier> {
    return this.supplierModel.findOne({slug}).exec();
  }

  update(id: string, updateSupplierDto: CreateSupplierDto) {
     if (!updateSupplierDto.slug && updateSupplierDto.name) {
          updateSupplierDto.slug = slugify(updateSupplierDto.name, {
            lower: true,
            strict: true,
          });
        }
    return this.supplierModel.findByIdAndUpdate(id, updateSupplierDto, { new: true });
  }

  remove(id: string) {
    return this.supplierModel.findByIdAndDelete(id);
  }
}
