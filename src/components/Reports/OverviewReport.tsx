import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAllReports } from '../../store/slices/reportsSlice';
import StatCard from './StatCard';
import ChartContainer from './ChartContainer';
import ReportFilters from './ReportFilters';
import {
    BanknotesIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ScaleIcon,
} from '@heroicons/react/24/outline';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency, CATEGORY_COLORS, getColorByIndex } from '../../utils/chartHelpers';
import { format } from 'date-fns';

const OverviewReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const { spending, netWorth, incomeVsExpense } = useAppSelector((state) => state.reports);
    const filters = useAppSelector((state) => state.reports.filters);

    useEffect(() => {
        dispatch(fetchAllReports());
    }, [dispatch, filters.date_range]);

    const isLoading = spending.loading || netWorth.loading || incomeVsExpense.loading;

    // Calculate summary stats
    const totalSpent = spending.data?.total_spent || 0;
    const totalIncome = incomeVsExpense.data?.summary.total_income || 0;
    const totalExpenses = incomeVsExpense.data?.summary.total_expenses || 0;
    const netAmount = totalIncome - Math.abs(totalExpenses);
    const currentNetWorth = netWorth.data?.net_worth || 0;

    // Prepare data for top categories chart
    const topCategoriesData = spending.data?.by_category.slice(0, 6).map((item, index) => ({
        name: item.category,
        amount: item.total,
        color: getColorByIndex(index),
    })) || [];

    // Prepare data for income vs expense trend
    const trendData = incomeVsExpense.data?.monthly_data.map((item) => ({
        month: format(new Date(item.month + '-01'), 'MMM'),
        income: item.income,
        expenses: Math.abs(item.expenses),
        net: item.net,
    })) || [];

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[var(--bg-surface)] p-3 border border-[var(--border-default)] rounded-lg shadow-lg">
                    <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            <span className="font-medium">{entry.name}:</span> {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <ReportFilters
                showAccountFilter={true}
                showCategoryFilter={false}
                showCategoryGroupFilter={false}
            />

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Income"
                    value={totalIncome}
                    format="currency"
                    icon={<ArrowTrendingUpIcon className="h-6 w-6 text-success-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Total Expenses"
                    value={Math.abs(totalExpenses)}
                    format="currency"
                    icon={<ArrowTrendingDownIcon className="h-6 w-6 text-danger-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Net Income"
                    value={netAmount}
                    format="currency"
                    icon={<BanknotesIcon className="h-6 w-6 text-primary-600" />}
                    description={netAmount >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
                    loading={isLoading}
                />
                <StatCard
                    title="Net Worth"
                    value={currentNetWorth}
                    format="currency"
                    icon={<ScaleIcon className="h-6 w-6 text-indigo-600" />}
                    loading={isLoading}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expense Trend */}
                <ChartContainer
                    title="Income vs Expense Trend"
                    subtitle="Last 6 months comparison"
                    loading={incomeVsExpense.loading}
                    error={incomeVsExpense.error}
                >
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12 }}
                                    stroke="#6b7280"
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    stroke="#6b7280"
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize: '14px' }}
                                    iconType="line"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    name="Income"
                                    dot={{ fill: '#22c55e', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    name="Expenses"
                                    dot={{ fill: '#ef4444', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-[var(--text-muted)]">
                            No data available
                        </div>
                    )}
                </ChartContainer>

                {/* Top Spending Categories */}
                <ChartContainer
                    title="Top Spending Categories"
                    subtitle="Where your money goes"
                    loading={spending.loading}
                    error={spending.error}
                >
                    {topCategoriesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topCategoriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    stroke="#6b7280"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    stroke="#6b7280"
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="amount" name="Spent" radius={[8, 8, 0, 0]}>
                                    {topCategoriesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-[var(--text-muted)]">
                            No spending data available
                        </div>
                    )}
                </ChartContainer>
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6">
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Average Monthly Spend</h3>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {formatCurrency(incomeVsExpense.data?.summary.average_monthly_expenses || 0)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-2">Based on selected period</p>
                </div>

                <div className="card p-6">
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Total Transactions</h3>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {spending.data?.transaction_count.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-2">In selected period</p>
                </div>

                <div className="card p-6">
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Savings Rate</h3>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {totalIncome > 0
                            ? `${((netAmount / totalIncome) * 100).toFixed(1)}%`
                            : '0%'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                        {netAmount >= 0 ? 'Money saved' : 'Spending deficit'}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Insights</h3>
                <div className="space-y-3">
                    {spending.data && spending.data.by_category.length > 0 && (
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <span className="text-sm">📊</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                    Top spending category: {spending.data.by_category[0].category}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {formatCurrency(spending.data.by_category[0].total)} spent (
                                    {spending.data.by_category[0].count} transactions)
                                </p>
                            </div>
                        </div>
                    )}

                    {netAmount >= 0 ? (
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                                <span className="text-sm">✅</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                    Great job! You're in the green
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    Your income exceeds expenses by {formatCurrency(netAmount)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                                <span className="text-sm">⚠️</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                    Watch your spending
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    You're spending {formatCurrency(Math.abs(netAmount))} more than your income
                                </p>
                            </div>
                        </div>
                    )}

                    {netWorth.data && netWorth.data.accounts.length > 0 && (
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm">🏦</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                    You have {netWorth.data.accounts.length} active accounts
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    Combined net worth: {formatCurrency(currentNetWorth)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewReport;