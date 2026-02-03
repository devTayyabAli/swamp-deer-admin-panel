import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Sale, CreateSaleDTO } from '../../types';
import { getSales, createSale } from '../../services/dataService';

interface SalesState {
    items: Sale[];
    pagination: {
        page: number;
        pages: number;
        total: number;
    };
    summary: {
        totalAmount: number;
        totalProfit: number;
    };
    isLoading: boolean;
    error: string | null;
}

const initialState: SalesState = {
    items: [],
    pagination: {
        page: 1,
        pages: 1,
        total: 0
    },
    summary: {
        totalAmount: 0,
        totalProfit: 0
    },
    isLoading: false,
    error: null,
};

export const fetchSales = createAsyncThunk(
    'sales/fetchAll',
    async ({ page = 1, limit = 10, branchId, startDate, endDate, status }: {
        page?: number;
        limit?: number;
        branchId?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
    } = {}, { rejectWithValue }) => {
        try {
            return await getSales(page, limit, { branchId, startDate, endDate, status });
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch sales');
        }
    },
    {
        condition: (_, { getState }) => {
            const { sales } = getState() as { sales: SalesState };
            if (sales.isLoading) {
                return false;
            }
        },
    }
);

export const createNewSale = createAsyncThunk(
    'sales/create',
    async (saleData: CreateSaleDTO, { rejectWithValue }) => {
        try {
            return await createSale(saleData);
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return rejectWithValue((error as any).response?.data?.message || 'Failed to create sale');
        }
    }
);

const salesSlice = createSlice({
    name: 'sales',
    initialState,
    reducers: {
        clearSalesError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Sales
        builder.addCase(fetchSales.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchSales.fulfilled, (state, action) => {
            state.isLoading = false;
            state.items = action.payload.items;
            state.pagination = {
                page: action.payload.page,
                pages: action.payload.pages,
                total: action.payload.total
            };
            state.summary = action.payload.summary || { totalAmount: 0, totalProfit: 0 };
        });
        builder.addCase(fetchSales.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Create Sale
        builder.addCase(createNewSale.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(createNewSale.fulfilled, (state, action: PayloadAction<Sale>) => {
            state.isLoading = false;
            state.items.unshift(action.payload); // Add new sale to the beginning
        });
        builder.addCase(createNewSale.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearSalesError } = salesSlice.actions;
export default salesSlice.reducer;
