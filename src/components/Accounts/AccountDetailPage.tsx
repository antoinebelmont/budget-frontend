import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAccountById, updateAccount, deleteAccount, clearCurrentAccount } from '../../store/slices/accountsSlice';
import { fetchTransactions, setFilters, clearFilters } from '../../store/slices/transactionsSlice';
import {
    ArrowLeftIcon,
    PencilIcon,
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import TransactionModal from '../Transactions/TransactionModal';
import AccountModal from './AccountModal';
import { formatDateForUser } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';

const AccountDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { currentAccount, loading: accountLoading } = useAppSelector((state) => state.accounts);
    const { items: transactions, loading: transactionsLoading } = useAppSelector((state) => state.transactions);
    const userDateFormat = useAppSelector((state) => state.auth.preferences?.date_format ?? 'Y-m-d');

    const [isReconciling, setIsReconciling] = useState(false);
    const [reconcileBalance, setReconcileBalance] = useState('');
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            const accountId = parseInt(id);
            // Fetch account details
            dispatch(fetchAccountById(accountId));
            // Fetch transactions for this account
            dispatch(setFilters({ account_id: accountId }));
            dispatch(fetchTransactions({ account_id: accountId }));
        }

        return () => {
            dispatch(clearCurrentAccount());
            dispatch(clearFilters());
        };
    }, [dispatch, id]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(Math.abs(amount));
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { emoji: string; label: string; class: string }> = {
            uncleared: { emoji: '⏳', label: 'Uncleared', class: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
            cleared: { emoji: '✅', label: 'Cleared', class: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
            reconciled: { emoji: '🔒', label: 'Reconciled', class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
        };
        const badge = badges[status as keyof typeof badges];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
        <span className="mr-1">{badge.emoji}</span>
                {badge.label}
      </span>
        );
    };

    const getAccountIcon = (type: string) => {
        const icons = {
            checking: '🏦',
            savings: '💰',
            credit_card: '💳',
            investment: '📈'
        };
        return icons[type as keyof typeof icons] || '💼';
    };

    const handleDeleteAccount = async () => {
        if (!currentAccount) return;

        if (window.confirm(`Are you sure you want to delete "${currentAccount.name}"? This will also delete all associated transactions.`)) {
            try {
                await dispatch(deleteAccount(currentAccount.id)).unwrap();
                toast.success('Account deleted successfully');
                navigate('/accounts');
            } catch (error) {
                toast.error('Failed to delete account');
            }
        }
    };

    const handleStartReconciliation = () => {
        if (!reconcileBalance) return;

        toast.success('Starting reconciliation process...');
        // You would implement the reconciliation workflow here
        setIsReconciling(false);
    };

    if (accountLoading || !currentAccount) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Calculate stats
    const stats = {
        totalIncome: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + +t.amount, 0),
        totalExpenses: transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
        clearedCount: transactions.filter(t => t.cleared === 'cleared').length,
        unclearedCount: transactions.filter(t => t.cleared === 'uncleared').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/accounts')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-[var(--text-secondary)]" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <span className="text-4xl">{getAccountIcon(currentAccount.type)}</span>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{currentAccount.name}</h1>
                            <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] capitalize mt-1">
                                {currentAccount.type.replace('_', ' ')} Account
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => setIsReconciling(true)}
                        className="btn-primary flex items-center"
                    >
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Reconcile
                    </button>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="btn-secondary flex items-center"
                    >
                        <PencilIcon className="h-5 w-5 mr-2" />
                        Edit
                    </button>
                </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-primary-100 text-sm font-medium">Current Balance</p>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">
                            💰
                        </div>
                    </div>
                    <p className="text-3xl font-bold mb-1">{formatCurrency(currentAccount.balance)}</p>
                    <p className="text-primary-100 text-xs">As of today</p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-600 dark:text-[var(--text-secondary)] text-sm font-medium">Cleared Balance</p>
                        <CheckCircleIcon className="h-6 w-6 text-success-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-1">
                        {formatCurrency(currentAccount.cleared_balance)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">
                        {stats.clearedCount} cleared transaction{stats.clearedCount !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-600 dark:text-[var(--text-secondary)] text-sm font-medium">Uncleared</p>
                        <XCircleIcon className="h-6 w-6 text-warning-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-1">
                        {formatCurrency(currentAccount.uncleared_balance)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">
                        {stats.unclearedCount} pending transaction{stats.unclearedCount !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Income This Period</h3>
                        <ArrowTrendingUpIcon className="h-6 w-6 text-success-500" />
                    </div>
                    <p className="text-3xl font-bold text-success-600">
                        +{formatCurrency(stats.totalIncome)}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                        <div className="flex items-center text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                            <ChartBarIcon className="h-4 w-4 mr-2" />
                            <span>Last 30 days</span>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Expenses This Period</h3>
                        <ArrowTrendingDownIcon className="h-6 w-6 text-danger-500" />
                    </div>
                    <p className="text-3xl font-bold text-danger-600">
                        -{formatCurrency(stats.totalExpenses)}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                        <div className="flex items-center text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                            <ChartBarIcon className="h-4 w-4 mr-2" />
                            <span>Last 30 days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">Recent Transactions</h2>
                    <button
                        onClick={() => setIsTransactionModalOpen(true)}
                        className="btn-primary flex items-center text-sm"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Transaction
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border-default)]">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Payee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Memo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Amount</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-[var(--text-muted)] uppercase">Status</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[var(--bg-surface)] divide-y divide-[var(--border-default)]">
                        {transactionsLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <p className="text-gray-500">No transactions yet</p>
                                    <button
                                        onClick={() => setIsTransactionModalOpen(true)}
                                        className="mt-4 btn-primary text-sm"
                                    >
                                        Add your first transaction
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            transactions.slice(0, 10).map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[var(--text-primary)]">
                                        {formatDateForUser(transaction.date, userDateFormat)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
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
                                                <span className="text-gray-700 dark:text-[var(--text-secondary)]">{transaction.category.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 dark:text-[var(--text-muted)]">Uncategorized</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-[var(--text-muted)] max-w-xs truncate">
                                        {transaction.memo || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                      <span className={transaction.amount < 0 ? 'text-danger-600' : 'text-success-600'}>
                        {transaction.amount < 0 ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {getStatusBadge(transaction.cleared)}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {transactions.length > 10 && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t border-[var(--border-default)] text-center">
                        <button
                            onClick={() => navigate('/transactions')}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            View all {transactions.length} transactions →
                        </button>
                    </div>
                )}
            </div>

            {/* Reconcile Modal */}
            {isReconciling && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-[var(--bg-surface)] rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                                Reconcile Account
                            </h2>
                            <button
                                onClick={() => setIsReconciling(false)}
                                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mb-6">
                            Enter the ending balance from your bank statement to reconcile this account.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Statement Ending Balance
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[var(--text-muted)]">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={reconcileBalance}
                                        onChange={(e) => setReconcileBalance(e.target.value)}
                                        className="input pl-8"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                                <p className="text-sm text-primary-800 dark:text-primary-300">
                                    <strong>Current cleared balance:</strong> {formatCurrency(currentAccount.cleared_balance)}
                                </p>
                                {reconcileBalance && (
                                    <p className="text-sm text-primary-800 dark:text-primary-300 mt-2">
                                        <strong>Difference:</strong> {formatCurrency(Math.abs(parseFloat(reconcileBalance) - currentAccount.cleared_balance))}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsReconciling(false)}
                                className="flex-1 btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStartReconciliation}
                                disabled={!reconcileBalance}
                                className="flex-1 btn-primary disabled:opacity-50"
                            >
                                Start Reconciling
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Modal */}
            {isTransactionModalOpen && (
                <TransactionModal
                    transaction={null}
                    accountId={currentAccount.id}
                    onClose={() => setIsTransactionModalOpen(false)}
                />
            )}

            {/* Edit Account Modal */}
            {isEditModalOpen && (
                <AccountModal
                    account={currentAccount}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
};

export default AccountDetailPage;