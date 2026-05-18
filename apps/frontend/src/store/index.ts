import { combineReducers, configureStore, Action } from '@reduxjs/toolkit'
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux'

import { apiSlice } from '../api'
import authReducer, { logout } from './auth'
import appReducer from './app'
import apartmentReducer from './apartment'

const combinedReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
  app: appReducer,
  apartment: apartmentReducer,
})

const rootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined,
  action: Action
) => {
  // Reset state on logout except the theme
  if (action.type === logout.type) {
    const theme = state?.app?.theme
    state = {
      app: { theme },
    } as ReturnType<typeof combinedReducer>
  }

  return combinedReducer(state, action)
}

const store = configureStore({
  reducer: rootReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})

export default store

export type RootDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof rootReducer>

type DispatchFunc = () => RootDispatch
export const useAppDispatch: DispatchFunc = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
