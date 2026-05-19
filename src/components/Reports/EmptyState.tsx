import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
    title?: string;
    message?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const EmptyState: React.FC<EmptyStateProps> = ({
                                                   title = 'No data available',
                                                   message = 'There is no data to display for the selected period.',
                                                   action,
                                               }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <ChartBarIcon className="h-16 w-16 text-[var(--text-muted)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{title}</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">{message}</p>
            {action && (
                <button onClick={action.onClick} className="btn-primary">
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;