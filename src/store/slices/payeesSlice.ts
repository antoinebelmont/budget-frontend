import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Payee } from '@/types/apiTypes';
import apiService from '@/services/api';

interface PayeesState {
    items: Payee[];
    loading: boolean;
    error: string | null;
}

const initialState: PayeesState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchPayees = createAsyncThunk(
    'payees/fetchPayees',
    async (searchTerm?: string) => {
        const params = searchTerm ? { search: searchTerm } : {};
        const response = await apiService.get<{ payees: Payee[] }>('/payees', params);
        return response.payees;
    }
);

export const createPayee = createAsyncThunk<Payee, { name: string; auto_assign_category_id?: number }>(
    'payees/createPayee',
    async (payeeData) => {
        const response = await apiService.post<{ payee: Payee }>('/payees', payeeData);
        return response.payee;
    }
);

export const updatePayee = createAsyncThunk<Payee, { id: number; name?: string; auto_assign_category_id?: number }>(
    'payees/updatePayee',
    async ({ id, ...payeeData }) => {
        const response = await apiService.put<{ payee: Payee }>(`/payees/${id}`, payeeData);
        return response.payee;
    }
);

export const deletePayee = createAsyncThunk<number, number>(
    'payees/deletePayee',
    async (id) => {
        await apiService.delete(`/payees/${id}`);
        return id;
    }
);

const payeesSlice = createSlice({
    name: 'payees',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPayees.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPayees.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchPayees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch payees';
            })
            .addCase(createPayee.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updatePayee.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deletePayee.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    },
});

export default payeesSlice.reducer;