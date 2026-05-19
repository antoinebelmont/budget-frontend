import apiService from './api';
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

export class ReportsService {
    async getSpendingReport(filters: ReportFilters): Promise<SpendingReportData> {
        return await apiService.get<SpendingReportData>('/reports/spending', {
            start_date: filters.date_range.start_date,
            end_date: filters.date_range.end_date,
            category_id: filters.category_id,
        });
    }

    async getNetWorth(): Promise<NetWorthData> {
        return await apiService.get<NetWorthData>('/reports/net-worth');
    }

    async getIncomeVsExpense(months: number = 12): Promise<IncomeVsExpenseData> {
        return await apiService.get<IncomeVsExpenseData>('/reports/income-vs-expense', {
            months,
        });
    }

    async getBudgetVsActual(month: string): Promise<BudgetVsActualData> {
        return await apiService.get<BudgetVsActualData>('/reports/budget-vs-actual', {
            month,
        });
    }

    async getCategoryTrend(categoryId: number, months: number = 12): Promise<CategoryTrendData> {
        return await apiService.get<CategoryTrendData>(`/reports/category-trend/${categoryId}`, {
            months,
        });
    }

    async getCashFlow(months: number = 12): Promise<CashFlowData> {
        return await apiService.get<CashFlowData>('/reports/cash-flow', {
            months,
        });
    }

    async getSavedReports(): Promise<SavedReport[]> {
        const response = await apiService.get<{ reports: SavedReport[] }>('/reports/saved');
        return response.reports;
    }

    async saveReport(name: string, type: SavedReport['type'], filters: ReportFilters): Promise<SavedReport> {
        const response = await apiService.post<{ report: SavedReport }>('/reports/saved', {
            name,
            type,
            filters,
        });
        return response.report;
    }

    async deleteSavedReport(id: number): Promise<void> {
        await apiService.delete(`/reports/saved/${id}`);
    }
}

export const reportsService = new ReportsService();
