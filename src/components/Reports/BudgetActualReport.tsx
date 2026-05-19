import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchBudgetVsActual } from '../../store/slices/reportsSlice';
import ChartContainer from './ChartContainer';
import StatCard from './StatCard';
import {
    ChartBarIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from 'recharts';
import { formatCurrency, formatCurrencyDetailed, CHART_COLORS } from '../../utils/chartHelpers';
import { format, subMonths, addMonths } from 'date-fns';
import clsx from 'clsx';

const BudgetActualReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const { budgetVsActual } = useAppSelector((state) => state.reports);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [groupBy, setGroupBy] = useState<'all' | 'group'>('group');

    useEffect(() => {
        dispatch(fetchBudgetVsActual(selectedMonth));
    }, [dispatch, selectedMonth]);

    const data = budgetVsActual.data;
    const isLoading = budgetVsActual.loading;

    // Month navigation
    const handlePreviousMonth = () => {
        const newMonth = format(subMonths(new Date(selectedMonth + '-01'), 1), 'yyyy-MM');
        setSelectedMonth(newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = format(addMonths(new Date(selectedMonth + '-01'), 1), 'yyyy-MM');
        setSelectedMonth(newMonth);
    };

    const handleCurrentMonth = () => {
        setSelectedMonth(format(new Date(), 'yyyy-MM'));
    };

    // Group categories by category group
    const groupedCategories = data?.categories.reduce((acc: any, category) => {
        const groupName = category.category_group;
        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        acc[groupName].push(category);
        return acc;
    }, {}) || {};

    // Prepare chart data
    const chartData = data?.categories
        .filter((cat) => cat.budgeted > 0 || cat.actual > 0)
        .map((cat) => ({
            name: cat.name,
            budgeted: cat.budgeted,
            actual: cat.actual,
            difference: cat.difference,
            percentage: cat.percentage,
            isOverBudget: cat.difference < 0,
        })) || [];

    // Calculate summary stats
    const totalBudgeted = data?.summary.total_budgeted || 0;
    const totalActual = data?.summary.total_actual || 0;
    const totalDifference = data?.summary.total_difference || 0;
    const overBudgetCount = data?.summary.over_budget_count || 0;
    const underBudgetCount = data?.summary.under_budget_count || 0;

    const budgetUtilization = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const budgeted = payload.find((p: any) => p.dataKey === 'budgeted')?.value || 0;
            const actual = payload.find((p: any) => p.dataKey === 'actual')?.value || 0;
            const difference = budgeted - actual;
            const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0;

            return (
                <div className=" bg-[var(--bg-surface)] p-4 border border-[var(--border-default)] rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">{label}</p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center space-x-4">
                            <span className="text-sm text-primary-600 font-medium">Budgeted:</span>
                            <span className="text-sm font-semibold">{formatCurrencyDetailed(budgeted)}</span>
                        </div>
                        <div className="flex justify-between items-center space-x-4">
                            <span className="text-sm text-[var(--text-secondary)] font-medium">Actual:</span>
                            <span className="text-sm font-semibold">{formatCurrencyDetailed(actual)}</span>
                        </div>
                        <div className="pt-2 border-t border-[var(--border-default)]">
                            <div className="flex justify-between items-center space-x-4">
                                <span className="text-sm font-medium">Difference:</span>
                                <span className={`text-sm font-bold ${difference >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {difference >= 0 ? '+' : ''}{formatCurrencyDetailed(difference)}
                </span>
                            </div>
                            <div className="flex justify-between items-center space-x-4 mt-1">
                                <span className="text-sm font-medium">Used:</span>
                                <span className="text-sm font-bold">{percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Month Selector */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Budget vs Actual</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Compare your planned budget to actual spending</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePreviousMonth}
                        className="btn-secondary px-3 py-2"
                    >
                        ← Previous
                    </button>
                    <div className="px-4 py-2 bg-primary-100 text-primary-700 font-semibold rounded-lg">
                        {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                    </div>
                    <button
                        onClick={handleNextMonth}
                        className="btn-secondary px-3 py-2"
                    >
                        Next →
                    </button>
                    <button
                        onClick={handleCurrentMonth}
                        className="btn-secondary px-3 py-2"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Budgeted"
                    value={totalBudgeted}
                    format="currency"
                    icon={<ChartBarIcon className="h-6 w-6 text-primary-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Total Spent"
                    value={totalActual}
                    format="currency"
                    icon={<ArrowPathIcon className="h-6 w-6 text-indigo-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Over Budget"
                    value={overBudgetCount}
                    format="number"
                    icon={<ExclamationCircleIcon className="h-6 w-6 text-danger-600" />}
                    description={`${overBudgetCount} categories over`}
                    loading={isLoading}
                />
                <StatCard
                    title="Under Budget"
                    value={underBudgetCount}
                    format="number"
                    icon={<CheckCircleIcon className="h-6 w-6 text-success-600" />}
                    description={`${underBudgetCount} categories under`}
                    loading={isLoading}
                />
            </div>

            {/* Budget Utilization Card */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Budget Utilization</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-[var(--text-secondary)]">Overall Usage</span>
                            <span className="text-lg font-bold text-[var(--text-primary)]">{budgetUtilization.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-4">
                            <div
                                className={clsx(
                                    'h-4 rounded-full transition-all',
                                    budgetUtilization > 100 ? 'bg-danger-500' :
                                        budgetUtilization > 80 ? 'bg-warning-500' :
                                            'bg-success-500'
                                )}
                                style={{ width: `${Math.min(100, budgetUtilization)}%` }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border-default)]">
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Remaining</p>
                            <p className={clsx(
                                'text-xl font-bold',
                                totalDifference >= 0 ? 'text-success-600' : 'text-danger-600'
                            )}>
                                {formatCurrency(Math.abs(totalDifference))}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] mb-1">% of Budget</p>
                            <p className="text-xl font-bold text-[var(--text-primary)]">
                                {totalBudgeted > 0 ? ((totalActual / totalBudgeted) * 100).toFixed(0) : 0}%
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Status</p>
                            <p className={clsx(
                                'text-xl font-bold',
                                totalDifference >= 0 ? 'text-success-600' : 'text-danger-600'
                            )}>
                                {totalDifference >= 0 ? 'On Track' : 'Over Budget'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <ChartContainer
                title="Budget vs Actual Comparison"
                subtitle="Budgeted amount vs actual spending"
                loading={isLoading}
                error={budgetVsActual.error}
                actions={
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setGroupBy('all')}
                            className={`px-3 py-1 text-xs font-medium rounded ${
                                groupBy === 'all'
                                    ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-[var(--text-secondary)] dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setGroupBy('group')}
                            className={`px-3 py-1 text-xs font-medium rounded ${
                                groupBy === 'group'
                                    ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-[var(--text-secondary)] dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            By Group
                        </button>
                    </div>
                }
            >
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData.slice(0, 15)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11 }}
                                angle={-45}
                                textAnchor="end"
                                height={120}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                            <ReferenceLine y={0} stroke="#666" />
                            <Bar dataKey="budgeted" name="Budgeted" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
                            <Bar dataKey="actual" name="Actual" radius={[8, 8, 0, 0]}>
                                {chartData.slice(0, 15).map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.isOverBudget ? CHART_COLORS.danger : CHART_COLORS.success}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[400px] flex items-center justify-center text-gray-400">
                        No budget data for this month
                    </div>
                )}
            </ChartContainer>

            {/* Detailed Breakdown by Category Group */}
            {groupBy === 'group' ? (
                <div className="space-y-6">
                    {Object.entries(groupedCategories).map(([groupName, categories]: [string, any]) => (
                        <ChartContainer key={groupName} title={groupName} subtitle={`${categories.length} categories`}>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[var(--border-default)]">
                                    <thead className=" bg-gray-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                            Budgeted
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                            Actual
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                            Difference
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                            % Used
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-[var(--text-muted)] uppercase">
                                            Status
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className=" bg-[var(--bg-surface)] divide-y divide-[var(--border-default)]">
                                    {categories.map((category: any) => {
                                        const isOverBudget = category.difference < 0;
                                        const isUnderBudget = category.difference > 0 && category.actual > 0;
                                        const isUnused = category.actual === 0;

                                        return (
                                            <tr key={category.id} className="hover: bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                                                    {category.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[var(--text-primary)]">
                                                    {formatCurrencyDetailed(category.budgeted)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-[var(--text-primary)]">
                                                    {formatCurrencyDetailed(category.actual)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <span className={clsx(
                                'font-semibold',
                                isOverBudget ? 'text-danger-600' : 'text-success-600'
                            )}>
                              {category.difference >= 0 ? '+' : ''}
                                {formatCurrencyDetailed(category.difference)}
                            </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <div className="w-20 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                                            <div
                                                                className={clsx(
                                                                    'h-2 rounded-full',
                                                                    isOverBudget ? 'bg-danger-500' :
                                                                        category.percentage > 80 ? 'bg-warning-500' :
                                                                            'bg-success-500'
                                                                )}
                                                                style={{ width: `${Math.min(100, category.percentage)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium text-[var(--text-primary)] w-12 text-right">
                                {category.percentage.toFixed(0)}%
                              </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {isOverBudget ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
                                Over Budget
                              </span>
                                                    ) : isUnused ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
                                Unused
                              </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                                On Track
                              </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </ChartContainer>
                    ))}
                </div>
            ) : (
                // All categories in one table
                <ChartContainer title="All Categories" subtitle="Complete breakdown">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[var(--border-default)]">
                            <thead className=" bg-gray-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                    Group
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                    Budgeted
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                    Actual
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                    Difference
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                    % Used
                                </th>
                            </tr>
                            </thead>
                            <tbody className=" bg-[var(--bg-surface)] divide-y divide-[var(--border-default)]">
                            {data?.categories.map((category) => (
                                <tr key={category.id} className="hover: bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                                        {category.category_group}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[var(--text-primary)]">
                                        {formatCurrencyDetailed(category.budgeted)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-[var(--text-primary)]">
                                        {formatCurrencyDetailed(category.actual)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <span className={clsx(
                          'font-semibold',
                          category.difference < 0 ? 'text-danger-600' : 'text-success-600'
                      )}>
                        {category.difference >= 0 ? '+' : ''}
                          {formatCurrencyDetailed(category.difference)}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-[var(--text-primary)]">
                                        {category.percentage.toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </ChartContainer>
            )}
        </div>
    );
};

export default BudgetActualReport;