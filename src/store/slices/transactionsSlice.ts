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
        const response = await apiService.get<PaginatedResponse<Transaction>>('/transactions', filters);
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
    console.log('bulkUpdateTransactionsStatus thunk called', { ids, cleared });
    const token = localStorage.getItem('auth_token');
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    console.log('Making request to:', `${baseURL}/transactions/bulk-update-status`);
    const response = await fetch(`${baseURL}/transactions/bulk-update-status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ ids, cleared }),
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
        throw new Error('Request failed');
    }
    return { ids, cleared };
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
                state.pagination = action.payload.meta;
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
            });
    },
});

export const { setFilters, clearFilters } = transactionsSlice.actions;
export default transactionsSlice.reducer;