import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { RequestWithUser } from '../auth.controller'

// Guard to ensure that users can only access their own resources based on user ID in the URL and token
@Injectable()
export class UserOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const urlUserId = request.params.user_id
    const tokenUserId = request.user?.userId

    if (!tokenUserId) {
      throw new ForbiddenException('Authentication required')
    }

    if (urlUserId && urlUserId !== tokenUserId) {
      throw new ForbiddenException('You can only access your own resources')
    }

    return true
  }
}
