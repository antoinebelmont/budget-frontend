
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchSavedReports, deleteSavedReport, setCurrentTab, setFilters } from '../../store/slices/reportsSlice';
import { BookmarkIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatDateForUser } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SavedReports: React.FC = () => {
    const dispatch = useAppDispatch();
    const savedReports = useAppSelector((state) => state.reports.savedReports);
    const userDateFormat = useAppSelector((state) => state.auth.preferences?.date_format ?? 'Y-m-d');

    useEffect(() => {
        dispatch(fetchSavedReports());
    }, [dispatch]);

    const handleDeleteReport = async (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await dispatch(deleteSavedReport(id)).unwrap();
                toast.success('Saved report deleted');
            } catch (error) {
                toast.error('Failed to delete report');
            }
        }
    };

    const handleLoadReport = (report: any) => {
        // Apply the saved filters
        dispatch(setFilters(report.filters));

        // Navigate to the appropriate tab
        const tabMap: any = {
            spending: 'spending',
            income_vs_expense: 'income-expense',
            net_worth: 'net-worth',
            budget_vs_actual: 'budget-actual',
            category_trend: 'spending',
            cash_flow: 'cash-flow',
        };

        dispatch(setCurrentTab(tabMap[report.type] || 'overview'));
        toast.success(`Loaded "${report.name}"`);
    };

    const getReportTypeLabel = (type: string) => {
        const labels: any = {
            spending: 'Spending Analysis',
            income_vs_expense: 'Income vs Expense',
            net_worth: 'Net Worth',
            budget_vs_actual: 'Budget vs Actual',
            category_trend: 'Category Trend',
            cash_flow: 'Cash Flow',
        };
        return labels[type] || type;
    };

    const getReportTypeIcon = (type: string) => {
        const icons: any = {
            spending: '💰',
            income_vs_expense: '📊',
            net_worth: '⚖️',
            budget_vs_actual: '🔄',
            category_trend: '📈',
            cash_flow: '💵',
        };
        return icons[type] || '📋';
    };

    if (savedReports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <BookmarkIcon className="h-24 w-24 text-[var(--text-muted)] mb-4" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Saved Reports</h3>
                <p className="text-[var(--text-secondary)] text-center max-w-md mb-6">
                    Save your favorite report configurations for quick access. Go to any report, apply your filters, and save it for later.
                </p>
                <button
                    onClick={() => dispatch(setCurrentTab('overview'))}
                    className="btn-primary"
                >
                    Explore Reports
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Saved Reports</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Quick access to your favorite report configurations
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedReports.map((report) => (
                    <div
                        key={report.id}
                        className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleLoadReport(report)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl">{getReportTypeIcon(report.type)}</span>
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{report.name}</h3>
                                    <p className="text-xs text-[var(--text-muted)]">{getReportTypeLabel(report.type)}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteReport(report.id, report.name);
                                }}
                                                className="p-2 text-[var(--text-muted)] hover:text-danger-600 transition-colors"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-2 text-sm">
                            {report.filters.date_range && (
                                                <div className="flex items-center text-[var(--text-secondary)]">
                                                    <ClockIcon className="h-4 w-4 mr-2" />
                                    <span>
                    {formatDateForUser(report.filters.date_range.start_date, userDateFormat)} -{' '}
                                        {formatDateForUser(report.filters.date_range.end_date, userDateFormat)}
                  </span>
                                </div>
                            )}

                            {report.filters.account_id && (
                                                <div className="flex items-center text-[var(--text-secondary)]">
                                                    <span className="mr-2">🏦</span>
                                    <span>Filtered by account</span>
                                </div>
                            )}

                            {report.filters.category_id && (
                                                <div className="flex items-center text-[var(--text-secondary)]">
                                                    <span className="mr-2">📁</span>
                                    <span>Filtered by category</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                            <p className="text-xs text-[var(--text-muted)]">
                                Saved {formatDateForUser(report.created_at, userDateFormat)}
                            </p>
                        </div>

                        <div className="mt-3">
                            <button className="w-full btn-primary text-sm py-2">
                                Load Report
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavedReports;