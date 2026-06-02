import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTransactions, deleteTransaction, bulkDeleteTransactions, bulkUpdateTransactionsStatus, setFilters, clearFilters } from '../../store/slices/transactionsSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { Transaction } from '../../types/apiTypes';
import { PlusIcon, PencilIcon, TrashIcon, FunnelIcon, ArrowDownTrayIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import TransactionModal from './TransactionModal';
import { format, startOfMonth, endOfMonth, format as formatDate } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import apiService from '../../services/api';

const TransactionsList: React.FC = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const { items: transactions, loading, filters, pagination } = useAppSelector((state) => state.transactions);
    const { items: categories } = useAppSelector((state) => state.categories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAll, setShowAll] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

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
            if (showAll) {
                const total = pagination?.total || 10000;
                dispatch(fetchTransactions({ ...filters, per_page: total, page: 1 }));
            } else {
                dispatch(fetchTransactions({ ...filters, per_page: pageSize, page: currentPage }));
            }
        }
    }, [dispatch, filters, initialized, pageSize, currentPage, showAll]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    useEffect(() => {
        if (pagination && currentPage > pagination.last_page && pagination.last_page > 0) {
            setCurrentPage(pagination.last_page);
        }
    }, [pagination, currentPage]);

    const handlePageSizeChange = (newSize: number) => {
        if (newSize === 10000) {
            setShowAll(true);
        } else {
            setShowAll(false);
            setPageSize(newSize);
            setCurrentPage(1);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

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

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} transaction${selectedIds.size !== 1 ? 's' : ''}?`)) {
            try {
                await dispatch(bulkDeleteTransactions(Array.from(selectedIds))).unwrap();
                toast.success(`${selectedIds.size} transactions deleted`);
                setSelectedIds(new Set());
            } catch (error) {
                toast.error('Failed to delete transactions');
            }
        }
    };

    const [bulkStatus, setBulkStatus] = useState<'cleared' | 'uncleared' | 'reconciled' | ''>('');

    const handleBulkUpdateStatus = async () => {
        alert("prue")
        if (selectedIds.size === 0 || !bulkStatus) return;
        try {
            await dispatch(bulkUpdateTransactionsStatus({ ids: Array.from(selectedIds), cleared: bulkStatus })).unwrap();
            toast.success(`${selectedIds.size} transactions updated`);
            setBulkStatus('');
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Bulk update failed:', error);
            toast.error('Failed to update transactions mdfkr');
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === transactions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(transactions.map(t => t.id)));
        }
    };

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
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
            if (filters.account_id) params.account_id = String(filters.account_id);
            if (filters.category_id) params.category_id = String(filters.category_id);
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

    const getPageNumbers = () => {
        if (!pagination) return [];
        const cp = pagination.current_page;
        const total = pagination.last_page;
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

        const pages: (number | string)[] = [];
        pages.push(1);
        if (cp > 3) pages.push('...');
        for (let i = Math.max(2, cp - 1); i <= Math.min(total - 1, cp + 1); i++) {
            pages.push(i);
        }
        if (cp < total - 2) pages.push('...');
        pages.push(total);
        return pages;
    };

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
                        {transactions.length > 0 && pagination
                            ? `${pagination.total} total · showing ${pagination.from}-${pagination.to}`
                            : `${transactions.length} transactions`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-default)]">
                        <span className="text-xs text-[var(--text-muted)]">Show</span>
                        <select
                            value={showAll ? 10000 : pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="bg-transparent text-sm font-medium text-[var(--text-primary)] focus:outline-none cursor-pointer"
                        >
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={10000}>All</option>
                        </select>
                    </div>
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

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="card p-4 flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                    <span className="text-sm text-primary-700 dark:text-primary-300">
                        {selectedIds.size} transaction{selectedIds.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2 items-center">
                        <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value as 'cleared' | 'uncleared' | 'reconciled' | '')}
                            className="input text-sm py-1.5"
                        >
                            <option value="">Set status...</option>
                            <option value="cleared">Cleared</option>
                            <option value="uncleared">Pending</option>
                            <option value="reconciled">Reconciled</option>
                        </select>
                        <button
                            onClick={handleBulkUpdateStatus}
                            disabled={!bulkStatus}
                            className="btn-secondary flex items-center text-sm disabled:opacity-50"
                        >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Update Status
                        </button>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="btn-secondary text-sm"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="btn-danger flex items-center text-sm"
                        >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                        </button>
                    </div>
                </div>
            )}

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
            <div className="relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-surface)] to-[var(--bg-secondary)] border-b-2 border-[var(--border-default)]">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-12">
                            <input
                                type="checkbox"
                                checked={transactions.length > 0 && selectedIds.size === transactions.length}
                                onChange={toggleSelectAll}
                                className="rounded border-[var(--border-default)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-0"
                            />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                        {showAccountColumn && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Account</th>
                        )}
                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Payee</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Memo</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 w-20"></th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[var(--bg-surface)] divide-y divide-[var(--border-default)]">
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan={showAccountColumn ? 9 : 8} className="px-6 py-16 text-center">
                                <div className="space-y-4">
                                    <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
                                        <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-semibold text-[var(--text-primary)]">No transactions found</p>
                                    <p className="text-sm text-[var(--text-muted)]">Add your first transaction to get started</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--accent)] text-white hover:shadow-lg hover:shadow-[var(--accent)]/30 transition-all"
                                    >
                                        Add Transaction
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        transactions.map((transaction) => (
                            <tr key={transaction.id} className="tx-table-row group hover:bg-[var(--accent)]/5 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(transaction.id)}
                                        onChange={() => toggleSelect(transaction.id)}
                                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-600"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[var(--text-primary)]">
                                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                </td>
                                {showAccountColumn && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[var(--text-primary)]">
                                        {transaction.account?.name}
                                    </td>
                                )}
                                <td className="px-6 py-4">
                                    {transaction.payee ? (
                                        <span className="font-medium text-[var(--text-primary)]">{transaction.payee.name}</span>
                                    ) : (
                                        <span className="text-[var(--text-muted)] italic">No payee</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {transaction.category ? (
                                        <div className="flex items-center gap-2">
                                            {transaction.category.color && (
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full ring-2 ring-[var(--bg-surface)]"
                                                    style={{ backgroundColor: transaction.category.color }}
                                                />
                                            )}
                                            <span className="text-[var(--text-primary)]">{transaction.category.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[var(--text-muted)] italic">Uncategorized</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {transaction.memo ? (
                                        <span className="text-sm text-[var(--text-muted)] max-w-[160px] truncate block" title={transaction.memo}>
                                            {transaction.memo}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-[var(--text-muted)]/50 italic">No memo</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className={clsx(
                                        'inline-flex px-2.5 py-1 rounded-lg text-sm font-bold tabular-nums',
                                        transaction.amount < 0 
                                            ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    )}>
                                        {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={clsx(
                                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
                                        transaction.cleared === 'cleared' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                                        transaction.cleared === 'uncleared' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                                        transaction.cleared === 'reconciled' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                    )}>
                                        {transaction.cleared}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => {
                                                setEditingTransaction(transaction);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(transaction)}
                                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
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

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
                        <div className="text-sm text-[var(--text-secondary)]">
                            <span className="tabular-nums">
                                {pagination.from}–{pagination.to}
                            </span>
                            {' '}of{' '}
                            <span className="font-medium text-[var(--text-primary)] tabular-nums">
                                {pagination.total}
                            </span>
                            {' '}transactions
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className={clsx(
                                    'group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                                    'border border-[var(--border-default)] bg-[var(--bg-surface)]',
                                    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5',
                                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--border-default)] disabled:hover:bg-[var(--bg-surface)] disabled:hover:text-[var(--text-secondary)]'
                                )}
                                aria-label="Previous page"
                            >
                                <ChevronLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                <span className="hidden sm:inline">Prev</span>
                            </button>

                            {getPageNumbers().map((page, index) =>
                                page === '...' ? (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="flex items-center justify-center w-9 h-9 text-sm text-[var(--text-muted)]"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-default)]" />
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page as number)}
                                        className={clsx(
                                            'flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg text-sm font-semibold transition-all duration-150',
                                            currentPage === page
                                                ? 'bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/30'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent)]/8 border border-transparent hover:border-[var(--accent)]/30'
                                        )}
                                        aria-current={currentPage === page ? 'page' : undefined}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= pagination.last_page}
                                className={clsx(
                                    'group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                                    'border border-[var(--border-default)] bg-[var(--bg-surface)]',
                                    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5',
                                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--border-default)] disabled:hover:bg-[var(--bg-surface)] disabled:hover:text-[var(--text-secondary)]'
                                )}
                                aria-label="Next page"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Show all / single page — subtle footer */}
                {(!pagination || pagination.last_page <= 1) && transactions.length > 0 && (
                    <div className="flex items-center justify-end px-6 py-3 border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
                        <div className="text-sm text-[var(--text-muted)] tabular-nums">
                            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                            {pagination && ` · page ${pagination.current_page}`}
                        </div>
                    </div>
                )}
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