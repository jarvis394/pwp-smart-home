import { Room } from '@smart-home/db/schema'

export type ApiRoom = Room

export type RoomsGetReq = unknown
export type RoomsGetRes = ApiRoom[]

export type RoomCreateReq = { name: string; apartmentId: string }
export type RoomCreateRes = ApiRoom

export type RoomDeleteReq = { id: string }
export type RoomDeleteRes = { success: boolean }
