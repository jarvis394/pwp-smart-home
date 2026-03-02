import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Inject,
} from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { UserService } from './user.service'
import {
  UserGetSelfRes,
  UserUpdateReq,
  UserUpdateRes,
  UserUploadAvatarRes,
} from '@smart-home/shared'
import { RequestWithUser } from '../auth/auth.controller'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger'
import AvatarUploadDto from './dto/avatar-upload.dto'
import 'multer'

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  async getSelf(@Request() req: RequestWithUser): Promise<UserGetSelfRes> {
    const cacheKey = UserController.getSelfCacheKey(req.user.userId)
    const cached = await this.cacheManager.get<UserGetSelfRes>(cacheKey)

    if (cached) {
      return cached
    }

    const result = await this.userService.getSelf(req.user.userId)
    await this.cacheManager.set(cacheKey, result)

    return result
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  @ApiBearerAuth()
  async updateInfo(
    @Request() req: RequestWithUser,
    @Body() update: UserUpdateReq
  ): Promise<UserUpdateRes> {
    const result = await this.userService.updateInfo(req.user.userId, update)
    const cacheKey = UserController.getSelfCacheKey(req.user.userId)
    await this.cacheManager.del(cacheKey)
    return result
  }

  @UseGuards(JwtAuthGuard)
  @Post('uploadAvatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar file in "file" field',
    type: AvatarUploadDto,
  })
  async uploadAvatar(
    @Request() req: RequestWithUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          /** 1 MB max size */
          new MaxFileSizeValidator({ maxSize: 100000 }),
          new FileTypeValidator({
            fileType: '.(png|jpeg|jpg|webp)',
          }),
        ],
      })
    )
    file: Express.Multer.File
  ): Promise<UserUploadAvatarRes> {
    const result = await this.userService.updateAvatar(req.user.userId, file)
    const cacheKey = UserController.getSelfCacheKey(req.user.userId)
    await this.cacheManager.del(cacheKey)
    return result
  }

  public static getSelfCacheKey(userId: string): string {
    return `user-${userId}`
  }
}
