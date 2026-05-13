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

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserSerivce')

  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database,
    private configService: ConfigService
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

  async findByEmail(email: string) {
    return await this.db.query.users.findFirst({
      where: (fields, { eq }) => eq(fields.email, email),
    })
  }

  async findById(id: string) {
    return await this.db.query.users.findFirst({
      where: (fields, { eq }) => eq(fields.id, id),
    })
  }

  async update(id: string, update: Partial<User>) {
    const [res] = await this.db
      .update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning()
    return res
  }

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
