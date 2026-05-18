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
  ScenariosGetRes,
  ScenariosGetReq,
  ScenarioGetRes,
  ScenarioGetReq,
  ScenarioCreateRes,
  ScenarioCreateReq,
  ScenarioUpdateRes,
  ScenarioUpdateReq,
  ScenarioSetStateRes,
  ScenarioSetStateReq,
  ScenarioDeleteRes,
  ScenarioDeleteReq,
  ApartmentsGetRes,
  ApartmentsGetReq,
  ApartmentGetRes,
  ApartmentGetReq,
  ApartmentCreateRes,
  ApartmentCreateReq,
  ApartmentUpdateRes,
  ApartmentUpdateReq,
  ApartmentDeleteRes,
  ApartmentDeleteReq,
  RoomsGetRes,
  RoomsGetReq,
  RoomCreateRes,
  RoomCreateReq,
} from '@smart-home/shared'
import { createApi } from '@reduxjs/toolkit/query/react'
import baseQuery from './customFetchBase'
import {
  setAccessToken,
  setRefreshToken,
  setUserAvatar,
  logout,
} from 'src/store/auth'
import { setCurrentApartmentId } from 'src/store/apartment'
import { RootState } from '../store'

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Device', 'User', 'Favorites', 'Scenario', 'Apartment', 'Room'],
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
        'Favorites',
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
        'Favorites',
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
    getScenarios: builder.query<ScenariosGetRes, ScenariosGetReq>({
      query: () => ({
        url: '/scenarios',
        method: 'GET',
      }),
      providesTags: (result = []) => [
        'Scenario',
        ...result.map((scenario) => ({
          type: 'Scenario' as const,
          id: scenario.id,
        })),
      ],
    }),
    getScenario: builder.query<ScenarioGetRes, ScenarioGetReq>({
      query: ({ id }) => ({
        url: `/scenarios/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, arg) => [
        { type: 'Scenario', id: arg.id },
      ],
    }),
    createScenario: builder.mutation<ScenarioCreateRes, ScenarioCreateReq>({
      query: (body) => ({
        url: '/scenarios',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Scenario'],
    }),
    updateScenario: builder.mutation<ScenarioUpdateRes, ScenarioUpdateReq>({
      query: ({ id, body }) => ({
        url: `/scenarios/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Scenario', id: arg.id },
      ],
    }),
    setScenarioState: builder.mutation<
      ScenarioSetStateRes,
      ScenarioSetStateReq
    >({
      query: ({ id, active }) => ({
        url: `/scenarios/${id}/state?active=${active}`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Scenario', id: arg.id },
      ],
    }),
    deleteScenario: builder.mutation<ScenarioDeleteRes, ScenarioDeleteReq>({
      query: ({ id }) => ({
        url: `/scenarios/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Scenario'],
    }),
    getApartments: builder.query<ApartmentsGetRes, ApartmentsGetReq>({
      query: () => ({
        url: '/apartments',
        method: 'GET',
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled
          const state = getState() as RootState
          const currentId = state.apartment.currentApartmentId
          if (data && data.length > 0 && !currentId) {
            dispatch(setCurrentApartmentId(data[0]?.id || null))
          }
        } catch {
          // Ignore as RTK Query will handle the error
        }
      },
      providesTags: (result = []) => [
        'Apartment',
        ...result.map((apartment) => ({
          type: 'Apartment' as const,
          id: apartment.id,
        })),
      ],
    }),
    getApartment: builder.query<ApartmentGetRes, ApartmentGetReq>({
      query: ({ id }) => ({
        url: `/apartments/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, arg) => [
        { type: 'Apartment', id: arg.id },
      ],
    }),
    createApartment: builder.mutation<ApartmentCreateRes, ApartmentCreateReq>({
      query: (body) => ({
        url: '/apartments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Apartment'],
    }),
    updateApartment: builder.mutation<ApartmentUpdateRes, ApartmentUpdateReq>({
      query: ({ id, body }) => ({
        url: `/apartments/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Apartment', id: arg.id },
      ],
    }),
    deleteApartment: builder.mutation<ApartmentDeleteRes, ApartmentDeleteReq>({
      query: ({ id }) => ({
        url: `/apartments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Apartment', 'Room'],
    }),
    getRooms: builder.query<RoomsGetRes, RoomsGetReq>({
      query: () => ({
        url: '/rooms',
        method: 'GET',
      }),
      providesTags: (result = []) => [
        'Room',
        ...result.map((room) => ({
          type: 'Room' as const,
          id: room.id,
        })),
      ],
    }),
    createRoom: builder.mutation<RoomCreateRes, RoomCreateReq>({
      query: ({ apartmentId, ...body }) => ({
        url: `/rooms?apartment=${apartmentId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Room'],
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
  useGetScenariosQuery,
  useGetScenarioQuery,
  useCreateScenarioMutation,
  useUpdateScenarioMutation,
  useSetScenarioStateMutation,
  useDeleteScenarioMutation,
  useGetApartmentsQuery,
  useGetApartmentQuery,
  useCreateApartmentMutation,
  useUpdateApartmentMutation,
  useDeleteApartmentMutation,
  useGetRoomsQuery,
  useCreateRoomMutation,
} = apiSlice
