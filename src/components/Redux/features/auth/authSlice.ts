import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../../store';

export interface TAuthState {
    user: null | object,
    token: null | string
}

const initialState: TAuthState = {
    user: null,
    token: null
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token
        },
        logout: (state) => {
            state.user = null;
            state.token = null
        }
    },
})

export const { setUser, logout } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;