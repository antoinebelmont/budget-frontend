
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchSpendingReport } from '../../store/slices/reportsSlice';
import ReportFilters from './ReportFilters';
import ChartContainer from './ChartContainer';
import StatCard from './StatCard';
import EmptyState from './EmptyState';
import {
    BanknotesIcon,
    ShoppingCartIcon,
    UserGroupIcon,
    ArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatCurrencyDetailed, getColorByIndex } from '../../utils/chartHelpers';

const SpendingReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const { spending } = useAppSelector((state) => state.reports);
    const filters = useAppSelector((state) => state.reports.filters);
    const [chartView, setChartView] = useState<'pie' | 'bar'>('pie');
    const [showAllCategories, setShowAllCategories] = useState(false);

    useEffect(() => {
        dispatch(fetchSpendingReport(filters));
    }, [dispatch, filters]);

    const data = spending.data;
    const isLoading = spending.loading;

    // Prepare category data
    const categoryData = data?.by_category.map((item, index) => ({
        name: item.category,
        value: item.total,
        count: item.count,
        color: getColorByIndex(index),
        percentage: (item.total / (data.total_spent || 1)) * 100,
    })) || [];

    // Show top 10 or all
    const displayedCategories = showAllCategories
        ? categoryData
        : categoryData.slice(0, 10);

    // Prepare payee data (top 10)
    const payeeData = data?.top_payees.slice(0, 10).map((item, index) => ({
        name: item.payee,
        value: item.total,
        count: item.count,
        color: getColorByIndex(index),
    })) || [];

    // Calculate average transaction amount
    const avgTransaction = data?.transaction_count
        ? data.total_spent / data.transaction_count
        : 0;

    // Custom label for pie chart
    const renderLabel = (entry: any) => {
        return `${entry.percentage.toFixed(1)}%`;
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-[var(--bg-surface)] p-4 border border-[var(--border-default)] rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">{data.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                        <span className="font-medium">Amount:</span> {formatCurrencyDetailed(data.value)}
                    </p>
                    {data.count && (
                        <p className="text-sm text-[var(--text-secondary)]">
                            <span className="font-medium">Transactions:</span> {data.count}
                        </p>
                    )}
                    {data.percentage && (
                        <p className="text-sm text-[var(--text-secondary)]">
                            <span className="font-medium">Percentage:</span> {data.percentage.toFixed(1)}%
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (!data && !isLoading) {
        return (
            <div className="space-y-6">
                <ReportFilters showAccountFilter showCategoryFilter />
                <EmptyState
                    title="No spending data"
                    message="There are no expenses in the selected period. Try changing your date range."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <ReportFilters showAccountFilter showCategoryFilter showCategoryGroupFilter />

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Spent"
                    value={data?.total_spent || 0}
                    format="currency"
                    icon={<BanknotesIcon className="h-6 w-6 text-danger-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Transactions"
                    value={data?.transaction_count || 0}
                    format="number"
                    icon={<ShoppingCartIcon className="h-6 w-6 text-primary-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Categories"
                    value={categoryData.length}
                    format="number"
                    icon={<UserGroupIcon className="h-6 w-6 text-indigo-600" />}
                    description={`${categoryData.length} categories used`}
                    loading={isLoading}
                />
                <StatCard
                    title="Avg Transaction"
                    value={avgTransaction}
                    format="currency"
                    icon={<ArrowDownIcon className="h-6 w-6 text-warning-600" />}
                    loading={isLoading}
                />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending by Category - Pie or Bar */}
                <ChartContainer
                    title="Spending by Category"
                    subtitle={`${displayedCategories.length} categories shown`}
                    loading={isLoading}
                    error={spending.error}
                    actions={
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setChartView('pie')}
                                className={`px-3 py-1 text-xs font-medium rounded ${
                                    chartView === 'pie'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                Pie
                            </button>
                            <button
                                onClick={() => setChartView('bar')}
                                className={`px-3 py-1 text-xs font-medium rounded ${
                                    chartView === 'bar'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                Bar
                            </button>
                        </div>
                    }
                >
                    {displayedCategories.length > 0 ? (
                        <>
                            {chartView === 'pie' ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={displayedCategories}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderLabel}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {displayedCategories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={displayedCategories} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => formatCurrency(value)}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={120}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" name="Amount" radius={[0, 8, 8, 0]}>
                                            {displayedCategories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}

                            {categoryData.length > 10 && (
                                <div className="text-center mt-4">
                                    <button
                                        onClick={() => setShowAllCategories(!showAllCategories)}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        {showAllCategories
                                            ? 'Show Top 10'
                                            : `Show All ${categoryData.length} Categories`}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-[350px] flex items-center justify-center text-[var(--text-muted)]">
                            No category data available
                        </div>
                    )}
                </ChartContainer>

                {/* Top Payees */}
                <ChartContainer
                    title="Top 10 Payees"
                    subtitle="Where you spend the most"
                    loading={isLoading}
                    error={spending.error}
                >
                    {payeeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={payeeData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={120}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Amount" radius={[0, 8, 8, 0]}>
                                    {payeeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[350px] flex items-center justify-center text-[var(--text-muted)]">
                            No payee data available
                        </div>
                    )}
                </ChartContainer>
            </div>

            {/* Detailed Category Breakdown Table */}
            <ChartContainer title="Detailed Breakdown" subtitle="Complete spending analysis">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-default)]">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                Category
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                Transactions
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                Avg/Transaction
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                % of Total
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-[var(--bg-surface)] divide-y divide-[var(--border-default)]">
                        {categoryData.map((category, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                      <span
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                      />
                                        <span className="text-sm font-medium text-[var(--text-primary)]">
                        {category.name}
                      </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-[var(--text-primary)]">
                                    {formatCurrencyDetailed(category.value)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[var(--text-secondary)]">
                                    {category.count}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[var(--text-secondary)]">
                                    {formatCurrencyDetailed(category.value / category.count)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <div className="w-24 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${category.percentage}%`,
                                                    backgroundColor: category.color,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-[var(--text-primary)] w-12 text-right">
                        {category.percentage.toFixed(1)}%
                      </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                            <td className="px-6 py-4 text-sm font-bold text-[var(--text-primary)]">Total</td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">
                                {formatCurrencyDetailed(data?.total_spent || 0)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">
                                {data?.transaction_count || 0}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">
                                {formatCurrencyDetailed(avgTransaction)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">
                                100%
                            </td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            </ChartContainer>
        </div>
    );
};

export default SpendingReport;