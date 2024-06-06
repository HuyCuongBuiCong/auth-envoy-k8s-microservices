import { Controller, Get } from '@nestjs/common';

@Controller('v1/products')
export class ProductController {
  @Get()
  getOrder() {
    return 'Hello product Service';
  }
}
