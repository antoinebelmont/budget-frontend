// src/components/Accounts/AccountModal.tsx
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch } from '../../store';
import { createAccount, updateAccount } from '../../store/slices/accountsSlice';
import { Account, AccountForm } from '../../types/apiTypes';
import toast from 'react-hot-toast';

interface AccountModalProps {
    account: Account | null;
    onClose: () => void;
}

const schema = yup.object({
    name: yup.string().required('Account name is required'),
    type: yup.string().oneOf(['checking', 'savings', 'credit_card', 'investment']).required('Account type is required'),
    balance: yup.number().required('Balance is required'),
});

const AccountModal: React.FC<AccountModalProps> = ({ account, onClose }) => {
    const dispatch = useAppDispatch();
    const isEditing = !!account;

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AccountForm>({
        resolver: yupResolver(schema),
        defaultValues: account ? {
            name: account.name,
            type: account.type,
            balance: account.balance,
        } : undefined,
    });

    const onSubmit = async (data: AccountForm) => {
        try {
            if (isEditing) {
                await dispatch(updateAccount({ id: account.id, ...data })).unwrap();
                toast.success('Account updated successfully');
            } else {
                await dispatch(createAccount(data)).unwrap();
                toast.success('Account created successfully');
            }
            onClose();
        } catch (error) {
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} account`);
        }
    };

    return (
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
    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[var(--bg-surface)] p-6 shadow-xl transition-all">
    <div className="flex justify-between items-center mb-4">
    <Dialog.Title className="text-lg font-medium text-[var(--text-primary)]">
        {isEditing ? 'Edit Account' : 'Add Account'}
        </Dialog.Title>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
    <XMarkIcon className="h-6 w-6" />
        </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)]">Account Name</label>
    <input {...register('name')} type="text" className="input mt-1" placeholder="e.g., Checking Account" />
        {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>}
            </div>

            <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Account Type</label>
        <select {...register('type')} className="input mt-1">
    <option value="">Select type</option>
    <option value="checking">Checking</option>
        <option value="savings">Savings</option>
        <option value="credit_card">Credit Card</option>
    <option value="investment">Investment</option>
        </select>
    {errors.type && <p className="mt-1 text-sm text-danger-600">{errors.type.message}</p>}
    </div>

    <div>
    <label className="block text-sm font-medium text-[var(--text-secondary)]">Current Balance</label>
    <input {...register('balance')} type="number" step="0.01" className="input mt-1" placeholder="0.00" />
        {errors.balance && <p className="mt-1 text-sm text-danger-600">{errors.balance.message}</p>}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
            </div>
            </form>
            </Dialog.Panel>
            </Transition.Child>
            </div>
            </div>
            </Dialog>
            </Transition>
    );
    };

        export default AccountModal;