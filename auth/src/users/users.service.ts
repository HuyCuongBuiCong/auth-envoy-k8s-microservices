import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '../auth/roles-permissions';

@Injectable()
export class UsersService {
  private users: any[];

  constructor() {
    this.initUsers();
  }

  private async initUsers() {
    this.users = [
      {
        userId: 1,
        username: 'john',
        password: await bcrypt.hash('changeme', 10),
        roles: [Role.ADMIN],
      },
      {
        userId: 2,
        username: 'chris',
        password: await bcrypt.hash('secret', 10),
        roles: [Role.MANAGER],
      },
      {
        userId: 3,
        username: 'maria',
        password: await bcrypt.hash('guess', 10),
        roles: [Role.USER],
      },
    ];
  }

  async findOne(username: string): Promise<any | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async findById(userId: number): Promise<any | undefined> {
    return this.users.find((user) => user.userId === userId);
  }

  async assignRoles(userId: number, roles: Role[]): Promise<any> {
    const user = this.users.find((user) => user.userId === userId);
    if (user) {
      user.roles = roles;
      return user;
    }
    return null;
  }
}
