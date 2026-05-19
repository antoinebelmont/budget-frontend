export const CHART_COLORS = {
    primary: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    teal: '#14b8a6',
    gray: '#6b7280',
};

export const CATEGORY_COLORS = [
    '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6',
    '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
    '#84cc16', '#06b6d4', '#8b5cf6', '#f43f5e', '#737373',
];

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatCurrencyDetailed = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `$${(num / 1000).toFixed(1)}K`;
    }
    return formatCurrency(num);
};

export const getColorByIndex = (index: number): string => {
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};

export const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};
