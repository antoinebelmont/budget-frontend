import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from '../../types/redux';
import { User, AuthResponse, LoginForm, RegisterForm } from '../../types/apiTypes';
import { authService } from '../../services/authService';
import apiService from '../../services/api';

const getStoredPreferences = (): Record<string, unknown> | null => {
    try {
        const raw = localStorage.getItem('preferences');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const initialState: AuthState = {
    user: authService.getCurrentUser(),
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated(),
    loading: false,
    error: null,
    preferences: getStoredPreferences(),
};

export const loginUser = createAsyncThunk<AuthResponse, LoginForm>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            return await authService.login(credentials);
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(e.response?.data?.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk<AuthResponse, RegisterForm>(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            return await authService.register(userData);
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(e.response?.data?.message || 'Registration failed');
        }
    }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    await authService.logout();
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
    const response = await authService.me();
    return response.user;
});

export const fetchUserPreferences = createAsyncThunk('auth/fetchUserPreferences', async () => {
    const response = await apiService.get<{ preferences: Record<string, unknown> }>('/user/preferences');
    return response.preferences;
});

export const updateUserPreferences = createAsyncThunk(
    'auth/updateUserPreferences',
    async (preferences: Record<string, unknown>) => {
        const response = await apiService.put<{ preferences: Record<string, unknown> }>('/user/preferences', { preferences });
        return response.preferences;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
                state.preferences = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            .addCase(fetchUserPreferences.fulfilled, (state, action) => {
                state.preferences = action.payload;
                authService.setPreferences(action.payload);
            })
            .addCase(updateUserPreferences.fulfilled, (state, action) => {
                state.preferences = action.payload;
                authService.setPreferences(action.payload);
            });
    },
});

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
