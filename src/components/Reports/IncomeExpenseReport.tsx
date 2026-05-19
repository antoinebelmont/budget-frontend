import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchIncomeVsExpense } from '../../store/slices/reportsSlice';
import ChartContainer from './ChartContainer';
import StatCard from './StatCard';
import {
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BanknotesIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import {
    formatCurrency,
    formatCurrencyDetailed,
    calculatePercentageChange,
    CHART_COLORS,
} from '../../utils/chartHelpers';
import { format } from 'date-fns';

type ChartType = 'line' | 'area' | 'bar';
type TimeRange = 6 | 12 | 24;

const IncomeExpenseReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const { incomeVsExpense } = useAppSelector((state) => state.reports);
    const [chartType, setChartType] = useState<ChartType>('line');
    const [timeRange, setTimeRange] = useState<TimeRange>(12);

    useEffect(() => {
        dispatch(fetchIncomeVsExpense(timeRange));
    }, [dispatch, timeRange]);

    const data = incomeVsExpense.data;
    const isLoading = incomeVsExpense.loading;

    // Prepare chart data
    const chartData = data?.monthly_data.map((item) => ({
        month: format(new Date(item.month + '-01'), 'MMM yyyy'),
        income: item.income,
        expenses: Math.abs(item.expenses),
        net: item.net,
    })) || [];

    // Calculate month-over-month changes
    const latestMonth = chartData[chartData.length - 1];
    const previousMonth = chartData[chartData.length - 2];

    const incomeChange = previousMonth
        ? calculatePercentageChange(latestMonth?.income || 0, previousMonth.income)
        : 0;
    const expenseChange = previousMonth
        ? calculatePercentageChange(latestMonth?.expenses || 0, previousMonth.expenses)
        : 0;

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
            const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
            const net = income - expenses;

            return (
                <div className=" bg-[var(--bg-surface)] p-4 border border-[var(--border-default)] rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">{label}</p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center space-x-4">
                            <span className="text-sm text-success-600 font-medium">Income:</span>
                            <span className="text-sm font-semibold">{formatCurrencyDetailed(income)}</span>
                        </div>
                        <div className="flex justify-between items-center space-x-4">
                            <span className="text-sm text-danger-600 font-medium">Expenses:</span>
                            <span className="text-sm font-semibold">{formatCurrencyDetailed(expenses)}</span>
                        </div>
                        <div className="pt-2 border-t border-[var(--border-default)]">
                            <div className="flex justify-between items-center space-x-4">
                                <span className="text-sm font-medium">Net:</span>
                                <span className={`text-sm font-bold ${net >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {formatCurrencyDetailed(net)}
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 10, right: 30, left: 0, bottom: 0 },
        };

        const commonAxisProps = {
            xAxis: (
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                />
            ),
            yAxis: (
                <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    tickFormatter={(value) => formatCurrency(value)}
                />
            ),
            grid: <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />,
            tooltip: <Tooltip content={<CustomTooltip />} />,
            legend: (
                <Legend
                    wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                    iconType="line"
                />
            ),
        };

        switch (chartType) {
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart {...commonProps}>
                            {commonAxisProps.grid}
                            {commonAxisProps.xAxis}
                            {commonAxisProps.yAxis}
                            {commonAxisProps.tooltip}
                            {commonAxisProps.legend}
                            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke={CHART_COLORS.success}
                                fill={CHART_COLORS.success}
                                fillOpacity={0.2}
                                strokeWidth={2}
                                name="Income"
                            />
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                stroke={CHART_COLORS.danger}
                                fill={CHART_COLORS.danger}
                                fillOpacity={0.2}
                                strokeWidth={2}
                                name="Expenses"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart {...commonProps}>
                            {commonAxisProps.grid}
                            {commonAxisProps.xAxis}
                            {commonAxisProps.yAxis}
                            {commonAxisProps.tooltip}
                            {commonAxisProps.legend}
                            <Bar dataKey="income" fill={CHART_COLORS.success} name="Income" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="expenses" fill={CHART_COLORS.danger} name="Expenses" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );

            default: // line
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart {...commonProps}>
                            {commonAxisProps.grid}
                            {commonAxisProps.xAxis}
                            {commonAxisProps.yAxis}
                            {commonAxisProps.tooltip}
                            {commonAxisProps.legend}
                            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke={CHART_COLORS.success}
                                strokeWidth={3}
                                name="Income"
                                dot={{ fill: CHART_COLORS.success, r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                stroke={CHART_COLORS.danger}
                                strokeWidth={3}
                                name="Expenses"
                                dot={{ fill: CHART_COLORS.danger, r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="net"
                                stroke={CHART_COLORS.primary}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Net"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Income & Expense Trends</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Track your financial flow over time</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {([6, 12, 24] as TimeRange[]).map((months) => (
                            <button
                                key={months}
                                onClick={() => setTimeRange(months)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    timeRange === months
                                        ? ' bg-[var(--bg-surface)] text-[var(--text-primary)] shadow'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                {months} Months
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Income"
                    value={data?.summary.total_income || 0}
                    format="currency"
                    icon={<ArrowTrendingUpIcon className="h-6 w-6 text-success-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Total Expenses"
                    value={Math.abs(data?.summary.total_expenses || 0)}
                    format="currency"
                    icon={<ArrowTrendingDownIcon className="h-6 w-6 text-danger-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Net Income"
                    value={data?.summary.net_income || 0}
                    format="currency"
                    icon={<BanknotesIcon className="h-6 w-6 text-primary-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Avg Monthly Income"
                    value={data?.summary.average_monthly_income || 0}
                    format="currency"
                    icon={<ChartBarIcon className="h-6 w-6 text-indigo-600" />}
                    loading={isLoading}
                />
            </div>

            {/* Main Chart */}
            <ChartContainer
                title="Income vs Expense Comparison"
                subtitle={`Last ${timeRange} months`}
                loading={isLoading}
                error={incomeVsExpense.error}
                actions={
                    <div className="flex space-x-2">
                        {(['line', 'area', 'bar'] as ChartType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setChartType(type)}
                                className={`px-3 py-1 text-xs font-medium rounded capitalize ${
                                    chartType === type
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-[var(--text-secondary)] dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                }
            >
                {chartData.length > 0 ? (
                    renderChart()
                ) : (
                    <div className="h-[400px] flex items-center justify-center text-gray-400">
                        No data available
                    </div>
                )}
            </ChartContainer>

            {/* Month-over-Month Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                        Month-over-Month Change
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-[var(--text-secondary)]">Income Change</p>
                                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                    {incomeChange >= 0 ? '+' : ''}
                                    {incomeChange.toFixed(1)}%
                                </p>
                            </div>
                            <ArrowTrendingUpIcon
                                className={`h-8 w-8 ${
                                    incomeChange >= 0 ? 'text-success-600' : 'text-danger-600'
                                }`}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-danger-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-[var(--text-secondary)]">Expense Change</p>
                                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                    {expenseChange >= 0 ? '+' : ''}
                                    {expenseChange.toFixed(1)}%
                                </p>
                            </div>
                            <ArrowTrendingDownIcon
                                className={`h-8 w-8 ${
                                    expenseChange >= 0 ? 'text-danger-600' : 'text-success-600'
                                }`}
                            />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Average Monthly</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-sm font-medium text-[var(--text-secondary)]">Income</span>
                            <span className="text-lg font-bold text-success-600">
                {formatCurrency(data?.summary.average_monthly_income || 0)}
              </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-sm font-medium text-[var(--text-secondary)]">Expenses</span>
                            <span className="text-lg font-bold text-danger-600">
                {formatCurrency(Math.abs(data?.summary.average_monthly_expenses || 0))}
              </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                            <span className="text-sm font-medium text-[var(--text-secondary)]">Net</span>
                            <span className="text-lg font-bold text-primary-600">
                {formatCurrency(
                    (data?.summary.average_monthly_income || 0) +
                    (data?.summary.average_monthly_expenses || 0)
                )}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Monthly Table */}
            <ChartContainer title="Monthly Breakdown" subtitle="Detailed view of each month">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-default)]">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                Month
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                Income
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                Expenses
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                Net
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                Savings Rate
                            </th>
                        </tr>
                        </thead>
                        <tbody className=" bg-[var(--bg-surface)] divide-y divide-[var(--border-default)]">
                        {chartData.map((month, index) => {
                            const savingsRate = month.income > 0 ? (month.net / month.income) * 100 : 0;
                            return (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                                        {month.month}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-success-600 font-semibold">
                                        {formatCurrencyDetailed(month.income)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-danger-600 font-semibold">
                                        {formatCurrencyDetailed(month.expenses)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                      <span className={month.net >= 0 ? 'text-success-600' : 'text-danger-600'}>
                        {formatCurrencyDetailed(month.net)}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <div className="w-20 bg-gray-200 dark:bg-slate-600">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        savingsRate >= 0 ? 'bg-success-500' : 'bg-danger-500'
                                                    }`}
                                                    style={{ width: `${Math.min(100, Math.abs(savingsRate))}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-[var(--text-primary)] w-16 text-right">
                          {savingsRate.toFixed(1)}%
                        </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </ChartContainer>
        </div>
    );
};

export default IncomeExpenseReport;