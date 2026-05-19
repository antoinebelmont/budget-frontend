import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setCurrentTab, fetchSavedReports } from '../../store/slices/reportsSlice';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { fetchBudget } from '../../store/slices/budgetSlice';
import {
    ChartBarIcon,
    BanknotesIcon,
    ScaleIcon,
    ArrowTrendingUpIcon,
    ArrowPathIcon,
    CurrencyDollarIcon,
    BookmarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface ReportsLayoutProps {
    children: React.ReactNode;
}

interface TabItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const tabs: TabItem[] = [
    {
        id: 'overview',
        label: 'Overview',
        icon: ChartBarIcon,
        description: 'Quick snapshot of your finances',
    },
    {
        id: 'spending',
        label: 'Spending',
        icon: BanknotesIcon,
        description: 'Analyze where your money goes',
    },
    {
        id: 'income-expense',
        label: 'Income & Expense',
        icon: ArrowTrendingUpIcon,
        description: 'Track income vs expenses over time',
    },
    {
        id: 'net-worth',
        label: 'Net Worth',
        icon: ScaleIcon,
        description: 'View your total net worth',
    },
    {
        id: 'budget-actual',
        label: 'Budget vs Actual',
        icon: ArrowPathIcon,
        description: 'Compare budget to actual spending',
    },
    {
        id: 'cash-flow',
        label: 'Cash Flow',
        icon: CurrencyDollarIcon,
        description: 'Analyze money in and out',
    },
    {
        id: 'saved',
        label: 'Saved Reports',
        icon: BookmarkIcon,
        description: 'Your favorite reports',
    },
];

const ReportsLayout: React.FC<ReportsLayoutProps> = ({ children }) => {
    const dispatch = useAppDispatch();
    const currentTab = useAppSelector((state) => state.reports.currentTab);
    const savedReports = useAppSelector((state) => state.reports.savedReports);

    useEffect(() => {
        // Load necessary data for reports
        dispatch(fetchAccounts());
        dispatch(fetchCategories());
        dispatch(fetchBudget());
        dispatch(fetchSavedReports());
    }, [dispatch]);

    const handleTabChange = (tabId: string) => {
        dispatch(setCurrentTab(tabId));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Reports</h1>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Analyze your spending, income, and financial trends
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <nav className="flex space-x-1 p-2" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = currentTab === tab.id;
                            const showBadge = tab.id === 'saved' && savedReports.length > 0;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={clsx(
                                        'relative group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap',
                                        isActive
                                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-slate-700/50'
                                    )}
                                >
                                    <Icon
                                        className={clsx(
                                            'h-5 w-5 mr-2',
                                            isActive ? 'text-primary-600' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                                        )}
                                    />
                                    <span>{tab.label}</span>
                                    {showBadge && (
                                        <span className="ml-2 bg-primary-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {savedReports.length}
                    </span>
                                    )}

                                    {/* Tooltip on hover */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-gray-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 whitespace-normal max-w-xs pointer-events-none">
                                        {tab.description}
                                        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-gray-900 dark:bg-slate-700 transform rotate-45"></div>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">{children}</div>
        </div>
    );
};

export default ReportsLayout;