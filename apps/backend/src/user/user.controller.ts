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
} from '@nestjs/common'
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
import { ConfigService } from '../config/config.service'
import 'multer'
import { ApiTags, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger'
import AvatarUploadDto from './dto/avatar-upload.dto'

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  async getSelf(@Request() req: RequestWithUser): Promise<UserGetSelfRes> {
    return await this.userService.getSelf(req.user.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  @ApiBearerAuth()
  async updateInfo(
    @Request() req: RequestWithUser,
    @Body() update: UserUpdateReq
  ): Promise<UserUpdateRes> {
    return await this.userService.updateInfo(req.user.userId, update)
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
    return await this.userService.updateAvatar(req.user.userId, file)
  }
}
