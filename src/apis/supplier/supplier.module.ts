import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Supplier.name, schema: SupplierSchema }])],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
