import { Module } from '@nestjs/common';
import { OrdersService } from './order.service';
import { OrdersController } from './order.controller';
import { PermissionsGuard } from './permissions.guard';

@Module({
  providers: [OrdersService, PermissionsGuard],
  controllers: [OrdersController],
})
export class OrderModule {}
