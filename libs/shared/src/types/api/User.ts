import { User } from '@smart-home/db/schema'

export type ApiUser = Omit<User, 'devices' | 'password' | 'refreshToken'>

export type UserGetSelfReq = unknown
export type UserGetSelfRes = { user: ApiUser | null }

export type Tokens = { accessToken: string; refreshToken: string }
export type UserLoginReq = { email: string; password: string }
export type UserLoginRes = { user: ApiUser; tokens: Tokens }

export type UserRegisterReq = Omit<
  User,
  'id' | 'devices' | 'refreshToken' | 'accessToken'
>
export type UserRegisterRes = { user: ApiUser; tokens: Tokens }

export type UserUploadAvatarReq = object
export type UserUploadAvatarRes = { avatarUrl: string }

export type UserUpdateReq = Partial<Pick<User, 'firstName' | 'lastName'>>
export type UserUpdateRes = { user: ApiUser }

export type UserDeleteReq = unknown
export type UserDeleteRes = { ok: boolean }
