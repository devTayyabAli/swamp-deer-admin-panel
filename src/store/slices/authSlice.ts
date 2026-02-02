import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../../types';
import * as authService from '../../services/authService';

interface AuthState {
    user: AuthResponse | null;
    isLoading: boolean;
    error: string | null;
}

// Load initial user from localStorage
const storedUser = localStorage.getItem('user');
const initialState: AuthState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    isLoading: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            return await authService.login(credentials);
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rejectWithValue((error as any).response?.data?.message || 'Failed to login');
        }
    }
);

export const adminLoginUser = createAsyncThunk(
    'auth/adminLogin',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            return await authService.adminLogin(credentials);
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rejectWithValue((error as any).response?.data?.message || 'Failed to login as admin');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (credentials: RegisterCredentials, { rejectWithValue }) => {
        try {
            return await authService.register(credentials);
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rejectWithValue((error as any).response?.data?.message || 'Failed to register');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.error = null;
            authService.logout();
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
            state.isLoading = false;
            state.user = action.payload;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Admin Login
        builder.addCase(adminLoginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(adminLoginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
            state.isLoading = false;
            state.user = action.payload;
        });
        builder.addCase(adminLoginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state) => {
            state.isLoading = false;
            // Removed state.user update to keep admin logged in
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
