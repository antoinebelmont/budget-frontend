import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store';
import { createTransaction, updateTransaction } from '../../store/slices/transactionsSlice';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { fetchPayees } from '../../store/slices/payeesSlice';
import { Transaction, TransactionForm } from '../../types/apiTypes';
import PayeeModal from '../Payees/PayeeModal';
import { CategorySelect } from '../ui/CategorySelect';
import toast from 'react-hot-toast';

interface TransactionModalProps {
    transaction: Transaction | null;
    accountId?: number;
    onClose: () => void;
}

const schema = yup.object({
    account_id: yup.number().required('Account is required'),
    date: yup.string().required('Date is required'),
    amount: yup.number().required('Amount is required').test('not-zero', 'Amount cannot be zero', value => value !== 0),
    payee_id: yup.number().nullable().transform((value, originalValue) =>
        originalValue === '' ? null : value
    ),
    category_id: yup.number().nullable().transform((value, originalValue) =>
        originalValue === '' ? null : value
    ),
    memo: yup.string().max(255, 'Memo is too long'),
    cleared: yup.string().oneOf(['cleared', 'uncleared', 'reconciled']).default('uncleared'),
});

const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, accountId, onClose }) => {
    const dispatch = useAppDispatch();
    const { items: accounts } = useAppSelector((state) => state.accounts);
    const { items: categories } = useAppSelector((state) => state.categories);
    const { items: payees } = useAppSelector((state) => state.payees);
    const isEditing = !!transaction;

    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'expense' | 'income'>(
        transaction ? (transaction.amount < 0 ? 'expense' : 'income') : 'expense'
    );

    useEffect(() => {
        dispatch(fetchAccounts());
        dispatch(fetchCategories());
        dispatch(fetchPayees());
    }, [dispatch]);

    const { register, handleSubmit, watch, setValue, reset, control, formState: { errors, isSubmitting } } = useForm<TransactionForm>({
        resolver: yupResolver(schema) as any,
        defaultValues: transaction ? {
            account_id: transaction.account_id,
            date: transaction.date.split('T')[0],
            amount: Math.abs(transaction.amount),
            payee_id: transaction.payee_id || undefined,
            category_id: transaction.category_id || undefined,
            memo: transaction.memo || '',
            cleared: transaction.cleared,
        } : {
            account_id: accountId,
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            cleared: 'uncleared',
        },
    });

    // Re-apply defaults after reference data (accounts/payees) finishes loading
    useEffect(() => {
        if (isEditing && transaction && accounts.length > 0 && payees.length > 0) {
            reset({
                account_id: transaction.account_id,
                date: transaction.date.split('T')[0],
                amount: Math.abs(transaction.amount),
                payee_id: transaction.payee_id || undefined,
                category_id: transaction.category_id || undefined,
                memo: transaction.memo || '',
                cleared: transaction.cleared,
            });
        }
    }, [isEditing, transaction, accounts, payees, reset]);

    // Watch for payee changes to auto-assign category
    const selectedPayeeId = watch('payee_id');

    useEffect(() => {
        // Auto-assign category when payee is selected
        if (selectedPayeeId && !isEditing) {
            const selectedPayee = payees.find(p => p.id === Number(selectedPayeeId));
            if (selectedPayee?.auto_assign_category_id) {
                setValue('category_id', selectedPayee.auto_assign_category_id);
                toast.success(`Category auto-assigned: ${selectedPayee.auto_assign_category?.name}`);
            }
        }
    }, [selectedPayeeId, payees, setValue, isEditing]);

    const onSubmit = async (data: TransactionForm) => {
        try {
            const amount = transactionType === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
            const transactionData = { ...data, amount };

            if (isEditing) {
                await dispatch(updateTransaction({ id: transaction.id, ...transactionData })).unwrap();
                toast.success('Transaction updated successfully');
            } else {
                await dispatch(createTransaction(transactionData)).unwrap();
                toast.success('Transaction created successfully');
            }

            onClose();
        } catch (error: any) {
            toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} transaction`);
        }
    };

    const handleQuickAddPayee = () => {
        setIsPayeeModalOpen(true);
    };

    const handlePayeeCreated = (newPayee: any) => {
        setValue('payee_id', newPayee.id);

        // Auto-assign category if payee has one
        if (newPayee.auto_assign_category_id) {
            setValue('category_id', newPayee.auto_assign_category_id);
            toast.success(`Payee "${newPayee.name}" created and category auto-assigned!`);
        } else {
            toast.success(`Payee "${newPayee.name}" created and selected`);
        }
    };

    return (
        <>
            <Transition appear show as={Fragment}>
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[var(--bg-surface)] p-6 shadow-xl transition-all">
                                    <div className="flex justify-between items-center mb-6">
                                        <Dialog.Title className="text-xl font-semibold text-[var(--text-primary)]">
                                            {isEditing ? 'Edit Transaction' : 'New Transaction'}
                                        </Dialog.Title>
                                        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                        {/* Transaction Type Toggle */}
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                                Transaction Type
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setTransactionType('expense')}
                                                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                                                        transactionType === 'expense'
                                                            ? 'bg-red-600 text-white shadow-md'
                                                            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                                                    }`}
                                                >
                                                    💸 Expense
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setTransactionType('income')}
                                                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                                                        transactionType === 'income'
                                                            ? 'bg-green-600 text-white shadow-md'
                                                            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                                                    }`}
                                                >
                                                    💰 Income
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Account */}
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                                    Account <span className="text-red-500">*</span>
                                                </label>
                                                <select {...register('account_id')} className="input">
                                                    <option value="">Select account...</option>
                                                    {accounts.filter(a => !a.closed).map((account) => (
                                                        <option key={account.id} value={account.id}>
                                                            {account.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.account_id && (
                                                    <p className="mt-1 text-sm text-danger-600">{'The Account is required, please select one'}</p>
                                                )}
                                            </div>

                                            {/* Date */}
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                                    Date <span className="text-red-500">*</span>
                                                </label>
                                                <input {...register('date')} type="date" className="input" />
                                                {errors.date && (
                                                    <p className="mt-1 text-sm text-danger-600">{errors.date.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payee with Quick Add */}
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                                Payee
                                            </label>
                                            <div className="flex gap-2">
                                                <select {...register('payee_id')} className="input flex-1">
                                                    <option value="">Select payee...</option>
                                                    {payees.map((payee) => (
                                                        <option key={payee.id} value={payee.id}>
                                                            {payee.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={handleQuickAddPayee}
                                                    className="btn-secondary flex items-center px-3"
                                                    title="Quick add new payee"
                                                >
                                                    <PlusCircleIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Category & Amount */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                                    Category
                                                </label>
                                                <Controller
                                                    name="category_id"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <CategorySelect
                                                            value={field.value ?? null}
                                                            onChange={(val) => field.onChange(val ?? null)}
                                                            placeholder="Select category..."
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                                    Amount <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
                                                    <input
                                                        {...register('amount')}
                                                        type="number"
                                                        step="0.01"
                                                        className="input pl-8"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {errors.amount && (
                                                    <p className="mt-1 text-sm text-danger-600">{errors.amount.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Memo */}
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                                Memo
                                            </label>
                                            <textarea
                                                {...register('memo')}
                                                rows={3}
                                                className="input"
                                                placeholder="Add notes about this transaction..."
                                            />
                                            {errors.memo && (
                                                <p className="mt-1 text-sm text-danger-600">{errors.memo.message}</p>
                                            )}
                                        </div>

                                        {/* Cleared Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                                Status
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { value: 'uncleared', emoji: '⏳', label: 'Uncleared' },
                                                    { value: 'cleared', emoji: '✅', label: 'Cleared' },
                                                    { value: 'reconciled', emoji: '🔒', label: 'Reconciled' },
                                                ].map((status) => (
                                                    <label
                                                        key={status.value}
                                                        className="relative flex items-center p-3 cursor-pointer border-2 rounded-lg border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors [&:has(:checked)]:border-primary-600 [&:has(:checked)]:bg-primary-500 [&:has(:checked)]:text-white dark:[&:has(:checked)]:border-primary-400 dark:[&:has(:checked)]:bg-primary-600"
                                                    >
                                                        <input
                                                            {...register('cleared')}
                                                            type="radio"
                                                            value={status.value}
                                                            className="sr-only"
                                                        />
                                                        <div className="flex items-center w-full">
                                                            <span className="text-2xl mr-2">{status.emoji}</span>
                                                            <span className="text-sm font-medium">{status.label}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-4">
                                            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary">
                                                {isSubmitting ? 'Saving...' : isEditing ? 'Update Transaction' : 'Create Transaction'}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Quick Add Payee Modal */}
            {isPayeeModalOpen && (
                <PayeeModal
                    payee={null}
                    onClose={() => setIsPayeeModalOpen(false)}
                    onSuccess={handlePayeeCreated}
                />
            )}
        </>
    );
};

export default TransactionModal;