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

// Service for handling authentication logic, including user validation, token generation, and registration
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService
  ) {}

  // Method to update the refresh token for a user, hashing it before storing in the database
  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.userService.hash(refreshToken)
    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    })
  }

  // Method to remove the refresh token for a user, effectively logging them out from all sessions
  async removeRefreshToken(userId: string) {
    await this.userService.update(userId, {
      refreshToken: null,
    })
  }

  // Method to refresh access tokens using a valid refresh token, ensuring the user is authenticated and the token matches
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

  // Method to validate user credentials during login, returning user information if valid
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

  // Method to handle user login, generating access and refresh tokens upon successful authentication
  async login(userId: string, email: string): Promise<UserLoginRes> {
    const user = await this.userService.findById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const tokens = await this.getTokens(userId, email)
    this.updateRefreshToken(userId, tokens.refreshToken)

    return { user: this.userService.serializeUser(user), tokens }
  }

  // Method to handle user logout, removing the refresh token to invalidate any existing sessions
  async logout(userId: string) {
    this.removeRefreshToken(userId)
    return { ok: true }
  }

  // Method to generate JWT access and refresh tokens for a user, using the user's ID and email as payload
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

  // Method to handle user registration, creating a new user and generating tokens for the new account
  async register(userData: Omit<NewUser, 'devices' | 'refreshToken'>) {
    const user = await this.userService.register(userData)
    const tokens = await this.getTokens(user.id, user.email)
    this.updateRefreshToken(user.id, tokens.refreshToken)

    return { user: this.userService.serializeUser(user), tokens }
  }
}
