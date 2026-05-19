import React from 'react';
import clsx from 'clsx';

interface ChartContainerProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    loading?: boolean;
    error?: string | null;
    className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
           title,
           subtitle,
           children,
           actions,
           loading = false,
           error = null,
           className,
       }) => {
    if (loading) {
        return (
            <div className={clsx('card p-6', className)}>
                <div className="h-6 bg-gray-200 dark:bg-slate-600 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={clsx('card p-6', className)}>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h3>
                <div className="flex items-center justify-center h-64 text-danger-600">
                    <div className="text-center">
                        <p className="text-sm font-medium">Failed to load chart</p>
                        <p className="text-xs text-gray-500 mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx('card p-6', className)}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
                    {subtitle && <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex space-x-2">{actions}</div>}
            </div>
            <div>{children}</div>
        </div>
    );
};

export default ChartContainer;