/**
 * @file Services for handling Auth resources
 * In charge of handling security rules regarding ownership
 * Uses Drizzle ORM for CRUD operations
 */
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

  /**
   * Hashes and updates a refresh token for an specific userId
   * @async
   * @param {string} userId - UUID credentials of the user
   * @param {string} refreshToken - String token to hash and save
   * @returns {Promise<void>}
   */
  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.userService.hash(refreshToken)
    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    })
  }

  /**
   * Removes refresh token to null for an specific userId
   * @async
   * @param {string} userId - UUID credentials of the user
   * @returns {Promise<void>}
   */
  async removeRefreshToken(userId: string) {
    await this.userService.update(userId, {
      refreshToken: null,
    })
  }

  /**
   * Validates and assigns new tokens using a valid refresh token
   * @async
   * @param {string} userId - UUID credentials of the user
   * @param {string} refreshToken - Current active refresh token string
   * @throws {ForbiddenException} - In case user doesn't exist or token fails to validate
   * @returns {Promise<Object>} - Object with new access and refresh token strings
   */
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

  /**
   * Validates if username login credentials match stored data
   * @async
   * @param {string} email - User authentication email address
   * @param {string} password - Raw text password string
   * @returns {Promise<Object>} - User object with userId and email string properties
   */
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

  /**
   * User login and provisions fresh tokens
   * @async
   * @param {string} userId - UUID credentials of the user
   * @param {string} email - Registered email
   * @throws {NotFoundException} - In case user cannot be found
   * @returns {Promise<UserLoginRes>} - User object with user profile and generated tokens
   */
  async login(userId: string, email: string): Promise<UserLoginRes> {
    const user = await this.userService.findById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const tokens = await this.getTokens(userId, email)
    this.updateRefreshToken(userId, tokens.refreshToken)

    return { user: this.userService.serializeUser(user), tokens }
  }

  /**
   * Removes session token when user logs out
   * @async
   * @param {string} userId - UUID credentials of the user logging out
   * @returns {Promise<Object>} - True when verification is successful
   */
  async logout(userId: string) {
    this.removeRefreshToken(userId)
    return { ok: true }
  }

  /**
   * Generates unique Access and Refresh JWT strings
   * @async
   * @param {string} id - User id key
   * @param {string} email - Targeted email
   * @returns {Promise<Object>} - Dual access/refresh token
   */
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

  /**
   * Registers new user account and logs in
   * @async
   * @param {Omit<NewUser, 'devices' | 'refreshToken'>} userData - Properties for creating schema layout
   * @returns {Promise<Object>} - Initial payload user object mapped together with fresh auth tokens
   */
  async register(userData: Omit<NewUser, 'devices' | 'refreshToken'>) {
    const user = await this.userService.register(userData)
    const tokens = await this.getTokens(user.id, user.email)
    this.updateRefreshToken(user.id, tokens.refreshToken)

    return { user: this.userService.serializeUser(user), tokens }
  }
}
