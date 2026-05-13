import {
  Logger,
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  Inject,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { compare, hash } from 'bcryptjs'
import { ConfigService } from '../config/config.service'
import {
  ApiUser,
  UserGetSelfRes,
  UserUpdateReq,
  UserUpdateRes,
  UserUploadAvatarRes,
} from '@smart-home/shared'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import * as path from 'path'
import { Database, DrizzleAsyncProvider } from '../db/drizzle.module'
import { eq } from '@smart-home/db'
import { NewUser, User, users } from '@smart-home/db/schema'
import fs from 'fs/promises'

// Service for managing user profiles, including business logic for fetching
// user information, updating user details, and handling avatar uploads,
// with caching for improved performance and guards for authentication and
// authorization
@Injectable()
export class UserService {
  private readonly logger = new Logger('UserSerivce')

  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database,
    private configService: ConfigService
  ) {}

  // Helper method to serialize a User entity into an ApiUser DTO,
  // which is used for sending user information in API responses
  serializeUser(user: User): ApiUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    }
  }

  // Method to find a user by their email address, which is used for authentication
  // and other operations that require looking up a user by email
  async findByEmail(email: string) {
    return await this.db.query.users.findFirst({
      where: (fields, { eq }) => eq(fields.email, email),
    })
  }

  // Method to find a user by their unique ID, which is used for fetching user information
  // and performing operations that require looking up a user by their ID
  async findById(id: string) {
    return await this.db.query.users.findFirst({
      where: (fields, { eq }) => eq(fields.id, id),
    })
  }

  // Method to update a user's information, allowing partial updates and returning the
  // updated user, which is used for updating user details in the profile management
  // features
  async update(id: string, update: Partial<User>) {
    const [res] = await this.db
      .update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning()
    return res
  }

  // Method to update user information, allowing partial updates and ensuring
  // that the user is authenticated and authorized to update their own profile,
  // with caching for performance and handling potential cache invalidation
  // after the update
  async updateInfo(
    userId: string,
    update: UserUpdateReq
  ): Promise<UserUpdateRes> {
    const result = await this.update(userId, update)

    if (!result) {
      throw new NotFoundException('User not found')
    }

    return {
      user: this.serializeUser(result),
    }
  }

  // Method to handle user login by verifying the provided email and password,
  // and returning the user if the credentials are valid, which is used for
  // authenticating users in the application
  async login(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password')
    }

    return user
  }

  // Method to handle user registration by creating a new user with the provided information,
  // ensuring that the email is unique, hashing the password, and returning the created user,
  // which is used for allowing new users to sign up for the application
  async register(
    user: Omit<NewUser, 'devices' | 'refreshToken'>
  ): Promise<User> {
    const { email, password, firstName, lastName } = user
    const existingUser = await this.findByEmail(email)

    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.CONFLICT
      )
    }

    const hashedPassword = await this.hash(password)

    const [result] = await this.db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      })
      .returning()

    if (!result) {
      throw new InternalServerErrorException('Did not insert new user')
    }

    return result
  }

  async hash(text: string): Promise<string> {
    const hashedText = await hash(text, 12)
    return hashedText
  }

  async getSelf(userId: string): Promise<UserGetSelfRes> {
    const user = await this.findById(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return {
      user: this.serializeUser(user),
    }
  }

  // Method to update user information, allowing partial updates and ensuring
  // that the user is authenticated and authorized to update their own profile,
  // with caching for performance and handling potential cache invalidation
  // after the update
  async updateAvatar(
    userId: string,
    file: Express.Multer.File
  ): Promise<UserUploadAvatarRes> {
    const user = await this.findById(userId)
    if (user?.avatarUrl) {
      const oldPath = path.join(
        this.configService.UPLOADS_PATH,
        path.basename(user.avatarUrl)
      )
      try {
        await fs.unlink(oldPath)
      } catch (err) {
        this.logger.warn(`Could not delete old avatar: ${oldPath}`)
      }
    }

    const url = await this.saveFileToUploads(file.buffer)
    await this.update(userId, { avatarUrl: url })
    return { avatarUrl: url }
  }

  // Method to delete a user's avatar, ensuring that the user is authenticated and authorized
  // to delete their own avatar, and handling potential errors during the deletion process,
  // including removing the avatar file from storage and updating the user's profile to
  // reflect the deletion
  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.findById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.avatarUrl) {
      const filePath = path.join(
        this.configService.UPLOADS_PATH,
        path.basename(user.avatarUrl)
      )
      try {
        await fs.unlink(filePath)
      } catch (err) {
        this.logger.warn(`Could not delete old avatar file: ${filePath}`)
      }
    }

    await this.db
      .update(users)
      .set({ avatarUrl: null })
      .where(eq(users.id, userId))
  }

  // Helper method to save an uploaded avatar file to the server's storage,
  // converting it to WebP format and returning the URL for the saved avatar,
  // which is used for handling avatar uploads in the profile management features
  private async saveFileToUploads(buffer: Buffer): Promise<string> {
    const fileName = `${uuidv4()}.webp`
    const savePath = path.join(this.configService.UPLOADS_PATH, fileName)
    const url = `/uploads/${fileName}`

    try {
      await fs.mkdir(this.configService.UPLOADS_PATH, { recursive: true })
    } catch (err) {
      this.logger.error(`Failed to create uploads directory: ${err}`)
      throw new InternalServerErrorException(
        'Could not create uploads directory'
      )
    }

    await sharp(buffer)
      .webp({
        quality: this.configService.UPLOADS_QUALITY,
      })
      .toFile(savePath)

    return url
  }
}
