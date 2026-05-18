/**
 * @file Services for handling User resources
 * In charge of handling security rules regarding ownership
 * Uses Drizzle ORM for CRUD operations
 */
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
import { ApartmentsService } from '../apartments/apartments.service'

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserSerivce')

  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database,
    private configService: ConfigService,
    private apartmentsService: ApartmentsService
  ) {}

  serializeUser(user: User): ApiUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    }
  }

  /**
   * Finds user details by email address
   * @async
   * @param {string} email - user email
   * @returns {Promise<User>} - User credentials
   */
  async findByEmail(email: string) {
    return await this.db.query.users.findFirst({
      where: (fields, { eq }) => eq(fields.email, email),
    })
  }

  /**
   * Finds user details by Id
   * @async
   * @param {string} id - UUID identifier for user
   * @returns {Promise<User>} - User credentials
   */
  async findById(id: string) {
    return await this.db.query.users.findFirst({
      where: (fields, { eq }) => eq(fields.id, id),
    })
  }

  /**
   * Updates user fields
   * @async
   * @param {string} id - UUID identifier for user
   * @param {Partial<User>} update - Object containing file to update
   * @returns {Promise<User>} - Updated user object from the database
   */
  async update(id: string, update: Partial<User>) {
    const [res] = await this.db
      .update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning()
    return res
  }

  /**
   * Updates user information
   * @async
   * @param {string} id - UUID identifier for user
   * @param {UserUpdateReq} update - DTO for updating
   * @throws {NotFoundException} - If the user details cannot be found
   * @returns {Promise<UserUpdateRes>} - Updated user details
   */
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

  /**
   * Deletes a user by Id
   * @async
   * @param {string} userId - UUID identifier for user
   * @throws {NotFoundException} - If the user details cannot be found
   * @returns {Promise<void>} - Success empty return
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.findById(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.db.delete(users).where(eq(users.id, userId))
  }

  /**
   * Validates a user's login against stored credentials
   * @async
   * @param {string} email -User email string
   * @param {string} password - Raw password details
   * @throws {UnauthorizedException} - In case authorization fails or fields are incorrect
   * @returns {Promise<User>} - Authenticated user credentials
   */
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

  /**
   * Handles new user registration, hashes password and saves information
   * @async
   * @param {Omit<NewUser, 'devices'|'refreshToken'>} user - new user payload
   * @throws {HttpException} - In case user with same email already exists
   * @throws {InternalServerErrorException} - In case it fails to return the registration
   * @returns {Promise<User>} - New user object created
   */
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

    // Create a default home named "Home" with empty location using ApartmentsService
    await this.apartmentsService.create(result.id, {
      name: 'Home',
      location: null,
    })

    return result
  }

  /**
   * Hashes a text string for secure storage
   * @async
   * @param {string} text - Text string
   * @returns {Promise<string>} - Generated hash string
   */
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

  /**
   * Uploads/overrides an avatar picture for a single user profile, removing old files.
   * @async
   * @param {string} userId - UUID credentials of the user
   * @param {Express.Multer.File} file - Incoming file matching multer payload specs.
   * @returns {Promise<UserUploadAvatarRes>} - Payload updated active image path details
   */
  async updateAvatar(
    userId: string,
    file: { buffer: Buffer }
  ): Promise<UserUploadAvatarRes> {
    const user = await this.findById(userId)
    const url = await this.saveFileToUploads(file.buffer)
    await this.update(userId, { avatarUrl: url })

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

    return { avatarUrl: url }
  }

  /**
   * Deletes references to avatar URLs and removes associated files from local storage arrays.
   * @async
   * @param {string} userId - UUID credentials of the user
   * @throws {NotFoundException} - In case avatar is not found
   * @returns {Promise<void>} - Empty when success
   */
  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.findById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.db
      .update(users)
      .set({ avatarUrl: null })
      .where(eq(users.id, userId))

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
  }

  /**
   * Process image uploads, converts it to WEBP format and stores in local file system
   * @private
   * @async
   * @param {Buffer} buffer - Raw file buffer from uploaded multipart data
   * @throws {InternalServerErrorException} - If target directories cannot be found
   * @returns {Promise<string>} - Local server path URL pointing to the image
   */
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
