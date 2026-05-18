import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CURRENT_APARTMENT_ID_KEY } from 'src/config/constants'
import { logout } from 'src/store/auth'

type ApartmentState = {
  currentApartmentId: string | null
}

const initialState: ApartmentState = {
  currentApartmentId: localStorage.getItem(CURRENT_APARTMENT_ID_KEY),
}

const slice = createSlice({
  name: 'apartment',
  initialState,
  reducers: {
    setCurrentApartmentId: (
      state,
      { payload }: PayloadAction<string | null>
    ) => {
      state.currentApartmentId = payload
      if (payload) {
        localStorage.setItem(CURRENT_APARTMENT_ID_KEY, payload)
      } else {
        localStorage.removeItem(CURRENT_APARTMENT_ID_KEY)
      }
    },
  },
  extraReducers: (builder) => {
    // Clear current apartment ID on logout
    builder.addCase(logout, (state) => {
      state.currentApartmentId = null
      localStorage.removeItem(CURRENT_APARTMENT_ID_KEY)
    })
  },
})

export const { setCurrentApartmentId } = slice.actions

export default slice.reducer
