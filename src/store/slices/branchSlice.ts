import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Branch } from '../../types';
import { getBranches, createBranch } from '../../services/dataService';

interface BranchState {
    items: Branch[];
    isLoading: boolean;
    error: string | null;
}

const initialState: BranchState = {
    items: [],
    isLoading: false,
    error: null,
};

export const fetchBranches = createAsyncThunk(
    'branches/fetchAll',
    async (params: { limit?: number, startDate?: string, endDate?: string } = {}, { rejectWithValue }) => {
        try {
            return await getBranches(params.limit, { startDate: params.startDate, endDate: params.endDate });
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch branches');
        }
    },
    {
        condition: (_params, { getState }) => {
            const { branches } = getState() as { branches: BranchState };
            if (branches.isLoading) {
                return false;
            }
        },
    }
);

// Assuming createBranch signature, adjusting if necessary based on usage
export const createNewBranch = createAsyncThunk(
    'branches/create',
    async (branchData: Omit<Branch, '_id'>, { rejectWithValue }) => {
        try {
            return await createBranch(branchData);
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rejectWithValue((error as any).response?.data?.message || 'Failed to create branch');
        }
    }
);

const branchSlice = createSlice({
    name: 'branches',
    initialState,
    reducers: {
        clearBranchError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Branches
        builder.addCase(fetchBranches.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchBranches.fulfilled, (state, action: PayloadAction<Branch[]>) => {
            state.isLoading = false;
            state.items = action.payload;
        });
        builder.addCase(fetchBranches.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Create Branch
        builder.addCase(createNewBranch.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(createNewBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
            state.isLoading = false;
            state.items.push(action.payload);
        });
        builder.addCase(createNewBranch.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearBranchError } = branchSlice.actions;
export default branchSlice.reducer;
