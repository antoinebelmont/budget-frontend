import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Goal, GoalForm } from '../../types/apiTypes';
import apiService from '../../services/api';

interface GoalsState {
    items: Goal[];
    loading: boolean;
    error: string | null;
    selectedGoal: Goal | null;
    milestones: GoalMilestone[];
}

interface GoalMilestone {
    goalId: number;
    percentage: number;
    achievedAt: string;
    amount: number;
}

const initialState: GoalsState = {
    items: [],
    loading: false,
    error: null,
    selectedGoal: null,
    milestones: [],
};

export const fetchGoals = createAsyncThunk('goals/fetchGoals', async () => {
    const response = await apiService.get<{ goals: Goal[] }>('/goals');
    return response.goals;
});

export const fetchGoalById = createAsyncThunk<Goal, number>(
    'goals/fetchGoalById',
    async (id) => {
        const response = await apiService.get<{ goal: Goal }>(`/goals/${id}`);
        return response.goal;
    }
);

export const createGoal = createAsyncThunk<Goal, GoalForm>(
    'goals/createGoal',
    async (goalData) => {
        const response = await apiService.post<{ goal: Goal }>('/goals', goalData);
        return response.goal;
    }
);

export const updateGoal = createAsyncThunk<Goal, { id: number } & Partial<GoalForm>>(
    'goals/updateGoal',
    async ({ id, ...goalData }) => {
        const response = await apiService.put<{ goal: Goal }>(`/goals/${id}`, goalData);
        return response.goal;
    }
);

export const deleteGoal = createAsyncThunk<number, number>(
    'goals/deleteGoal',
    async (id) => {
        await apiService.delete(`/goals/${id}`);
        return id;
    }
);

export const fundGoal = createAsyncThunk<
    Goal,
    { goalId: number; amount: number; accountId: number; date: string }
>(
    'goals/fundGoal',
    async ({ goalId, amount, accountId, date }) => {
        // Create transaction for funding
        await apiService.post('/transaction-goal', {
            goal_id: goalId,
            account_id: accountId,
            amount: amount,
            date: date,
            cleared: 'cleared',
            memo: 'Goal funding',
        });

        // Fetch updated goal
        const response = await apiService.get<{ goal: Goal }>(`/goals/${goalId}`);
        return response.goal;
    }
);

const goalsSlice = createSlice({
    name: 'goals',
    initialState,
    reducers: {
        setSelectedGoal: (state, action) => {
            state.selectedGoal = action.payload;
        },
        clearSelectedGoal: (state) => {
            state.selectedGoal = null;
        },
        addMilestone: (state, action) => {
            state.milestones.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGoals.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGoals.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchGoals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch goals';
            })
            .addCase(fetchGoalById.fulfilled, (state, action) => {
                state.selectedGoal = action.payload;
            })
            .addCase(createGoal.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updateGoal.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.selectedGoal?.id === action.payload.id) {
                    state.selectedGoal = action.payload;
                }
            })
            .addCase(deleteGoal.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
                if (state.selectedGoal?.id === action.payload) {
                    state.selectedGoal = null;
                }
            })
            .addCase(fundGoal.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    },
});

export const { setSelectedGoal, clearSelectedGoal, addMilestone } = goalsSlice.actions;
export default goalsSlice.reducer;