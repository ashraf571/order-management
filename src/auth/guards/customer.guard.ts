import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';

/**
 * Customer Guard - Verifies user is authenticated (customer or admin)
 * Similar to kamaee-backend-v1's userMiddleware
 */
@Injectable()
export class CustomerGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException('Authentication required. Please login to continue.');
    }

    // Verify user still exists in database
    const dbUser = await this.userService.findOne(user.userId);

    if (!dbUser) {
      throw new UnauthorizedException('User account not found');
    }

    // Attach full user info to request
    request.user = {
      userId: dbUser.id,
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      phone: dbUser.phone,
      isCustomer: dbUser.role === 'customer',
      isAdmin: dbUser.role === 'admin',
    };

    return true;
  }
}
