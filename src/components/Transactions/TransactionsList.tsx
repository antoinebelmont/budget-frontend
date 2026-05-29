import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTransactions, deleteTransaction, setFilters, clearFilters } from '../../store/slices/transactionsSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { Transaction } from '../../types/api';
import { PlusIcon, PencilIcon, TrashIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import TransactionModal from './TransactionModal';
import { format, startOfMonth, endOfMonth, format as formatDate } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import apiService from '../../services/api';

const TransactionsList: React.FC = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const { items: transactions, loading, filters } = useAppSelector((state) => state.transactions);
    const { items: categories } = useAppSelector((state) => state.categories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const accountIdFromUrl = searchParams.get('account_id');
    const showAccountColumn = !accountIdFromUrl;

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        if (!initialized) {
            const now = new Date();
            const defaultStartDate = formatDate(startOfMonth(now), 'yyyy-MM-dd');
            const defaultEndDate = formatDate(endOfMonth(now), 'yyyy-MM-dd');

            const initialFilters: any = {};

            if (accountIdFromUrl) {
                initialFilters.account_id = parseInt(accountIdFromUrl, 10);
            }

            initialFilters.start_date = defaultStartDate;
            initialFilters.end_date = defaultEndDate;

            dispatch(setFilters(initialFilters));
            setInitialized(true);
        }
    }, [dispatch, initialized, accountIdFromUrl]);

    useEffect(() => {
        if (initialized && accountIdFromUrl) {
            dispatch(setFilters({ account_id: parseInt(accountIdFromUrl, 10) }));
        } else if (initialized && !accountIdFromUrl) {
            dispatch(setFilters({ account_id: undefined }));
        }
    }, [dispatch, accountIdFromUrl, initialized]);

    useEffect(() => {
        if (initialized) {
            dispatch(fetchTransactions(filters));
        }
    }, [dispatch, filters, initialized]);

    const handleDelete = async (transaction: Transaction) => {
        if (window.confirm(`Are you sure you want to delete this transaction?`)) {
            try {
                await dispatch(deleteTransaction(transaction.id)).unwrap();
                toast.success('Transaction deleted');
            } catch (error) {
                toast.error('Failed to delete transaction');
            }
        }
    };

    const handleFilterChange = (filterKey: string, value: any) => {
        dispatch(setFilters({ [filterKey]: value || undefined }));
    };

    const handleClearFilters = () => {
        const now = new Date();
        const defaultStartDate = formatDate(startOfMonth(now), 'yyyy-MM-dd');
        const defaultEndDate = formatDate(endOfMonth(now), 'yyyy-MM-dd');

        dispatch(setFilters({
            category_id: undefined,
            start_date: defaultStartDate,
            end_date: defaultEndDate,
        }));
        setSearchTerm('');
    };

    const handleExport = async (retryCount = 0) => {
        setIsExporting(true);
        try {
            const params: Record<string, string> = {};
            if (filters.account_id) params.account_id = filters.account_id;
            if (filters.category_id) params.category_id = filters.category_id;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;

            const blob = await apiService.exportCsv('/transactions/export', params);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.download = `transactions_${date}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Transactions exported successfully');
        } catch (error: any) {
            const isAuthError = error.response?.status === 401;
            const isTimeout = error.code === 'ECONNABORTED';

            if (isAuthError) {
                toast.error('Authentication failed. Please log in again.');
            } else if (isTimeout) {
                if (retryCount < 2) {
                    toast.error('Export timed out. Retrying...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return handleExport(retryCount + 1);
                }
                toast.error('Export failed due to timeout. Please try again.');
            } else {
                if (retryCount < 2) {
                    toast.error('Export failed. Retrying...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return handleExport(retryCount + 1);
                }
                toast.error('Failed to export transactions. Please try again.');
            }
        } finally {
            setIsExporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));
    };

    const getStatusBadge = (status: Transaction['cleared']) => {
        const badges: Record<string, { emoji: string; label: string; class: string }> = {
            uncleared: { emoji: '⏳', label: 'Pending', class: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' },
            cleared: { emoji: '✅', label: 'Done', class: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
            reconciled: { emoji: '🔒', label: 'Locked', class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
        };
        const badge = badges[status];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
        <span className="mr-1">{badge.emoji}</span>
                {badge.label}
      </span>
        );
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== undefined).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Transactions</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                        {activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} active)`}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={clsx(
                            'btn-secondary flex items-center',
                            activeFiltersCount > 0 && 'ring-2 ring-primary-500'
                        )}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="ml-2 bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </span>
                        )}
                    </button>
                    <button
                        onClick={() => handleExport()}
                        disabled={isExporting}
                        className={clsx(
                            'btn-secondary flex items-center',
                            isExporting && 'opacity-50 cursor-not-allowed'
                        )}
                        aria-label="Export transactions to CSV"
                        aria-busy={isExporting}
                    >
                        {isExporting ? (
                            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        )}
                        Export
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="card p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-[var(--text-primary)]">Filters</h3>
                        {activeFiltersCount > 0 && (
                            <button onClick={handleClearFilters} className="text-sm text-primary-600 hover:text-primary-700">
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Category</label>
                            <select
                                value={filters.category_id || ''}
                                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                className="input"
                            >
                                <option value="">All categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Start Date</label>
                            <input
                                type="date"
                                value={filters.start_date || ''}
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">End Date</label>
                            <input
                                type="date"
                                value={filters.end_date || ''}
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions Table */}
            <div className="card overflow-hidden">
                <table className="min-w-full divide-y divide-[var(--border-default)]">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Date</th>
                        {showAccountColumn && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Account</th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Payee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Memo</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Amount</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[var(--bg-surface)] divide-y divide-[var(--border-default)]">
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan={showAccountColumn ? 8 : 7} className="px-6 py-12 text-center">
                                <div className="text-gray-500">
                                    <p className="text-lg font-medium">No transactions found</p>
                                    <p className="text-sm mt-1">Add your first transaction to get started</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-4 btn-primary"
                                    >
                                        Add Transaction
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[var(--text-primary)]">
                                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                </td>
                                {showAccountColumn && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[var(--text-primary)]">
                                        {transaction.account?.name}
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[var(--text-primary)]">
                                    {transaction.payee?.name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {transaction.category ? (
                                        <div className="flex items-center">
                                            {transaction.category.color && (
                                                <span
                                                    className="w-3 h-3 rounded-full mr-2"
                                                    style={{ backgroundColor: transaction.category.color }}
                                                />
                                            )}
                                            {transaction.category.name}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Uncategorized</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-[var(--text-muted)] max-w-xs truncate">
                                    {transaction.memo || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                      {transaction.amount < 0 ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {getStatusBadge(transaction.cleared)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingTransaction(transaction);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-1 text-gray-400 dark:text-[var(--text-muted)] hover:text-primary-600"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(transaction)}
                                            className="p-1 text-gray-400 dark:text-[var(--text-muted)] hover:text-danger-600"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Transaction Modal */}
            {isModalOpen && (
                <TransactionModal
                    transaction={editingTransaction}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingTransaction(null);
                    }}
                />
            )}
        </div>
    );
};

export default TransactionsList;