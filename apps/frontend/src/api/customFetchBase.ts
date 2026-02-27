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

  let result = await baseQuery(args, api, extraOptions)

  if ((result.error?.data as ApiErrorMessage)?.statusCode === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      const refreshToken = (api.getState() as RootState).auth.refreshToken

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
          window.location.href = getRouteByAlias('login').path
        }
      } finally {
        release()
      }
    } else {
      await mutex.waitForUnlock()
      result = await baseQuery(args, api, extraOptions)
    }
  }

  return result
}

export default customFetchBase
