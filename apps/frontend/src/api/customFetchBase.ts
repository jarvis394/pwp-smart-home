import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { Mutex } from 'async-mutex'
import { ApiErrorMessage, Tokens } from '@smart-home/shared'
import { API_URL } from 'src/config/constants'
import { logout } from 'src/store/auth'
import { RootState } from '../store'
import { getRouteByAlias } from 'src/utils/getRoutePath'

const mutex = new Mutex()

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState, endpoint }) => {
    const accessToken = (getState() as RootState).auth.accessToken
    const refreshToken = (getState() as RootState).auth.refreshToken

    if (headers.get('Authorization')) {
      return headers
    }

    if (accessToken && endpoint !== 'refresh') {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    if (refreshToken && endpoint === 'refresh') {
      headers.set('Authorization', `Bearer ${refreshToken}`)
    }

    return headers
  },
})

const customFetchBase: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock()

  let url = typeof args === 'string' ? args : args?.url

  const state = api.getState() as RootState
  let userId = state.auth.user?.id

  const token = state.auth.accessToken
  if (!userId && token) {
    try {
      const payload = token.split('.')[1]
      if (payload) {
        userId = JSON.parse(atob(payload)).sub
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  const isAuthRequest =
    url === '/auth/login' ||
    url === '/auth/register' ||
    url === '/auth/logout' ||
    url === '/auth/refresh'

  if (
    userId &&
    !isAuthRequest &&
    typeof url === 'string' &&
    !url.startsWith('/user/')
  ) {
    url = `/user/${userId}${url}`
  }

  let finalArgs = args
  if (typeof args === 'string') {
    finalArgs = url
  } else if (args) {
    finalArgs = { ...args, url }
  }

  let result = await baseQuery(finalArgs, api, extraOptions)

  if (
    (result.error?.data as ApiErrorMessage)?.statusCode === 401 &&
    !isAuthRequest
  ) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      const refreshToken = (api.getState() as RootState).auth.refreshToken

      if (!refreshToken) {
        api.dispatch(logout())
        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== getRouteByAlias('login').path &&
          window.location.pathname !== getRouteByAlias('register').path
        ) {
          window.location.href = getRouteByAlias('login').path
        }
        release()
        return result
      }

      try {
        const refreshResult = await baseQuery(
          {
            credentials: 'include',
            url: '/auth/refresh',
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
          api,
          extraOptions
        )

        if (refreshResult.data && typeof args !== 'string') {
          result = await baseQuery(
            {
              ...args,
              headers: {
                Authorization: `Bearer ${
                  (refreshResult.data as Tokens).accessToken
                }`,
              },
            },
            api,
            extraOptions
          )
        } else {
          api.dispatch(logout())
          if (
            typeof window !== 'undefined' &&
            window.location.pathname !== getRouteByAlias('login').path &&
            window.location.pathname !== getRouteByAlias('register').path
          ) {
            window.location.href = getRouteByAlias('login').path
          }
        }
      } finally {
        release()
      }
    } else {
      await mutex.waitForUnlock()
      result = await baseQuery(finalArgs, api, extraOptions)
    }
  }

  return result
}

export default customFetchBase
