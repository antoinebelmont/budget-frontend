import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Transaction, TransactionForm, PaginatedResponse } from '@/types/apiTypes';
import apiService from '../../services/api';

interface TransactionsState {
    items: Transaction[];
    pagination: any;
    loading: boolean;
    error: string | null;
    filters: {
        account_id?: number;
        category_id?: number;
        payee_id?: number;
        start_date?: string;
        end_date?: string;
        search?: string;
        per_page?: number;
        page?: number;
    };
}

const initialState: TransactionsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
    filters: {},
};

export const fetchTransactions = createAsyncThunk(
    'transactions/fetchTransactions',
    async (filters?: TransactionsState['filters']) => {
        const response = await apiService.get<any>('/transactions', filters);
        return response;
    }
);

export const createTransaction = createAsyncThunk<Transaction, TransactionForm>(
    'transactions/createTransaction',
    async (transactionData) => {
        const response = await apiService.post<{ transaction: Transaction }>('/transactions', transactionData);
        return response.transaction;
    }
);

export const updateTransaction = createAsyncThunk<Transaction, { id: number } & Partial<TransactionForm>>(
    'transactions/updateTransaction',
    async ({ id, ...transactionData }) => {
        const response = await apiService.put<{ transaction: Transaction }>(`/transactions/${id}`, transactionData);
        return response.transaction;
    }
);

export const deleteTransaction = createAsyncThunk<number, number>(
    'transactions/deleteTransaction',
    async (id) => {
        await apiService.delete(`/transactions/${id}`);
        return id;
    }
);

export const bulkDeleteTransactions = createAsyncThunk<number[], number[]>(
    'transactions/bulkDeleteTransactions',
    async (ids) => {
        await apiService.post('/transactions/bulk-delete', { ids });
        return ids;
    }
);

export const bulkUpdateTransactionsStatus = createAsyncThunk<
    { ids: number[]; cleared: string },
    { ids: number[]; cleared: 'cleared' | 'uncleared' | 'reconciled' }
>('transactions/bulkUpdateTransactionsStatus', async ({ ids, cleared }) => {
    await apiService.post<{ transactions: Transaction[] }>('/transactions/bulk-update-status', { ids, cleared });
    return { ids, cleared };
});

export const bulkUpdateCategory = createAsyncThunk<
    { ids: number[]; category_id: number | null },
    { ids: number[]; category_id: number | null }
>('transactions/bulkUpdateCategory', async ({ ids, category_id }) => {
    await apiService.post<{ transactions: Transaction[] }>('/transactions/bulk-update-category', { ids, category_id });
    return { ids, category_id };
});

const transactionsSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = {
                    current_page: action.payload.current_page,
                    from: action.payload.from,
                    last_page: action.payload.last_page,
                    per_page: action.payload.per_page,
                    to: action.payload.to,
                    total: action.payload.total,
                };
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch transactions';
            })
            .addCase(createTransaction.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(updateTransaction.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            })
            .addCase(bulkDeleteTransactions.fulfilled, (state, action) => {
                state.items = state.items.filter(item => !action.payload.includes(item.id));
            })
            .addCase(bulkUpdateTransactionsStatus.fulfilled, (state, action) => {
                const { ids, cleared } = action.payload;
                state.items = state.items.map(item =>
                    ids.includes(item.id) ? { ...item, cleared: cleared as Transaction['cleared'] } : item
                );
            })
            .addCase(bulkUpdateCategory.fulfilled, (state, action) => {
                const { ids, category_id } = action.payload;
                state.items = state.items.map(item =>
                    ids.includes(item.id) ? { ...item, category_id: category_id ?? undefined, category: category_id ? item.category : undefined } : item
                );
            });
    },
});

export const { setFilters, clearFilters } = transactionsSlice.actions;
export default transactionsSlice.reducer;