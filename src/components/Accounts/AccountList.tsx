import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAccounts, deleteAccount } from '../../store/slices/accountsSlice';
import { Account } from '../../types/apiTypes';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AccountModal from './AccountModal';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const AccountList: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { items: accounts, loading } = useAppSelector((state) => state.accounts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    useEffect(() => {
        dispatch(fetchAccounts());
    }, [dispatch]);

    const handleDelete = async (account: Account) => {
        if (window.confirm(`Are you sure you want to delete "${account.name}"?`)) {
            try {
                await dispatch(deleteAccount(account.id)).unwrap();
                toast.success('Account deleted');
            } catch (error) {
                toast.error('Failed to delete account');
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getAccountIcon = (type: Account['type']) => {
        const icons = { checking: '🏦', savings: '💰', credit_card: '💳', investment: '📈' };
        return icons[type] || '💼';
    };

    const totalBalance = accounts.reduce((sum, acc) =>
        sum + (acc.type === 'credit_card' ? -acc.balance : acc.balance), 0
    );

    if (loading) {
        return <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>;
    }

    return (
        <div className="space-y-6">
        <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Accounts</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
        Total Net Worth: <span className="font-semibold text-lg">{formatCurrency(totalBalance)}</span>
        </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center">
    <PlusIcon className="h-5 w-5 mr-2" />
        Add Account
    </button>
    </div>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
                <div
                    key={account.id}
            className={clsx('card p-6 hover:shadow-md transition-shadow cursor-pointer', account.closed && 'opacity-50')}
    onClick={() => navigate(`/accounts/${account.id}`)}
>
    <div className="flex items-start justify-between">
    <div className="flex items-center space-x-3">
    <span className="text-3xl">{getAccountIcon(account.type)}</span>
    <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">{account.name}</h3>
        <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] capitalize">{account.type.replace('_', ' ')}</p>
        </div>
        </div>

        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
    <button onClick={() => { setEditingAccount(account); setIsModalOpen(true); }} className="p-1 text-gray-400 dark:text-[var(--text-muted)] hover:text-primary-600">
    <PencilIcon className="h-5 w-5" />
        </button>
        <button onClick={() => handleDelete(account)} className="p-1 text-gray-400 dark:text-[var(--text-muted)] hover:text-danger-600">
    <TrashIcon className="h-5 w-5" />
        </button>
        </div>
        </div>

        <div className="mt-4">
            <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Balance</span>
                <span className={clsx('text-2xl font-bold', account.balance >= 0 ? 'text-success-600' : 'text-danger-600')}>
            {formatCurrency(account.balance)}
            </span>
            </div>

            {!isNaN(account.uncleared_balance) && account.uncleared_balance !== 0 && (
                <div className="mt-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                    Uncleared: {formatCurrency(account.uncleared_balance)}
                </div>
            )}
        </div>

    {account.closed === 1 && (
        <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200">
                Closed
            </span>
        </div>
    )}
    </div>
))}
    </div>

    {isModalOpen && (
        <AccountModal account={editingAccount} onClose={() => { setIsModalOpen(false); setEditingAccount(null); }} />
    )}
    </div>
);
};

export default AccountList;