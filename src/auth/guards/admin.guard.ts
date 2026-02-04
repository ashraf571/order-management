import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';

/**
 * Admin Guard - Verifies user is authenticated and has admin role
 * Similar to kamaee-backend-v1's adminMiddleware with DB verification
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    // Verify user exists and has current admin status (DB check)
    const dbUser = await this.userService.findOne(user.userId);

    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }

    if (dbUser.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    // Attach additional user info to request
    request.user = {
      ...user,
      isAdmin: true,
      role: dbUser.role,
      name: dbUser.name,
      email: dbUser.email,
    };

    return true;
  }
}
