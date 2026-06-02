import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Account, AccountForm } from '@/types/apiTypes';
import apiService from '@/services/api';

export interface AccountsState {
    items: Account[];
    currentAccount: Account | null;
    loading: boolean;
    error: string | null;
    sidebarAccounts: Array<{ id: number; name: string; type: string; transaction_count: number; has_transactions: boolean }>;
}

const initialState: AccountsState = {
    items: [],
    currentAccount: null,
    loading: false,
    error: null,
    sidebarAccounts: [],
};

export const fetchAccounts = createAsyncThunk('accounts/fetchAccounts', async () => {
    const response = await apiService.get<{ accounts: Account[] }>('/accounts');
    return response.accounts;
});

// ✅ Fetch single account by ID
export const fetchAccountById = createAsyncThunk<Account, number>(
    'accounts/fetchAccountById',
    async (id) => {
        const response = await apiService.get<{ account: Account }>(`/accounts/${id}`);
        return response.account;
    }
);

// Create account
export const createAccount = createAsyncThunk<Account, AccountForm>(
    'accounts/createAccount',
    async (accountData) => {
        const response = await apiService.post<{ account: Account }>('/accounts', accountData);
        return response.account;
    }
);

// Update account
export const updateAccount = createAsyncThunk<Account, { id: number } & Partial<AccountForm>>(
    'accounts/updateAccount',
    async ({ id, ...accountData }) => {
        const response = await apiService.put<{ account: Account }>(`/accounts/${id}`, accountData);
        return response.account;
    }
);

// Delete account
export const deleteAccount = createAsyncThunk<number, number>(
    'accounts/deleteAccount',
    async (id) => {
        await apiService.delete(`/accounts/${id}`);
        return id;
    }
);

// Fetch accounts for sidebar (with transaction counts)
export const fetchAccountsForSidebar = createAsyncThunk('accounts/fetchAccountsForSidebar', async () => {
    const response = await apiService.get<{ accounts: Array<{ id: number; name: string; type: string; transaction_count: number; has_transactions: boolean }> }>('/accounts/for-sidebar');
    return response.accounts;
});

// ============================================
// SLICE
// ============================================

const accountsSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        // ✅ ADD THIS REDUCER - Clear current account when leaving detail page
        clearCurrentAccount: (state) => {
            state.currentAccount = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all accounts
            .addCase(fetchAccounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch accounts';
            })

            // ✅ Fetch single account by ID
            .addCase(fetchAccountById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAccountById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentAccount = action.payload;
            })
            .addCase(fetchAccountById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch account';
            })

            // Create account
            .addCase(createAccount.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })

            // Update account
            .addCase(updateAccount.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                // ✅ Also update currentAccount if it's the same account
                if (state.currentAccount?.id === action.payload.id) {
                    state.currentAccount = action.payload;
                }
            })

            // Delete account
            .addCase(deleteAccount.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
                // ✅ Clear currentAccount if it was deleted
                if (state.currentAccount?.id === action.payload) {
                    state.currentAccount = null;
                }
            })

            // Fetch accounts for sidebar
            .addCase(fetchAccountsForSidebar.fulfilled, (state, action) => {
                state.sidebarAccounts = action.payload;
            });
    },
});

// ✅ EXPORT THE ACTION
export const { clearCurrentAccount } = accountsSlice.actions;

export default accountsSlice.reducer;
