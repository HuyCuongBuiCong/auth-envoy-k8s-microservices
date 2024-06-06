import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Res,
  UseGuards,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { OrdersService } from './order.service';
import { Permissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';
import { Response } from 'express';

@Controller('v1/orders')
@UseGuards(PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Permissions('create_order')
  async create(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-permissions') permissions: string,
    @Body() createOrderDto: any,
    @Res() res: Response,
  ) {
    createOrderDto.userId = userId; // Ensure the userId is included in the order
    const order = await this.ordersService.create(createOrderDto);
    return res.status(201).json(order);
  }

  @Get(':id')
  @Permissions('read_order')
  async findOne(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-permissions') permissions: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const order = await this.ordersService.findOne(id);
    return res.status(200).json(order);
  }

  @Put(':id')
  @Permissions('update_order')
  async update(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-permissions') permissions: string,
    @Param('id') id: string,
    @Body() updateOrderDto: any,
    @Res() res: Response,
  ) {
    const order = await this.ordersService.update(id, updateOrderDto);
    return res.status(200).json(order);
  }

  @Delete(':id')
  @Permissions('delete_order')
  async remove(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-permissions') permissions: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.ordersService.remove(id);
    return res.status(204).send({
      message: 'Order deleted successfully',
    });
  }
}
