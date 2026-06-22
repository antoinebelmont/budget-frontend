import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BudgetState } from '../../types/redux';
import { CategoryGroup, Category } from '../../types/apiTypes';
import apiService from '../../services/api';
import { createCategory, updateCategory, deleteCategory } from './categoriesSlice';

const initialState: BudgetState = {
    categoryGroups: [],
    currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
    loading: false,
    error: null,
};

export const fetchBudget = createAsyncThunk<CategoryGroup[], string | undefined>(
    'budget/fetchBudget',
    async (month) => {
        const params = month ? { month } : {};
        const response = await apiService.get<{ category_groups: CategoryGroup[] }>('/budget', params);
        return response.category_groups;
    }
);

export const updateCategoryBudget = createAsyncThunk<
    Category,
    { categoryId: number; budgeted: number }
>('budget/updateCategoryBudget', async ({ categoryId, budgeted }) => {
    const response = await apiService.put<{ category: Category }>(
        `/categories/${categoryId}/budget`,
        { budgeted }
    );
    return response.category;
});

const budgetSlice = createSlice({
    name: 'budget',
    initialState,
    reducers: {
        setCurrentMonth: (state, action) => {
            state.currentMonth = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBudget.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBudget.fulfilled, (state, action) => {
                state.loading = false;
                state.categoryGroups = action.payload;
            })
            .addCase(fetchBudget.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch budget';
            })
            .addCase(updateCategoryBudget.fulfilled, (state, action) => {
                // Update the category in the nested structure
                state.categoryGroups.forEach((group) => {
                    const categoryIndex = group.categories.findIndex(
                        (cat) => cat.id === action.payload.id
                    );
                    if (categoryIndex !== -1) {
                        group.categories[categoryIndex] = action.payload;
                    }
                });
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                // Only add if it's a new category (not a duplicate from backend)
                if (action.payload.duplicate) {
                    return;
                }
                const category = action.payload.category;
                const group = state.categoryGroups.find(
                    g => g.id === category.category_group_id
                );
                if (group) {
                    // ✅ Ensure proper initial values (prevents NaN)
                    const newCategory = {
                        ...category,
                        activity: category.activity || 0,
                        available: category.available || category.budgeted || 0,
                        budgeted: category.budgeted || 0,
                    };
                    group.categories.push(newCategory);
                }
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                // Update the category in the appropriate group
                state.categoryGroups.forEach(group => {
                    const index = group.categories.findIndex(
                        cat => cat.id === action.payload.id
                    );
                    if (index !== -1) {
                        group.categories[index] = action.payload;
                    }
                });
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                // Remove the category from its group
                state.categoryGroups.forEach(group => {
                    group.categories = group.categories.filter(
                        cat => cat.id !== action.payload
                    );
                });
            });
    },
});

export const { setCurrentMonth } = budgetSlice.actions;
export default budgetSlice.reducer;