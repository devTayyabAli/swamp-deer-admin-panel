import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Investor } from '../../types';
import { getInvestors, createInvestor } from '../../services/dataService';

interface InvestorState {
    items: Investor[];
    isLoading: boolean;
    error: string | null;
    pagination: {
        page: number;
        pages: number;
        total: number;
        totalAmountInvested: number;
        totalRewardPaid: number;
    };
}

const initialState: InvestorState = {
    items: [],
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        pages: 1,
        total: 0,
        totalAmountInvested: 0,
        totalRewardPaid: 0
    },
};

export const fetchInvestors = createAsyncThunk(
    'investors/fetchAll',
    async ({ page = 1, limit = 10, startDate, endDate }: { page?: number; limit?: number; startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
        try {
            return await getInvestors(page, limit, { startDate, endDate });
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch investors');
        }
    },
    {
        condition: (_, { getState }) => {
            const { investors } = getState() as { investors: InvestorState };
            if (investors.isLoading) {
                return false;
            }
        },
    }
);

// Assuming createInvestor signature
export const createNewInvestor = createAsyncThunk(
    'investors/create',
    async (investorData: Omit<Investor, '_id'>, { rejectWithValue }) => {
        try {
            return await createInvestor(investorData);
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rejectWithValue((error as any).response?.data?.message || 'Failed to create investor');
        }
    }
);

const investorSlice = createSlice({
    name: 'investors',
    initialState,
    reducers: {
        clearInvestorError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Investors
        builder.addCase(fetchInvestors.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchInvestors.fulfilled, (state, action) => {
            state.isLoading = false;
            state.items = action.payload.items;
            state.pagination = {
                page: action.payload.page,
                pages: action.payload.pages,
                total: action.payload.total,
                totalAmountInvested: action.payload.totalAmountInvested || 0,
                totalRewardPaid: action.payload.totalRewardPaid || 0
            };
        });
        builder.addCase(fetchInvestors.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Create Investor
        builder.addCase(createNewInvestor.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(createNewInvestor.fulfilled, (state, action: PayloadAction<Investor>) => {
            state.isLoading = false;
            state.items.push(action.payload);
        });
        builder.addCase(createNewInvestor.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearInvestorError } = investorSlice.actions;
export default investorSlice.reducer;
