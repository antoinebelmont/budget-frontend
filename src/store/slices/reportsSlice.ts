import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ReportsState } from '@/types/redux';
import {
    SpendingReportData,
    NetWorthData,
    IncomeVsExpenseData,
    BudgetVsActualData,
    CategoryTrendData,
    CashFlowData,
    ReportFilters,
    SavedReport,
} from '@/types/apiTypes';
import { reportsService } from '@/services/reportsService';
import { formatDateForAPI } from '@/utils/dateHelpers';
import { subDays } from 'date-fns';

// Initial state
const today = new Date();
const thirtyDaysAgo = subDays(today, 30);

const initialState: ReportsState = {
    spending: {
        data: null,
        loading: false,
        error: null,
    },
    netWorth: {
        data: null,
        loading: false,
        error: null,
    },
    incomeVsExpense: {
        data: null,
        loading: false,
        error: null,
    },
    budgetVsActual: {
        data: null,
        loading: false,
        error: null,
    },
    categoryTrend: {
        data: null,
        loading: false,
        error: null,
    },
    cashFlow: {
        data: null,
        loading: false,
        error: null,
    },
    filters: {
        date_range: {
            start_date: formatDateForAPI(thirtyDaysAgo),
            end_date: formatDateForAPI(today),
        },
    },
    savedReports: [],
    currentTab: 'overview',
};


// ============================================
// ASYNC THUNKS
// ============================================

export const fetchSpendingReport = createAsyncThunk<SpendingReportData, ReportFilters | void>(
    'reports/fetchSpending',
    async (filters, { getState }) => {
        const state = getState() as any;
        const finalFilters = filters || state.reports.filters;
        return await reportsService.getSpendingReport(finalFilters);
    }
);

export const fetchNetWorth = createAsyncThunk<NetWorthData>(
    'reports/fetchNetWorth',
    async () => {
        return await reportsService.getNetWorth();
    }
);

export const fetchIncomeVsExpense = createAsyncThunk<IncomeVsExpenseData, number | void>(
    'reports/fetchIncomeVsExpense',
    async (months = 12) => {
        return await reportsService.getIncomeVsExpense(months);
    }
);

export const fetchBudgetVsActual = createAsyncThunk<BudgetVsActualData, string>(
    'reports/fetchBudgetVsActual',
    async (month) => {
        return await reportsService.getBudgetVsActual(month);
    }
);

export const fetchCategoryTrend = createAsyncThunk<CategoryTrendData, { categoryId: number; months?: number }>(
    'reports/fetchCategoryTrend',
    async ({ categoryId, months = 12 }) => {
        return await reportsService.getCategoryTrend(categoryId, months);
    }
);

export const fetchCashFlow = createAsyncThunk<CashFlowData, number | void>(
    'reports/fetchCashFlow',
    async (months = 12) => {
        return await reportsService.getCashFlow(months);
    }
);

export const fetchSavedReports = createAsyncThunk<SavedReport[]>(
    'reports/fetchSavedReports',
    async () => {
        return await reportsService.getSavedReports();
    }
);

export const saveReport = createAsyncThunk<
    SavedReport,
    { name: string; type: SavedReport['type']; filters: ReportFilters }
>(
    'reports/saveReport',
    async ({ name, type, filters }) => {
        return await reportsService.saveReport(name, type, filters);
    }
);

export const deleteSavedReport = createAsyncThunk<number, number>(
    'reports/deleteSavedReport',
    async (id) => {
        await reportsService.deleteSavedReport(id);
        return id;
    }
);

// Fetch all reports at once (for overview dashboard)
export const fetchAllReports = createAsyncThunk(
    'reports/fetchAll',
    async (_, { dispatch, getState }) => {
        const state = getState() as any;
        const filters = state.reports.filters;

        await Promise.all([
            dispatch(fetchSpendingReport(filters)),
            dispatch(fetchNetWorth()),
            dispatch(fetchIncomeVsExpense(6)), // Last 6 months for overview
        ]);
    }
);

// ============================================
// SLICE
// ============================================

const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<ReportFilters>>) => {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        setDateRange: (state, action: PayloadAction<{ start_date: string; end_date: string }>) => {
            state.filters.date_range = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {
                date_range: state.filters.date_range,
            };
        },
        setCurrentTab: (state, action: PayloadAction<string>) => {
            state.currentTab = action.payload;
        },
        clearReportData: (state, action: PayloadAction<keyof Omit<ReportsState, 'filters' | 'savedReports' | 'currentTab'>>) => {
            const reportType = action.payload;
            state[reportType] = {
                data: null,
                loading: false,
                error: null,
            };
        },
    },
    extraReducers: (builder) => {
        // Spending Report
        builder
            .addCase(fetchSpendingReport.pending, (state) => {
                state.spending.loading = true;
                state.spending.error = null;
            })
            .addCase(fetchSpendingReport.fulfilled, (state, action) => {
                state.spending.loading = false;
                state.spending.data = action.payload;
            })
            .addCase(fetchSpendingReport.rejected, (state, action) => {
                state.spending.loading = false;
                state.spending.error = action.error.message || 'Failed to fetch spending report';
            });

        // Net Worth
        builder
            .addCase(fetchNetWorth.pending, (state) => {
                state.netWorth.loading = true;
                state.netWorth.error = null;
            })
            .addCase(fetchNetWorth.fulfilled, (state, action) => {
                state.netWorth.loading = false;
                state.netWorth.data = action.payload;
            })
            .addCase(fetchNetWorth.rejected, (state, action) => {
                state.netWorth.loading = false;
                state.netWorth.error = action.error.message || 'Failed to fetch net worth';
            });

        // Income vs Expense
        builder
            .addCase(fetchIncomeVsExpense.pending, (state) => {
                state.incomeVsExpense.loading = true;
                state.incomeVsExpense.error = null;
            })
            .addCase(fetchIncomeVsExpense.fulfilled, (state, action) => {
                state.incomeVsExpense.loading = false;
                state.incomeVsExpense.data = action.payload;
            })
            .addCase(fetchIncomeVsExpense.rejected, (state, action) => {
                state.incomeVsExpense.loading = false;
                state.incomeVsExpense.error = action.error.message || 'Failed to fetch income vs expense';
            });

        // Budget vs Actual
        builder
            .addCase(fetchBudgetVsActual.pending, (state) => {
                state.budgetVsActual.loading = true;
                state.budgetVsActual.error = null;
            })
            .addCase(fetchBudgetVsActual.fulfilled, (state, action) => {
                state.budgetVsActual.loading = false;
                state.budgetVsActual.data = action.payload;
            })
            .addCase(fetchBudgetVsActual.rejected, (state, action) => {
                state.budgetVsActual.loading = false;
                state.budgetVsActual.error = action.error.message || 'Failed to fetch budget vs actual';
            });

        // Category Trend
        builder
            .addCase(fetchCategoryTrend.pending, (state) => {
                state.categoryTrend.loading = true;
                state.categoryTrend.error = null;
            })
            .addCase(fetchCategoryTrend.fulfilled, (state, action) => {
                state.categoryTrend.loading = false;
                state.categoryTrend.data = action.payload;
            })
            .addCase(fetchCategoryTrend.rejected, (state, action) => {
                state.categoryTrend.loading = false;
                state.categoryTrend.error = action.error.message || 'Failed to fetch category trend';
            });

        // Cash Flow
        builder
            .addCase(fetchCashFlow.pending, (state) => {
                state.cashFlow.loading = true;
                state.cashFlow.error = null;
            })
            .addCase(fetchCashFlow.fulfilled, (state, action) => {
                state.cashFlow.loading = false;
                state.cashFlow.data = action.payload;
            })
            .addCase(fetchCashFlow.rejected, (state, action) => {
                state.cashFlow.loading = false;
                state.cashFlow.error = action.error.message || 'Failed to fetch cash flow';
            });

        // Saved Reports
        builder
            .addCase(fetchSavedReports.fulfilled, (state, action) => {
                state.savedReports = action.payload;
            })
            .addCase(saveReport.fulfilled, (state, action) => {
                state.savedReports.push(action.payload);
            })
            .addCase(deleteSavedReport.fulfilled, (state, action) => {
                state.savedReports = state.savedReports.filter(r => r.id !== action.payload);
            });
    },
});

export const {
    setFilters,
    setDateRange,
    clearFilters,
    setCurrentTab,
    clearReportData,
} = reportsSlice.actions;

export default reportsSlice.reducer;


// These can be used in components for derived state
export const selectSpendingData = (state: any) => state.reports.spending.data;
export const selectNetWorthData = (state: any) => state.reports.netWorth.data;
export const selectIncomeVsExpenseData = (state: any) => state.reports.incomeVsExpense.data;
export const selectBudgetVsActualData = (state: any) => state.reports.budgetVsActual.data;
export const selectCategoryTrendData = (state: any) => state.reports.categoryTrend.data;
export const selectCashFlowData = (state: any) => state.reports.cashFlow.data;
export const selectReportFilters = (state: any) => state.reports.filters;
export const selectSavedReports = (state: any) => state.reports.savedReports;
export const selectCurrentTab = (state: any) => state.reports.currentTab;

// Loading states
export const selectAnyReportLoading = (state: any) => {
    const { spending, netWorth, incomeVsExpense, budgetVsActual, categoryTrend, cashFlow } = state.reports;
    return spending.loading || netWorth.loading || incomeVsExpense.loading ||
        budgetVsActual.loading || categoryTrend.loading || cashFlow.loading;
};