
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCashFlow } from '../../store/slices/reportsSlice';
import ChartContainer from './ChartContainer';
import StatCard from './StatCard';
import { BanknotesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { formatCurrency, formatCurrencyDetailed, CHART_COLORS } from '../../utils/chartHelpers';
import { format } from 'date-fns';

type TimeRange = 6 | 12 | 24;

const CashFlowReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const { cashFlow } = useAppSelector((state) => state.reports);
    const [timeRange, setTimeRange] = useState<TimeRange>(12);

    useEffect(() => {
        dispatch(fetchCashFlow(timeRange));
    }, [dispatch, timeRange]);

    const data = cashFlow.data;
    const isLoading = cashFlow.loading;

    // Prepare chart data
    const chartData = data?.months.map((item) => ({
        month: format(new Date(item.month + '-01'), 'MMM yyyy'),
        starting: item.starting_balance,
        income: item.income,
        expenses: Math.abs(item.expenses),
        ending: item.ending_balance,
        net: item.net_change,
    })) || [];

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const monthData = payload[0].payload;
            return (
                <div className="bg-[var(--bg-surface)] p-4 border border-[var(--border-default)] rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">{label}</p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center space-x-6">
                            <span className="text-sm text-[var(--text-secondary)]">Starting Balance:</span>
                            <span className="text-sm font-semibold">{formatCurrencyDetailed(monthData.starting)}</span>
                        </div>
                        <div className="flex justify-between items-center space-x-6">
                            <span className="text-sm text-success-600 font-medium">+ Income:</span>
                            <span className="text-sm font-semibold text-success-600">{formatCurrencyDetailed(monthData.income)}</span>
                        </div>
                        <div className="flex justify-between items-center space-x-6">
                            <span className="text-sm text-danger-600 font-medium">- Expenses:</span>
                            <span className="text-sm font-semibold text-danger-600">{formatCurrencyDetailed(monthData.expenses)}</span>
                        </div>
                        <div className="pt-2 border-t border-[var(--border-default)]">
                            <div className="flex justify-between items-center space-x-6">
                                <span className="text-sm font-medium">Ending Balance:</span>
                                <span className="text-sm font-bold">{formatCurrencyDetailed(monthData.ending)}</span>
                            </div>
                            <div className="flex justify-between items-center space-x-6 mt-1">
                                <span className="text-sm font-medium">Net Change:</span>
                                <span className={`text-sm font-bold ${monthData.net >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {monthData.net >= 0 ? '+' : ''}{formatCurrencyDetailed(monthData.net)}
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const getTrendLabel = (trend: string) => {
        switch (trend) {
            case 'positive': return '📈 Growing';
            case 'negative': return '📉 Declining';
            default: return '➡️ Stable';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Cash Flow Analysis</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Track money in, money out, and your balance over time</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                    {([6, 12, 24] as TimeRange[]).map((months) => (
                        <button
                            key={months}
                            onClick={() => setTimeRange(months)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                timeRange === months
                                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                            {months} Months
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Avg Monthly Income"
                    value={data?.summary.average_income || 0}
                    format="currency"
                    icon={<ArrowTrendingUpIcon className="h-6 w-6 text-success-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Avg Monthly Expenses"
                    value={Math.abs(data?.summary.average_expenses || 0)}
                    format="currency"
                    icon={<ArrowTrendingDownIcon className="h-6 w-6 text-danger-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Avg Net Change"
                    value={data?.summary.average_net_change || 0}
                    format="currency"
                    icon={<ChartBarIcon className="h-6 w-6 text-primary-600" />}
                    loading={isLoading}
                />
                <StatCard
                    title="Trend"
                    value={0}
                    format="number"
                    icon={<BanknotesIcon className="h-6 w-6 text-indigo-600" />}
                    description={data?.summary.trend ? getTrendLabel(data.summary.trend) : 'Calculating...'}
                    loading={isLoading}
                />
            </div>

            {/* Cash Flow Chart */}
            <ChartContainer
                title="Cash Flow Over Time"
                subtitle="Balance trajectory with income and expenses"
                loading={isLoading}
                error={cashFlow.error}
            >
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
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
                            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
                            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke={CHART_COLORS.success}
                                fill={CHART_COLORS.success}
                                fillOpacity={0.1}
                                strokeWidth={2}
                                name="Income"
                            />
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                stroke={CHART_COLORS.danger}
                                fill={CHART_COLORS.danger}
                                fillOpacity={0.1}
                                strokeWidth={2}
                                name="Expenses"
                            />
                            <Line
                                type="monotone"
                                dataKey="ending"
                                stroke={CHART_COLORS.primary}
                                strokeWidth={3}
                                name="Ending Balance"
                                dot={{ fill: CHART_COLORS.primary, r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[400px] flex items-center justify-center text-[var(--text-muted)]">
                        No cash flow data available
                    </div>
                )}
            </ChartContainer>

            {/* Monthly Breakdown Table */}
            <ChartContainer title="Monthly Cash Flow Details">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-default)]">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Month</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Starting</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Income</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Expenses</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Net Change</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Ending</th>
                        </tr>
                        </thead>
                        <tbody className="bg-[var(--bg-surface)] divide-y divide-[var(--border-default)]">
                        {chartData.map((month, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{month.month}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[var(--text-secondary)]">
                                    {formatCurrencyDetailed(month.starting)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-success-600 font-semibold">
                                    +{formatCurrencyDetailed(month.income)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-danger-600 font-semibold">
                                    -{formatCurrencyDetailed(month.expenses)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                    <span className={month.net >= 0 ? 'text-success-600' : 'text-danger-600'}>
                      {month.net >= 0 ? '+' : ''}{formatCurrencyDetailed(month.net)}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-[var(--text-primary)]">
                                    {formatCurrencyDetailed(month.ending)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </ChartContainer>
        </div>
    );
};

export default CashFlowReport;