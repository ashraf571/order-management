import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Public()
  @Post()
  async seed() {
    return await this.seedService.seedDatabase();
  }
}
