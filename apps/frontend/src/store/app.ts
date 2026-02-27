import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { THEME_KEY } from 'src/config/constants'
import { isTheme, Theme } from 'src/types/Theme'

const initialTheme = localStorage.getItem(THEME_KEY)
const parsedTheme = isTheme(initialTheme) ? initialTheme : false

type AppState = {
  theme: Theme
}

const initialState: AppState = {
  theme: parsedTheme || Theme.LIGHT,
}

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, { payload }: PayloadAction<Theme>) => {
      state.theme = payload
      localStorage.setItem(THEME_KEY, payload)
    },
  },
})

export const { setTheme } = slice.actions

export default slice.reducer
