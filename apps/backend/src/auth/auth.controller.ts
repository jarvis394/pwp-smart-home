import {
  Controller,
  Post,
  UseGuards,
  Body,
  Request,
  Get,
  Req,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LocalAuthGuard } from './strategies/local.strategy'
import { TokenResponse } from './dto/auth-response.dto'
import {
  JwtRefreshTokenAuthGuard,
  RequestWithJwtPayload,
} from './strategies/jwtRefreshToken.strategy'
import { JwtAuthGuard } from './strategies/jwt.strategy'
import { UserLoginRes, UserRegisterRes } from '@smart-home/shared'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { LoginDto } from './dto/login.dto'
import { Request as ExpressRequest } from 'express'

export interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string
    email: string
  }
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'User logs into the application',
  })
  @ApiResponse({
    status: 201,
    description: 'Login Successfull',
    type: TokenResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - wrong email or password',
  })
  async login(
    @Request() req: RequestWithUser,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() _data: LoginDto
  ): Promise<UserLoginRes> {
    return await this.authService.login(req.user.userId, req.user.email)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'User logs out of the application',
  })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request - invalid token',
  })
  async logout(@Request() req: RequestWithUser) {
    return await this.authService.logout(req.user.userId)
  }

  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description: 'Registers a new user',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid email format',
  })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(
    @Body() { email, firstName, lastName, password, avatarUrl }: RegisterDto
  ): Promise<UserRegisterRes> {
    return await this.authService.register({
      email,
      firstName,
      lastName,
      password,
      avatarUrl: avatarUrl || null,
    })
  }

  @UseGuards(JwtRefreshTokenAuthGuard)
  @Get('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Refresh access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: TokenResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Unauthorized - Refresh token expired or invalid',
  })
  async refreshTokens(@Req() req: RequestWithJwtPayload) {
    const userId = req.user.sub
    const refreshToken = req.user.refreshToken
    return await this.authService.refreshTokens(userId, refreshToken)
  }
}
