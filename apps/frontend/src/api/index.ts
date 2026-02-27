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
  ToggleDeviceOnOffRes,
  ToggleDeviceOnOffReq,
  DeviceDeleteRes,
  DeviceDeleteReq,
  UserUploadAvatarRes,
  UserUploadAvatarReq,
  UserUpdateReq,
  UserUpdateRes,
} from '@smart-home/shared'
import { createApi } from '@reduxjs/toolkit/query/react'
import baseQuery from './customFetchBase'
import { setAccessToken, setRefreshToken, setUserAvatar } from 'src/store/auth'

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
        url: '/devices/favorites',
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
        method: 'GET',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Device', id: arg.id },
      ],
    }),
    toggleDeviceOnOff: builder.mutation<
      ToggleDeviceOnOffRes,
      ToggleDeviceOnOffReq
    >({
      query: ({ id }) => ({
        url: `/devices/${id}/onOff/toggle`,
        method: 'GET',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Device', id: arg.id },
      ],
    }),
    deleteDevice: builder.mutation<DeviceDeleteRes, DeviceDeleteReq>({
      query: ({ id }) => ({
        url: `/devices/${id}/delete`,
        method: 'GET',
      }),
      invalidatesTags: ['Device'],
    }),
    addDevice: builder.mutation<AddDeviceRes, AddDeviceReq>({
      query: (body) => ({
        url: '/devices/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Device'],
    }),
    uploadUserAvatar: builder.mutation<
      UserUploadAvatarRes,
      UserUploadAvatarReq
    >({
      query: (body) => ({
        url: '/user/uploadAvatar',
        method: 'POST',
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
        url: '/user/update',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
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
  useToggleDeviceOnOffMutation,
  useDeleteDeviceMutation,
  useUpdateUserMutation,
  useUploadUserAvatarMutation,
} = apiSlice
