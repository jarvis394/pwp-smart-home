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
import {
  JwtRefreshTokenAuthGuard,
  RequestWithJwtPayload,
} from './strategies/jwtRefreshToken.strategy'
import { JwtAuthGuard } from './strategies/jwt.strategy'
import { UserLoginRes, UserRegisterRes } from '@smart-home/shared'
import { ApiTags } from '@nestjs/swagger'
import { LoginDto } from './dto/login.dto'

export interface RequestWithUser extends Request {
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
  async login(
    @Request() req: RequestWithUser,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() _data: LoginDto
  ): Promise<UserLoginRes> {
    return await this.authService.login(req.user.userId, req.user.email)
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Request() req: RequestWithUser) {
    return await this.authService.logout(req.user.userId)
  }

  @Post('register')
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
  async refreshTokens(@Req() req: RequestWithJwtPayload) {
    const userId = req.user.sub
    const refreshToken = req.user.refreshToken
    return await this.authService.refreshTokens(userId, refreshToken)
  }
}
