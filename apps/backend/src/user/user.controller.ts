/**
 * @file Controller for handling User resources
 *  Handles HTTP requests, input validators using NestJSS, and cache using NestJS/cache-manager
 * Security on HTTP routes are handled with JwtAuthGuard, UserOwnershipGuard and @ApiBearerAuth()
 */
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

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

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
  /**
   * Gets a single user by Id
   * This method relies on User Service verification to handle the ownership verification
   * @async
   * @param {string} userId - UUID credentials of the user
   * @returns {Promise<UserGetSelfRes>} - User object in return
   */
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
  /**
   * Updates user information
   * Relies on User Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the user
   * @returns {Promise<UserUpdateRes>} - User information updated
   */
  async updateUser(
    @Param('user_id') user_id: string,
    @Body() update: UpdateUserDto
  ): Promise<UserUpdateRes> {
    const result = await this.userService.updateInfo(user_id, update)
    const cacheKey = UserController.getSelfCacheKey(user_id)
    await this.cacheManager.del(cacheKey)
    return result
  }

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
  /**
   * Creates an avatar for a specific userId
   * Relies on User Service verification to handle the specific request
   * Validates max sixe and file type restricted to png, jpeg, jpg, webp
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the user
   * @returns {Promise<UserUploadAvatarRes>} - Avatar object
   */
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
  /**
   * Updates an avatar for a specific userId
   * Relies on User Service verification to handle the specific request
   * Validates max sixe and file type restricted to png, jpeg, jpg, webp
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the user
   * @returns {Promise<UserUploadAvatarRes>} - Avatar object
   */
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

  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  @Delete(':user_id/avatar')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden – not your own profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  /**
   * Deletes an avatar for a specific userId
   * Relies on User Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the user
   * @returns {message} - Avatar deleted
   */
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
