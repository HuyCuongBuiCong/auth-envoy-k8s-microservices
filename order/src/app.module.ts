import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { OrderModule } from './order/order.module';
@Module({
  imports: [OrderModule],
  controllers: [AppController],
})
export class AppModule {}
