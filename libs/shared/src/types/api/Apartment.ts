import { Apartment } from '@smart-home/db/schema'

export type ApiApartment = Apartment

export type ApartmentsGetReq = unknown
export type ApartmentsGetRes = ApiApartment[]

export type ApartmentGetReq = { id: string }
export type ApartmentGetRes = ApiApartment

export type ApartmentCreateReq = { name: string; location: string }
export type ApartmentCreateRes = ApiApartment

export type ApartmentUpdateReq = {
  id: string
  body: Partial<Pick<Apartment, 'name' | 'location'>>
}
export type ApartmentUpdateRes = ApiApartment

export type ApartmentDeleteReq = { id: string }
export type ApartmentDeleteRes = { ok: boolean }
