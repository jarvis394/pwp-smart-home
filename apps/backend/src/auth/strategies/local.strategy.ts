import { Strategy } from 'passport-local'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { AuthService } from '../auth.service'
import { RequestWithUser } from '../auth.controller'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    })
  }

  async validate(
    email: string,
    password: string
  ): Promise<RequestWithUser['user']> {
    if (!email || !this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format')
    }
    if (!password) {
      throw new BadRequestException('Password is required')
    }

    const user = await this.authService.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return user
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
