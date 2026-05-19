import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { formatCurrency, formatPercentage } from '../../utils/chartHelpers';
import clsx from 'clsx';

interface StatCardProps {
    title: string;
    value: number;
    previousValue?: number;
    format?: 'currency' | 'number' | 'percentage';
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
    loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
                                               title,
                                               value,
                                               previousValue,
                                               format = 'currency',
                                               icon,
                                               trend,
                                               description,
                                               loading = false,
                                           }) => {
    const formatValue = (val: number) => {
        switch (format) {
            case 'currency':
                return formatCurrency(val);
            case 'percentage':
                return `${val.toFixed(1)}%`;
            default:
                return val.toLocaleString();
        }
    };

    const calculateChange = () => {
        if (previousValue === undefined || previousValue === 0) return null;
        const change = ((value - previousValue) / previousValue) * 100;
        return change;
    };

    const change = calculateChange();
    const isPositive = change !== null && change > 0;
    const isNegative = change !== null && change < 0;

    if (loading) {
        return (
            <div className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 dark:bg-slate-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-1/3"></div>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">{title}</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mb-2">{formatValue(value)}</p>

                    {change !== null && (
                        <div className="flex items-center space-x-2">
              <span
                  className={clsx(
                      'inline-flex items-center text-sm font-medium',
                      isPositive && 'text-success-600',
                      isNegative && 'text-danger-600',
                      !isPositive && !isNegative && 'text-[var(--text-secondary)]'
                  )}
              >
                {isPositive && <ArrowUpIcon className="h-4 w-4 mr-1" />}
                  {isNegative && <ArrowDownIcon className="h-4 w-4 mr-1" />}
                  {formatPercentage(change)}
              </span>
                            <span className="text-xs text-[var(--text-muted)]">vs previous period</span>
                        </div>
                    )}

                    {description && !change && (
                        <p className="text-sm text-[var(--text-muted)]">{description}</p>
                    )}
                </div>

                {icon && (
                    <div className="ml-4 p-3 bg-primary-100 rounded-lg">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;