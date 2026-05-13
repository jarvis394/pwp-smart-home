import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  Delete,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Inject,
  Param,
} from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { UserService } from './user.service'
import { UserResponseDto } from './dto/user-response.dto'
import {
  UserGetSelfRes,
  UserUpdateRes,
  UserUploadAvatarRes,
} from '@smart-home/shared'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { UserOwnershipGuard } from '../auth/guards/user-ownership.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger'
import AvatarUploadDto from './dto/avatar-upload.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import 'multer'

// Controller for managing user profiles, including fetching user information,
// updating user details, and handling avatar uploads, with caching for improved
// performance and guards for authentication and authorization
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  // Endpoint to retrieve user profile information by ID, with caching for performance
  // and handling potential cache misses by fetching from the service layer
  @UseGuards(JwtAuthGuard)
  @Get(':user_id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user profile information by ID',
    description: 'Fetches user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile fetched successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(
    @Param('user_id') user_id: string
  ): Promise<UserGetSelfRes> {
    const cacheKey = UserController.getSelfCacheKey(user_id)
    const cached = await this.cacheManager.get<UserGetSelfRes>(cacheKey)

    if (cached) {
      return cached
    }

    const result = await this.userService.getSelf(user_id)
    await this.cacheManager.set(cacheKey, result)

    return result
  }

  // Endpoint to update user information, allowing partial updates and ensuring that
  // the user is authenticated and authorized to update their own profile, with caching
  // for performance and handling potential cache invalidation after the update
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  @Put(':user_id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload user information',
    description: 'Updates the information of the user authenticated',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - empty fields' })
  @ApiResponse({ status: 403, description: 'Forbidden - Unauthorized access' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token missing or invalid',
  })
  async updateUser(
    @Param('user_id') user_id: string,
    @Body() update: UpdateUserDto
  ): Promise<UserUpdateRes> {
    const result = await this.userService.updateInfo(user_id, update)
    const cacheKey = UserController.getSelfCacheKey(user_id)
    await this.cacheManager.del(cacheKey)
    return result
  }

  // Endpoint to upload a user avatar, ensuring that the user is authenticated
  // and authorized to upload an avatar for their own profile, with validation
  // for the uploaded file type and size, and handling potential errors during
  // the upload process, as well as cache invalidation after a successful upload
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  @Post(':user_id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar file in "file" field',
    type: AvatarUploadDto,
  })
  @ApiOperation({
    summary: 'Upload user avatar',
    description: 'Uploads an image file (.png, .jpeg, .webp) as an avatar',
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid type or large file',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Unauthorized access to upload avatar',
  })
  async createAvatar(
    @Param('user_id') user_id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      })
    )
    file: Express.Multer.File
  ): Promise<UserUploadAvatarRes> {
    const result = await this.userService.updateAvatar(user_id, file)
    const cacheKey = UserController.getSelfCacheKey(user_id)
    await this.cacheManager.del(cacheKey)
    return result
  }

  // Endpoint to update a user avatar, ensuring that the user is authenticated
  // and authorized to update the avatar for their own profile, with handling
  // potential errors during the update process, as well as cache invalidation
  // after a successful update
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  @Put(':user_id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar file in "file" field',
    type: AvatarUploadDto,
  })
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden – not your own profile' })
  async updateAvatar(
    @Param('user_id') user_id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      })
    )
    file: Express.Multer.File
  ): Promise<UserUploadAvatarRes> {
    const result = await this.userService.updateAvatar(user_id, file)
    const cacheKey = UserController.getSelfCacheKey(user_id)
    await this.cacheManager.del(cacheKey)
    return result
  }

  // Endpoint to delete a user avatar, ensuring that the user is authenticated and
  // authorized to delete the avatar for their own profile, with handling potential errors
  // during the deletion process, as well as cache invalidation after a successful deletion
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  @Delete(':user_id/avatar')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden – not your own profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteAvatar(@Param('user_id') user_id: string) {
    await this.userService.deleteAvatar(user_id)
    const cacheKey = UserController.getSelfCacheKey(user_id)
    await this.cacheManager.del(cacheKey)
    return { message: 'Avatar deleted' }
  }

  public static getSelfCacheKey(userId: string): string {
    return `user-${userId}`
  }
}
