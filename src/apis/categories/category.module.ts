import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService, MongooseModule], // Cho phép product sử dụng category
})
export class CategoryModule {}
