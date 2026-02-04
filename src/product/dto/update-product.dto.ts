import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty, ValidateIf } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ValidateIf((o) => !o.name && !o.description && !o.price && !o.stock && !o.image && !o.categoryId)
  @IsNotEmpty({ message: 'At least one field must be provided for update' })
  atLeastOne?: any;
}
