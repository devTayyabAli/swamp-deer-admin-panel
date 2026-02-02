import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../../types';
import * as authService from '../../services/authService';

interface UsersState {
    items: User[];
    isLoading: boolean;
    error: string | null;
    pagination: {
        page: number;
        pages: number;
        total: number;
    };
}

const initialState: UsersState = {
    items: [],
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        pages: 1,
        total: 0
    },
};

export const fetchAllUsers = createAsyncThunk(
    'users/fetchAll',
    async ({ page = 1, limit = 10, roles = [] }: { page?: number, limit?: number, roles?: string[] } = {}, { rejectWithValue }) => {
        try {
            return await authService.getUsers(page, limit, roles);
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch users');
        }
    },
    {
        condition: (_, { getState }) => {
            const { users } = getState() as { users: UsersState };
            if (users.isLoading) return false;
        }
    }
);

export const toggleStatus = createAsyncThunk(
    'users/toggleStatus',
    async (id: string, { rejectWithValue }) => {
        try {
            return await authService.toggleUserStatus(id);
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rejectWithValue((error as any).response?.data?.message || 'Failed to toggle status');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearUsersError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAllUsers.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchAllUsers.fulfilled, (state, action) => {
            state.isLoading = false;
            state.items = action.payload.items;
            state.pagination = {
                page: action.payload.page,
                pages: action.payload.pages,
                total: action.payload.total
            };
        });
        builder.addCase(fetchAllUsers.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        builder.addCase(toggleStatus.fulfilled, (state, action) => {
            const user = state.items.find(u => u._id === action.meta.arg);
            if (user) {
                user.status = action.payload.status;
            }
        });
    },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
