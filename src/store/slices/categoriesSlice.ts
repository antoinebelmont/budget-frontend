import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Category, CategoryForm } from '../../types/apiTypes';
import apiService from '../../services/api';

export interface CategoriesState {
    items: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoriesState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async () => {
    const response = await apiService.get<{ categories: Category[] }>('/categories');
    return response.categories;
});

export const createCategory = createAsyncThunk<{ category: Category; duplicate: boolean }, CategoryForm>(
    'categories/createCategory',
    async (categoryData) => {
        const response = await apiService.post<{ category: Category; duplicate: boolean }>('/categories', categoryData);
        return response;
    }
);

export const updateCategory = createAsyncThunk<Category, { id: number } & Partial<CategoryForm>>(
    'categories/updateCategory',
    async ({ id, ...categoryData }) => {
        const response = await apiService.put<{ category: Category }>(`/categories/${id}`, categoryData);
        return response.category;
    }
);

export const deleteCategory = createAsyncThunk<number, number>(
    'categories/deleteCategory',
    async (id) => {
        await apiService.delete(`/categories/${id}`);
        return id;
    }
);

export const moveCategory = createAsyncThunk<Category, { id: number; category_group_id: number }>(
    'categories/moveCategory',
    async ({ id, category_group_id }) => {
        const response = await apiService.put<{ category: Category }>(`/categories/${id}/move`, { category_group_id });
        return response.category;
    }
);

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch categories';
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                // Only add to items if it's a new category (not a duplicate)
                if (!action.payload.duplicate) {
                    state.items.push(action.payload.category);
                }
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            })
            .addCase(moveCategory.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    },
});

export default categoriesSlice.reducer;