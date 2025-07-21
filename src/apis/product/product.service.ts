import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/product.dto';
// import * as fs from 'fs';
// import * as path from 'path';
import * as bwipjs from 'bwip-js';
// import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { uploadToS3 } from 'src/providers/storage/aws-s3/upload-to-s3';
import slugify from 'slugify';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  create(createProductDto: CreateProductDto) {
    return this.productModel.create(createProductDto);
  }

  async createWithBarcode(dto: CreateProductDto): Promise<Product> {
    // Tạo shortCode ngắn hơn, ví dụ: 6 ký tự
    let barcode: string;
    while (true) {
      barcode = nanoid(6); // Mã ngắn 6 ký tự
      const exists = await this.productModel.findOne({ barcode });
      if (!exists) break;
    }
    if (!dto.slug && dto.name) {
      dto.slug = slugify(dto.name, {
        lower: true,
        strict: true,
      });
    }
    // Tạo sản phẩm với shortCode
    const product = await this.productModel.create({
      ...dto,
      barcode,
    });

    // Tạo buffer từ barcode
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: `${barcode}`,
      scale: 3,
      height: 10,
      includetext: true,
    });

    // Upload buffer lên S3
    const barcodeFile: Express.Multer.File = {
      buffer: barcodeBuffer,
      originalname: `${barcode}.png`,
      mimetype: 'image/png',
      fieldname: 'barcode',
      size: barcodeBuffer.length,
      destination: '',
      encoding: '7bit',
      filename: '',
      path: '',
      stream: undefined!,
    };

    const barcodeUrl = await uploadToS3(barcodeFile, 'barcodes');

    // Gán đường dẫn ảnh barcode cho sản phẩm
    product.barcodeImage = barcodeUrl;
    await product.save();

    return product;
  }
  findAll() {
    return this.productModel
      .find()
      .populate('brand')
      .populate('supplier')
      .populate('variants')
      .populate('category');
  }

  findOneByBarcode(barcode: string) {
    return this.productModel
      .findOne({ barcode })
      .populate('brand')
      .populate('supplier')
      .populate('variants')
      .populate('category');
  }

  findOneBySlug(slug: string) {
    return this.productModel
      .findOne({ slug })
      .populate('brand')
      .populate('supplier')
      .populate('variants')
      .populate('category');
  }

  async findRelatedProductsByCategory(slug: string) {
  // Tìm sản phẩm theo slug
  const product = await this.productModel.findOne({ slug });

  if (!product || !product.category) {
    return [];
  }

  // Tìm các sản phẩm khác có cùng category, loại trừ sản phẩm hiện tại
  return this.productModel
    .find({ category: product.category, _id: { $ne: product._id } })
    .limit(10) // Giới hạn số lượng, tùy nhu cầu
    .populate('brand')
    .populate('supplier')
    .populate('variants')
    .populate('category');
} 


  findOne(id: string) {
    return this.productModel
      .findById(id)
      .populate('brand')
      .populate('supplier')
      .populate('variants')
      .populate('category');
  }

  update(id: string, updateProductDto: CreateProductDto) {
    return this.productModel.findByIdAndUpdate(id, updateProductDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.productModel.findByIdAndDelete(id);
  }
}
