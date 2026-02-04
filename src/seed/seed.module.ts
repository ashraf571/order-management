import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Category } from '../category/entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, ProductVariant])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
