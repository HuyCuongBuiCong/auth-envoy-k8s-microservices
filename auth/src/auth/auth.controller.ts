import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Headers,
  Res,
  Logger,
  Body,
  All,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { Role, RolesPermissions } from './roles-permissions';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @All('ext-authz/*')
  async authz(
    @Headers('authorization') authHeader: string,
    @Res() res: Response,
  ) {
    console.log('entered authz');
    if (!authHeader) {
      return res.status(401).send('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).send('Token missing');
    }

    try {
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub; // Assuming 'sub' contains the user ID
      const user = await this.usersService.findById(userId);
      const roles = user.roles.join(',');
      const permissions = user.roles
        .flatMap((role) => RolesPermissions[role as Role])
        .join(',');

      res.setHeader('x-user-id', userId);
      res.setHeader('x-user-roles', roles);
      res.setHeader('x-user-permissions', permissions);
      res.end();
    } catch (err) {
      return res.status(401).send('Invalid token');
    }
  }
}
