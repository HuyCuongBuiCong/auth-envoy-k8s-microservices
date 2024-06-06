import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const userPermissions = request.headers['x-user-permissions'];

    if (!userId) {
      throw new BadRequestException('User ID missing');
    }

    if (!userPermissions) {
      throw new ForbiddenException('Permissions missing');
    }

    const permissionsArray = userPermissions.split(',');

    const hasPermission = () =>
      requiredPermissions.some((permission) =>
        permissionsArray.includes(permission),
      );

    if (!hasPermission()) {
      throw new ForbiddenException('Forbidden');
    }

    return true;
  }
}
