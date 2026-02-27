import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ApiUser, Tokens, UserGetSelfRes } from '@smart-home/shared'
import { FetchingState } from 'src/types/FetchingState'
import axios from 'axios'
import {
  ACCESS_TOKEN_KEY,
  API_URL,
  REFRESH_TOKEN_KEY,
} from 'src/config/constants'

type AuthState = {
  user: ApiUser | null
  accessToken: string | null
  refreshToken: string | null
  state: FetchingState
  currentRequestId: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  state: FetchingState.IDLE,
  currentRequestId: null,
}

export const fetchUserSelf = createAsyncThunk<
  ApiUser | null,
  void,
  { state: { auth: AuthState } }
>('auth/getUserSelf', async (_, { getState, requestId, dispatch }) => {
  const { state, currentRequestId, accessToken, refreshToken } = getState().auth

  if (state !== FetchingState.PENDING || requestId !== currentRequestId) {
    return null
  }

  if (!accessToken && !refreshToken) {
    return null
  }

  const fetch = async (token: string) => {
    return await axios<UserGetSelfRes>({
      url: API_URL + '/user',
      method: 'GET',
      withCredentials: true,
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
  }

  try {
    if (!accessToken) throw new Error('refresh')

    const response = await fetch(accessToken)
    return response.data.user
  } catch (e) {
    if (!refreshToken) {
      return null
    }

    const refreshResult = (
      await axios<Tokens>({
        url: API_URL + '/auth/refresh',
        headers: {
          Authorization: 'Bearer ' + refreshToken,
        },
      })
    )?.data

    dispatch(setAccessToken(refreshResult.accessToken))
    dispatch(setRefreshToken(refreshResult.refreshToken))

    return (await fetch(refreshResult.accessToken)).data.user
  }
})

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, { payload }: PayloadAction<ApiUser | null>) => {
      state.user = payload
    },
    setAccessToken: (state, { payload }: PayloadAction<string | null>) => {
      state.accessToken = payload
      if (payload) {
        localStorage.setItem(ACCESS_TOKEN_KEY, payload)
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
      }
    },
    setRefreshToken: (state, { payload }: PayloadAction<string | null>) => {
      state.refreshToken = payload
      if (payload) {
        localStorage.setItem(REFRESH_TOKEN_KEY, payload)
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY)
      }
    },
    logout: (state, _action: PayloadAction<void>) => {
      state.user = null
      state.state = FetchingState.FULFILLED
      state.currentRequestId = null
      state.accessToken = null
      state.refreshToken = null
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    },
    setUserFetchingState: (
      state,
      { payload }: PayloadAction<FetchingState>
    ) => {
      state.state = payload
    },
    setUserAvatar: (state, { payload }: PayloadAction<string>) => {
      if (!state.user) return

      state.user.avatarUrl = payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSelf.pending, (state, action) => {
        if (state.state === FetchingState.IDLE) {
          state.state = FetchingState.PENDING
          state.currentRequestId = action.meta.requestId
        }
      })
      .addCase(fetchUserSelf.fulfilled, (state, action) => {
        const { requestId } = action.meta
        if (
          state.state === FetchingState.PENDING &&
          state.currentRequestId === requestId
        ) {
          state.state = FetchingState.FULFILLED
          state.user = action.payload || null
          state.currentRequestId = null
        }
      })
      .addCase(fetchUserSelf.rejected, (state, action) => {
        const { requestId } = action.meta
        if (
          state.state === FetchingState.PENDING &&
          state.currentRequestId === requestId
        ) {
          state.state = FetchingState.REJECTED
          state.currentRequestId = null
          state.user = null
        }
      })
  },
})

export const {
  setUser,
  setUserFetchingState,
  logout,
  setAccessToken,
  setRefreshToken,
  setUserAvatar,
} = slice.actions

export default slice.reducer
