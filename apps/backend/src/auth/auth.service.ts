import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '../config/config.service'
import { compare } from 'bcryptjs'
import { RequestWithUser } from './auth.controller'
import { UserLoginRes } from '@smart-home/shared'
import { NewUser } from '@smart-home/db/schema'

export interface JwtPayload {
  email: string
  sub: string
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService
  ) {}

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.userService.hash(refreshToken)
    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    })
  }

  async removeRefreshToken(userId: string) {
    await this.userService.update(userId, {
      refreshToken: null,
    })
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId)

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied')
    }

    const refreshTokenMatches = await compare(refreshToken, user.refreshToken)
    if (!refreshTokenMatches) throw new ForbiddenException('Access denied')

    const tokens = await this.getTokens(user.id, user.email)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  async validateUser(
    email: string,
    password: string
  ): Promise<RequestWithUser['user']> {
    const user = await this.userService.login(email, password)

    return {
      userId: user.id,
      email: user.email,
    }
  }

  async login(userId: string, email: string): Promise<UserLoginRes> {
    const user = await this.userService.findById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const tokens = await this.getTokens(userId, email)
    this.updateRefreshToken(userId, tokens.refreshToken)

    return { user: this.userService.serializeUser(user), tokens }
  }

  async logout(userId: string) {
    this.removeRefreshToken(userId)
    return { ok: true }
  }

  async getTokens(id: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: id,
          email,
        },
        {
          secret: this.configService.JWT_KEY,
          expiresIn: this.configService.JWT_ACCESS_TOKEN_TTL,
        }
      ),
      this.jwtService.signAsync(
        {
          sub: id,
          email,
        },
        {
          secret: this.configService.JWT_KEY,
          expiresIn: this.configService.JWT_REFRESH_TOKEN_TTL,
        }
      ),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  async register(userData: Omit<NewUser, 'devices' | 'refreshToken'>) {
    const user = await this.userService.register(userData)
    const tokens = await this.getTokens(user.id, user.email)
    this.updateRefreshToken(user.id, tokens.refreshToken)

    return { user: this.userService.serializeUser(user), tokens }
  }
}
