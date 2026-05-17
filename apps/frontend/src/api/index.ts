import {
  DevicesGetRes,
  DevicesGetReq,
  FavoriteDeviceReq,
  FavoriteDeviceRes,
  UserLoginReq,
  UserLoginRes,
  UserRegisterReq,
  UserRegisterRes,
  AddDeviceRes,
  AddDeviceReq,
  UpdateDeviceStateRes,
  UpdateDeviceStateReq,
  DeviceDeleteRes,
  DeviceDeleteReq,
  UserUploadAvatarRes,
  UserUploadAvatarReq,
  UserUpdateReq,
  UserUpdateRes,
  UserDeleteReq,
  UserDeleteRes,
  UpdateDeviceReq,
  UpdateDeviceRes,
} from '@smart-home/shared'
import { createApi } from '@reduxjs/toolkit/query/react'
import baseQuery from './customFetchBase'
import {
  setAccessToken,
  setRefreshToken,
  setUserAvatar,
  logout,
} from 'src/store/auth'

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Device', 'User'],
  endpoints: (builder) => ({
    register: builder.mutation<UserRegisterRes, UserRegisterReq>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(setAccessToken(data.tokens.accessToken))
        dispatch(setRefreshToken(data.tokens.refreshToken))
      },
      invalidatesTags: (result, _error, _arg) => [
        { type: 'User', id: result?.user.id },
      ],
    }),
    login: builder.mutation<UserLoginRes, UserLoginReq>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(setAccessToken(data.tokens.accessToken))
        dispatch(setRefreshToken(data.tokens.refreshToken))
      },
      invalidatesTags: (result, _error, _arg) => [
        { type: 'User', id: result?.user.id },
      ],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
      }),
    }),
    getDevices: builder.query<DevicesGetRes, DevicesGetReq>({
      query: () => ({
        url: '/devices',
        method: 'GET',
      }),
      providesTags: (result = { devices: [] }) => [
        'Device',
        ...result.devices.map((device) => ({
          type: 'Device' as const,
          id: device.id,
        })),
      ],
    }),
    getFavoritesDevices: builder.query<DevicesGetRes, DevicesGetReq>({
      query: () => ({
        url: '/favorites',
        method: 'GET',
      }),
      providesTags: (result = { devices: [] }) => [
        'Device',
        ...result.devices.map((device) => ({
          type: 'Device' as const,
          id: device.id,
        })),
      ],
    }),
    toggleFavoriteDevice: builder.mutation<
      FavoriteDeviceRes,
      FavoriteDeviceReq
    >({
      query: ({ id }) => ({
        url: `/devices/${id}/favorite`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Device', id: arg.id },
      ],
    }),
    updateDeviceState: builder.mutation<
      UpdateDeviceStateRes,
      UpdateDeviceStateReq
    >({
      query: ({ id, body }) => ({
        url: `/devices/${id}/state`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Device', id: arg.id },
      ],
    }),
    deleteDevice: builder.mutation<DeviceDeleteRes, DeviceDeleteReq>({
      query: ({ id }) => ({
        url: `/devices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Device'],
    }),
    addDevice: builder.mutation<AddDeviceRes, AddDeviceReq>({
      query: (body) => ({
        url: '/devices',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Device'],
    }),
    updateDevice: builder.mutation<UpdateDeviceRes, UpdateDeviceReq>({
      query: ({ id, body }) => ({
        url: `/devices/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Device', id: arg.id },
      ],
    }),
    uploadUserAvatar: builder.mutation<
      UserUploadAvatarRes,
      UserUploadAvatarReq
    >({
      query: (body) => ({
        url: '/avatar',
        method: 'PUT',
        body,
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(setUserAvatar(data.avatarUrl))
      },
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<UserUpdateRes, UserUpdateReq>({
      query: (body) => ({
        url: '',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<UserDeleteRes, UserDeleteReq>({
      query: () => ({
        url: '',
        method: 'DELETE',
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(logout())
        dispatch(setAccessToken(null))
        dispatch(setRefreshToken(null))
      },
    }),
  }),
})

export const {
  useLoginMutation,
  useGetDevicesQuery,
  useGetFavoritesDevicesQuery,
  useToggleFavoriteDeviceMutation,
  useLogoutMutation,
  useRegisterMutation,
  useAddDeviceMutation,
  useUpdateDeviceMutation,
  useUpdateDeviceStateMutation,
  useDeleteDeviceMutation,
  useUpdateUserMutation,
  useUploadUserAvatarMutation,
  useDeleteUserMutation,
} = apiSlice
