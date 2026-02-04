import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public } from '../auth/decorators/public.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: any) {
    return this.productService.create(createProductDto);
  }

  @Public()
  @Get()
  async findAll() {
    const products = await this.productService.findAll();
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.image,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      variants: product.variants?.map((variant) => ({
        id: variant.id,
        name: variant.name,
        priceModifier: variant.priceModifier,
        stock: variant.stock,
        isAvailable: variant.isAvailable,
      })),
    }));
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(+id);
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.image,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      variants: product.variants?.map((variant) => ({
        id: variant.id,
        name: variant.name,
        priceModifier: variant.priceModifier,
        stock: variant.stock,
        isAvailable: variant.isAvailable,
      })),
    };
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @CurrentUser() user: any) {
    return this.productService.update(+id, updateProductDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.productService.remove(+id);
    return {
      message: 'Product deleted successfully',
      productId: +id,
    };
  }
}
