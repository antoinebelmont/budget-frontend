import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchNetWorth } from '../../store/slices/reportsSlice';
import ChartContainer from './ChartContainer';
import StatCard from './StatCard';
import { ScaleIcon, BanknotesIcon, CreditCardIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
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
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { formatCurrency, formatCurrencyDetailed, getColorByIndex } from '../../utils/chartHelpers';

const NetWorthReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const { netWorth } = useAppSelector((state) => state.reports);

    useEffect(() => {
        dispatch(fetchNetWorth());
    }, [dispatch]);

    const data = netWorth.data;
    const isLoading = netWorth.loading;

    // Separate assets and liabilities
    const assets = data?.accounts.filter((acc) => acc.contribution >= 0) || [];
    const liabilities = data?.accounts.filter((acc) => acc.contribution < 0) || [];

    const totalAssets = assets.reduce((sum, acc) => sum + acc.contribution, 0);
    const totalLiabilities = Math.abs(liabilities.reduce((sum, acc) => sum + acc.contribution, 0));

    // Prepare chart data
    const accountsChartData = data?.accounts.map((acc, index) => ({
        name: acc.name,
        value: Math.abs(acc.contribution),
        type: acc.type,
        isLiability: acc.contribution < 0,
        color: getColorByIndex(index),
    })) || [];

    // Prepare data by type
    const accountsByType = data?.accounts.reduce((acc: any, account) => {
        const existing = acc.find((item: any) => item.type === account.type);
        if (existing) {
            existing.value += Math.abs(account.contribution);
        } else {
            acc.push({
                type: account.type,
                value: Math.abs(account.contribution),
                color: getColorByIndex(acc.length),
            });
        }
        return acc;
    }, []) || [];

    // Get account type icon
    const getAccountTypeIcon = (type: string) => {
        switch (type) {
            case 'checking':
                return '🏦';
            case 'savings':
                return '💰';
            case 'credit_card':
                return '💳';
            case 'investment':
                return '📈';
            default:
                return '💼';
        }
    };

    // Format account type label
    const formatAccountType = (type: string) => {
        return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className=" bg-[var(--bg-surface)] p-4 border border-[var(--border-default)] rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                        {data.name || formatAccountType(data.type)}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                        <span className="font-medium">Amount:</span> {formatCurrencyDetailed(data.value)}
                    </p>
                    {data.type && (
                        <p className="text-sm text-[var(--text-secondary)]">
                            <span className="font-medium">Type:</span> {formatAccountType(data.type)}
                        </p>
                    )}
                    {data.isLiability !== undefined && (
                        <p className="text-sm text-[var(--text-secondary)]">
                            <span className="font-medium">Category:</span>{' '}
                            {data.isLiability ? 'Liability' : 'Asset'}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Net Worth</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Snapshot as of {data?.as_of ? new Date(data.as_of).toLocaleDateString() : 'today'}
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Net Worth"
                    value={data?.net_worth || 0}
                    format="currency"
                    icon={<ScaleIcon className="h-6 w-6 text-primary-600" />}
                    description="Total assets minus liabilities"
                    loading={isLoading}
                />
                <StatCard
                    title="Total Assets"
                    value={totalAssets}
                    format="currency"
                    icon={<BanknotesIcon className="h-6 w-6 text-success-600" />}
                    description={`${assets.length} asset account${assets.length !== 1 ? 's' : ''}`}
                    loading={isLoading}
                />
                <StatCard
                    title="Total Liabilities"
                    value={totalLiabilities}
                    format="currency"
                    icon={<CreditCardIcon className="h-6 w-6 text-danger-600" />}
                    description={`${liabilities.length} liability account${liabilities.length !== 1 ? 's' : ''}`}
                    loading={isLoading}
                />
                <StatCard
                    title="Total Accounts"
                    value={data?.accounts.length || 0}
                    format="number"
                    icon={<ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600" />}
                    description="Active accounts"
                    loading={isLoading}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Accounts Breakdown - Pie Chart */}
                <ChartContainer
                    title="Accounts Breakdown"
                    subtitle="Distribution by account"
                    loading={isLoading}
                    error={netWorth.error}
                >
                    {accountsChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={accountsChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${(((entry.value as number) / (data?.net_worth || 1)) * 100).toFixed(0)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {accountsChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value, entry: any) => (
                                        <span className="text-sm">
                      {entry.payload.name}{' '}
                                            <span className={entry.payload.isLiability ? 'text-danger-600' : 'text-success-600'}>
                        {formatCurrency(entry.payload.value)}
                      </span>
                    </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[350px] flex items-center justify-center text-gray-400">
                            No accounts found
                        </div>
                    )}
                </ChartContainer>

                {/* By Account Type - Bar Chart */}
                <ChartContainer
                    title="By Account Type"
                    subtitle="Grouped by type"
                    loading={isLoading}
                    error={netWorth.error}
                >
                    {accountsByType.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={accountsByType}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="type"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={formatAccountType}
                                />
                                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Amount" radius={[8, 8, 0, 0]}>
                                    {accountsByType.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[350px] flex items-center justify-center text-gray-400">
                            No account types available
                        </div>
                    )}
                </ChartContainer>
            </div>

            {/* Assets & Liabilities Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets */}
                <ChartContainer title="Assets" subtitle={`${assets.length} accounts`}>
                    <div className="space-y-3">
                        {assets.length > 0 ? (
                            assets.map((account, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{getAccountTypeIcon(account.type)}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">{account.name}</p>
                                            <p className="text-xs text-[var(--text-muted)]">{formatAccountType(account.type)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-success-600">
                                            {formatCurrency(account.contribution)}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {((account.contribution / totalAssets) * 100).toFixed(1)}% of assets
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">No assets found</div>
                        )}
                        {assets.length > 0 && (
                            <div className="flex justify-between items-center p-4 bg-success-100 rounded-lg font-bold">
                                 <span className="text-[var(--text-primary)]">Total Assets</span>
                                <span className="text-success-600">{formatCurrency(totalAssets)}</span>
                            </div>
                        )}
                    </div>
                </ChartContainer>

                {/* Liabilities */}
                <ChartContainer title="Liabilities" subtitle={`${liabilities.length} accounts`}>
                    <div className="space-y-3">
                        {liabilities.length > 0 ? (
                            liabilities.map((account, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-danger-50 rounded-lg hover:bg-danger-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{getAccountTypeIcon(account.type)}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">{account.name}</p>
                                            <p className="text-xs text-[var(--text-muted)]">{formatAccountType(account.type)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-danger-600">
                                            {formatCurrency(Math.abs(account.contribution))}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {((Math.abs(account.contribution) / totalLiabilities) * 100).toFixed(1)}% of
                                            liabilities
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">No liabilities found</div>
                        )}
                        {liabilities.length > 0 && (
                            <div className="flex justify-between items-center p-4 bg-danger-100 rounded-lg font-bold">
                                 <span className="text-[var(--text-primary)]">Total Liabilities</span>
                                <span className="text-danger-600">{formatCurrency(totalLiabilities)}</span>
                            </div>
                        )}
                    </div>
                </ChartContainer>
            </div>

            {/* Net Worth Summary Card */}
            <div className="card p-8 bg-gradient-to-br from-primary-50 to-indigo-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-2">Your Net Worth</h3>
                        <p className="text-4xl font-bold text-[var(--text-primary)] mb-2">
                            {formatCurrency(data?.net_worth || 0)}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {totalAssets > 0 && (
                                <span>
                  Debt-to-Asset Ratio:{' '}
                                    <span className="font-semibold">
                    {((totalLiabilities / totalAssets) * 100).toFixed(1)}%
                  </span>
                </span>
                            )}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className=" bg-[var(--bg-surface)] rounded-lg p-6 shadow-sm">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] mb-1">Assets</p>
                                    <p className="text-xl font-bold text-success-600">{formatCurrency(totalAssets)}</p>
                                </div>
                                <div className="border-t border-[var(--border-default)] pt-3">
                                    <p className="text-xs text-[var(--text-secondary)] mb-1">Liabilities</p>
                                    <p className="text-xl font-bold text-danger-600">
                                        {formatCurrency(totalLiabilities)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetWorthReport;