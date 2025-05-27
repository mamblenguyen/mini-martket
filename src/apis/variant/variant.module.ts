import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Variant, VariantSchema } from './schemas/variant.schema';
import { VariantController } from './variant.controller';
import { VariantService } from './variant.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Variant.name, schema: VariantSchema }])],
  controllers: [VariantController],
  providers: [VariantService],
})
export class VariantModule {}
