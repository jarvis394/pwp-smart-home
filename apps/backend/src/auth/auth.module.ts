/**
 * @file Module for Auth resource
 * Connects authentication strategies, JWT configuration, and the AuthController
 * Imports UserModule to validate users and exports AuthService for the rest of the app
 */
import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserModule } from '../user/user.module'
import { LocalStrategy } from './strategies/local.strategy'
import { PassportModule } from '@nestjs/passport'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { AuthController } from './auth.controller'
import { ConfigService } from '../config/config.service'
import { ConfigModule } from '../config/config.module'
import { JwtRefreshTokenStrategy } from './strategies/jwtRefreshToken.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { DrizzleModule } from '../db/drizzle.module'
import { ApartmentsModule } from '../apartments/apartments.module'

@Module({
  imports: [
    DrizzleModule,
    UserModule,
    PassportModule,
    ApartmentsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secretOrPrivateKey: configService.JWT_KEY,
        signOptions: {
          expiresIn: configService.JWT_ACCESS_TOKEN_TTL,
        },
      }),
    }),
  ],
  providers: [
    DrizzleModule,
    AuthService,
    ConfigService,
    UserService,
    JwtService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
