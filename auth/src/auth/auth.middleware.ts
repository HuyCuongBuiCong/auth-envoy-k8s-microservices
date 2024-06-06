import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/auth/login') {
      return next(); // Skip middleware for login route
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).send('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).send('Token missing');
    }

    try {
      const decoded = this.jwtService.verify(token);
      req.headers['x-user-id'] = decoded.sub; // Assuming 'sub' contains the user ID
      next();
    } catch (err) {
      return res.status(401).send('Invalid token');
    }
  }
}
