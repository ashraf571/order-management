import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../category/entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
  ) {}

  async seedDatabase() {
    await this.clearDatabase();

    const categories = await this.seedCategories();
    await this.seedProducts(categories);

    return {
      message: 'Database seeded successfully with fast food data',
      categoriesCreated: categories.length,
    };
  }

  private async clearDatabase() {
    // Delete in correct order to respect foreign key constraints
    // First delete variants (no foreign keys pointing to it)
    const variants = await this.variantRepository.find();
    if (variants.length > 0) {
      await this.variantRepository.remove(variants);
    }

    // Then delete products (variants reference products)
    const products = await this.productRepository.find();
    if (products.length > 0) {
      await this.productRepository.remove(products);
    }

    // Finally delete categories (products reference categories)
    const categories = await this.categoryRepository.find();
    if (categories.length > 0) {
      await this.categoryRepository.remove(categories);
    }
  }

  private async seedCategories() {
    const categoriesData = [
      {
        name: 'Burgers',
        description: 'Delicious burgers with fresh ingredients',
      },
      {
        name: 'Pizza',
        description: 'Hand-tossed pizzas with premium toppings',
      },
      {
        name: 'Chicken',
        description: 'Crispy fried chicken and tenders',
      },
      {
        name: 'Sandwiches',
        description: 'Fresh sandwiches and wraps',
      },
      {
        name: 'Sides',
        description: 'Tasty sides and appetizers',
      },
      {
        name: 'Beverages',
        description: 'Refreshing drinks and beverages',
      },
      {
        name: 'Desserts',
        description: 'Sweet treats and desserts',
      },
    ];

    const categories: Category[] = [];
    for (const data of categoriesData) {
      const category = this.categoryRepository.create(data);
      categories.push(await this.categoryRepository.save(category));
    }

    return categories;
  }

  private async seedProducts(categories: Category[]) {
    const burgers : any = categories.find(c => c.name === 'Burgers');
    const pizza  : any= categories.find(c => c.name === 'Pizza');
    const chicken  : any= categories.find(c => c.name === 'Chicken');
    const sandwiches  : any= categories.find(c => c.name === 'Sandwiches');
    const sides  : any= categories.find(c => c.name === 'Sides');
    const beverages  : any= categories.find(c => c.name === 'Beverages');
    const desserts  : any= categories.find(c => c.name === 'Desserts');

    const productsData = [
      // Burgers
      {
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty with lettuce, tomato, onion, pickles, and special sauce',
        price: 8.99,
        stock: 100,
        categoryId: burgers.id,
        variants: [
          { name: 'Single', priceModifier: 0, stock: 100 },
          { name: 'Double', priceModifier: 3.00, stock: 80 },
          { name: 'Triple', priceModifier: 5.50, stock: 50 },
        ],
      },
      {
        name: 'Cheese Burger',
        description: 'Beef patty with melted cheddar cheese, lettuce, tomato, and mayo',
        price: 9.99,
        stock: 100,
        categoryId: burgers.id,
        variants: [
          { name: 'Single', priceModifier: 0, stock: 100 },
          { name: 'Double', priceModifier: 3.50, stock: 75 },
        ],
      },
      {
        name: 'Bacon Burger',
        description: 'Beef patty with crispy bacon, cheese, lettuce, and BBQ sauce',
        price: 11.99,
        stock: 80,
        categoryId: burgers.id,
        variants: [
          { name: 'Regular', priceModifier: 0, stock: 80 },
          { name: 'Large', priceModifier: 3.00, stock: 60 },
        ],
      },
      {
        name: 'Chicken Burger',
        description: 'Crispy chicken breast with lettuce, tomato, and mayo',
        price: 9.49,
        stock: 90,
        categoryId: burgers.id,
        variants: [
          { name: 'Regular', priceModifier: 0, stock: 90 },
          { name: 'Spicy', priceModifier: 0.50, stock: 70 },
        ],
      },
      // Pizza
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        stock: 50,
        categoryId: pizza.id,
        variants: [
          { name: 'Small (10")', priceModifier: 0, stock: 50 },
          { name: 'Medium (12")', priceModifier: 4.00, stock: 50 },
          { name: 'Large (14")', priceModifier: 7.00, stock: 40 },
          { name: 'Extra Large (16")', priceModifier: 10.00, stock: 30 },
        ],
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Loaded with pepperoni and mozzarella cheese',
        price: 14.99,
        stock: 50,
        categoryId: pizza.id,
        variants: [
          { name: 'Small (10")', priceModifier: 0, stock: 50 },
          { name: 'Medium (12")', priceModifier: 4.00, stock: 50 },
          { name: 'Large (14")', priceModifier: 7.00, stock: 40 },
        ],
      },
      {
        name: 'Supreme Pizza',
        description: 'Pepperoni, sausage, peppers, onions, mushrooms, and olives',
        price: 16.99,
        stock: 40,
        categoryId: pizza.id,
        variants: [
          { name: 'Medium (12")', priceModifier: 0, stock: 40 },
          { name: 'Large (14")', priceModifier: 5.00, stock: 35 },
        ],
      },
      // Chicken
      {
        name: 'Fried Chicken',
        description: 'Crispy fried chicken pieces',
        price: 10.99,
        stock: 100,
        categoryId: chicken.id,
        variants: [
          { name: '2 Pieces', priceModifier: 0, stock: 100 },
          { name: '4 Pieces', priceModifier: 5.00, stock: 90 },
          { name: '6 Pieces', priceModifier: 8.00, stock: 80 },
          { name: '10 Pieces', priceModifier: 14.00, stock: 60 },
        ],
      },
      {
        name: 'Chicken Tenders',
        description: 'Crispy chicken tenders with dipping sauce',
        price: 8.99,
        stock: 100,
        categoryId: chicken.id,
        variants: [
          { name: '3 Pieces', priceModifier: 0, stock: 100 },
          { name: '5 Pieces', priceModifier: 3.00, stock: 90 },
          { name: '8 Pieces', priceModifier: 6.00, stock: 70 },
        ],
      },
      {
        name: 'Buffalo Wings',
        description: 'Spicy buffalo chicken wings',
        price: 11.99,
        stock: 80,
        categoryId: chicken.id,
        variants: [
          { name: '6 Wings', priceModifier: 0, stock: 80 },
          { name: '10 Wings', priceModifier: 5.00, stock: 70 },
          { name: '15 Wings', priceModifier: 9.00, stock: 60 },
        ],
      },
      // Sandwiches
      {
        name: 'Club Sandwich',
        description: 'Triple-decker with turkey, bacon, lettuce, tomato, and mayo',
        price: 9.99,
        stock: 60,
        categoryId: sandwiches.id,
        variants: [
          { name: 'Regular', priceModifier: 0, stock: 60 },
          { name: 'Large', priceModifier: 2.50, stock: 50 },
        ],
      },
      {
        name: 'Chicken Wrap',
        description: 'Grilled chicken with lettuce, tomato, and ranch in a tortilla',
        price: 8.49,
        stock: 70,
        categoryId: sandwiches.id,
        variants: [
          { name: 'Regular', priceModifier: 0, stock: 70 },
          { name: 'Spicy', priceModifier: 0.50, stock: 60 },
        ],
      },
      // Sides
      {
        name: 'French Fries',
        description: 'Crispy golden french fries',
        price: 3.99,
        stock: 200,
        categoryId: sides.id,
        variants: [
          { name: 'Small', priceModifier: 0, stock: 200 },
          { name: 'Medium', priceModifier: 1.50, stock: 180 },
          { name: 'Large', priceModifier: 2.50, stock: 150 },
        ],
      },
      {
        name: 'Onion Rings',
        description: 'Crispy battered onion rings',
        price: 4.99,
        stock: 100,
        categoryId: sides.id,
        variants: [
          { name: 'Regular', priceModifier: 0, stock: 100 },
          { name: 'Large', priceModifier: 2.00, stock: 80 },
        ],
      },
      {
        name: 'Mozzarella Sticks',
        description: 'Breaded mozzarella sticks with marinara sauce',
        price: 6.99,
        stock: 80,
        categoryId: sides.id,
        variants: [
          { name: '5 Pieces', priceModifier: 0, stock: 80 },
          { name: '8 Pieces', priceModifier: 3.00, stock: 60 },
        ],
      },
      // Beverages
      {
        name: 'Soft Drink',
        description: 'Your choice of cola, lemon-lime, or orange soda',
        price: 2.49,
        stock: 300,
        categoryId: beverages.id,
        variants: [
          { name: 'Small', priceModifier: 0, stock: 300 },
          { name: 'Medium', priceModifier: 0.50, stock: 280 },
          { name: 'Large', priceModifier: 1.00, stock: 250 },
        ],
      },
      {
        name: 'Milkshake',
        description: 'Creamy milkshake in vanilla, chocolate, or strawberry',
        price: 5.99,
        stock: 100,
        categoryId: beverages.id,
        variants: [
          { name: 'Regular', priceModifier: 0, stock: 100 },
          { name: 'Large', priceModifier: 2.00, stock: 80 },
        ],
      },
      // Desserts
      {
        name: 'Ice Cream Sundae',
        description: 'Vanilla ice cream with your choice of topping',
        price: 4.99,
        stock: 100,
        categoryId: desserts.id,
        variants: [
          { name: 'Small', priceModifier: 0, stock: 100 },
          { name: 'Large', priceModifier: 2.00, stock: 80 },
        ],
      },
      {
        name: 'Apple Pie',
        description: 'Warm apple pie with cinnamon',
        price: 3.99,
        stock: 80,
        categoryId: desserts.id,
        variants: [
          { name: 'Regular', priceModifier: 0, stock: 80 },
          { name: 'A La Mode', priceModifier: 1.50, stock: 60 },
        ],
      },
    ];

    for (const data of productsData) {
      const { variants, ...productData } = data;
      const product = this.productRepository.create(productData);
      const savedProduct = await this.productRepository.save(product);

      if (variants && variants.length > 0) {
        for (const variantData of variants) {
          const variant = this.variantRepository.create({
            ...variantData,
            productId: savedProduct.id,
          });
          await this.variantRepository.save(variant);
        }
      }
    }
  }
}
