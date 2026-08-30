import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  name: string
  email: string
}

interface UserState {
  user: User | null
  token: string | null
}

const initialState: UserState = {
  user: null,
  token: null,
}

const userSlice = createSlice({
  name: 'user',

  initialState,

  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },

    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
    },

    logout(state) {
      state.user = null
      state.token = null
    },
  },
})

export const {
  setUser,
  setToken,
  logout,
} = userSlice.actions

export default userSlice.reducer