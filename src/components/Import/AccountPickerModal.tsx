import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import { Account } from '@/types/apiTypes';

interface AccountPickerModalProps {
    open: boolean;
    onClose: () => void;
    onAccountSelect: (accountId: number) => void;
}

const ACCOUNT_TYPE_LABELS: Record<Account['type'], string> = {
    checking: 'Checking',
    savings: 'Savings',
    credit_card: 'Credit Card',
    investment: 'Investment',
};

const AccountPickerModal: React.FC<AccountPickerModalProps> = ({ open, onClose, onAccountSelect }) => {
    const dispatch = useAppDispatch();
    const { items: accounts, loading, error } = useAppSelector((state) => state.accounts);

    useEffect(() => {
        if (open && accounts.length === 0 && !loading) {
            dispatch(fetchAccounts());
        }
    }, [open, accounts.length, loading, dispatch]);

    const nonClosedAccounts = accounts.filter((a) => a.closed === 0);

    const handleSelect = (accountId: number) => {
        onAccountSelect(accountId);
        onClose();
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[var(--bg-surface)] p-6 shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title className="text-lg font-medium text-[var(--text-primary)]">
                                        Select Account
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <p className="text-sm text-[var(--text-secondary)] mb-4">
                                    Choose an account to import into:
                                </p>

                                {loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                                        <span className="ml-3 text-sm text-[var(--text-muted)]">Loading accounts...</span>
                                    </div>
                                )}

                                {!loading && error && (
                                    <div className="rounded-lg bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-700 dark:text-red-400">
                                        {error}
                                    </div>
                                )}

                                {!loading && !error && nonClosedAccounts.length === 0 && (
                                    <div className="text-center py-8 text-sm text-[var(--text-muted)]">
                                        No accounts available. Create an account first.
                                    </div>
                                )}

                                {!loading && !error && nonClosedAccounts.length > 0 && (
                                    <ul className="space-y-2 max-h-72 overflow-y-auto">
                                        {nonClosedAccounts.map((account) => (
                                            <li key={account.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelect(account.id)}
                                                    className="w-full text-left px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--accent)]/5 hover:border-[var(--accent)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)]"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-[var(--text-primary)]">
                                                            {account.name}
                                                        </span>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                                                            {ACCOUNT_TYPE_LABELS[account.type]}
                                                        </span>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="mt-6 flex justify-end">
                                    <button type="button" onClick={onClose} className="btn-secondary">
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AccountPickerModal;
