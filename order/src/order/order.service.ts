import { Injectable, NotFoundException } from '@nestjs/common';

interface Order {
  id: string;
  userId: string;
  product: string;
  quantity: number;
  status: string;
}

@Injectable()
export class OrdersService {
  private orders: Order[] = [];

  constructor() {
    this.initOrders();
  }

  private initOrders() {
    this.orders = [
      {
        id: '1',
        userId: 'user1',
        product: 'Product A',
        quantity: 2,
        status: 'pending',
      },
      {
        id: '2',
        userId: 'user2',
        product: 'Product B',
        quantity: 1,
        status: 'shipped',
      },
      {
        id: '3',
        userId: 'user3',
        product: 'Product C',
        quantity: 5,
        status: 'delivered',
      },
      {
        id: '4',
        userId: 'user4',
        product: 'Product A',
        quantity: 3,
        status: 'pending',
      },
      {
        id: '5',
        userId: 'user5',
        product: 'Product B',
        quantity: 4,
        status: 'shipped',
      },
    ];
  }

  create(orderData: Partial<Order>): Order {
    const order: Order = {
      id: (this.orders.length + 1).toString(),
      userId: orderData.userId,
      product: orderData.product,
      quantity: orderData.quantity,
      status: 'pending',
    };
    this.orders.push(order);
    return order;
  }

  findAll(): Order[] {
    return this.orders;
  }

  findOne(id: string): Order {
    const order = this.orders.find((order) => order.id === id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  update(id: string, updateData: Partial<Order>): Order {
    const order = this.findOne(id);
    if (updateData.product !== undefined) {
      order.product = updateData.product;
    }
    if (updateData.quantity !== undefined) {
      order.quantity = updateData.quantity;
    }
    if (updateData.status !== undefined) {
      order.status = updateData.status;
    }
    return order;
  }

  remove(id: string): void {
    const index = this.orders.findIndex((order) => order.id === id);
    if (index === -1) {
      throw new NotFoundException('Order not found');
    }
    this.orders.splice(index, 1);
  }
}
