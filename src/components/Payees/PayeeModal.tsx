import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store';
import { createPayee, updatePayee } from '../../store/slices/payeesSlice';
import { Payee } from '../../types/apiTypes';
import toast from 'react-hot-toast';

interface PayeeModalProps {
    payee: Payee | null;
    onClose: () => void;
    onSuccess?: (payee: Payee) => void;
}

interface PayeeForm {
    name: string;
    auto_assign_category_id?: number;
}

const schema = yup.object({
    name: yup.string().required('Payee name is required').min(2, 'Name must be at least 2 characters'),
    auto_assign_category_id: yup.number().nullable().transform((value, originalValue) =>
        originalValue === '' ? null : value
    ),
});

const PayeeModal: React.FC<PayeeModalProps> = ({ payee, onClose, onSuccess }) => {
    const dispatch = useAppDispatch();
    const { items: categories } = useAppSelector((state) => state.categories);
    const isEditing = !!payee;

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PayeeForm>({
        resolver: yupResolver(schema) as any,
        defaultValues: payee ? {
            name: payee.name,
            auto_assign_category_id: payee.auto_assign_category_id || undefined,
        } : {
            name: '',
            auto_assign_category_id: undefined,
        },
    });

    const onSubmit = async (data: PayeeForm) => {
        try {
            let result;
            if (isEditing) {
                result = await dispatch(updatePayee({ id: payee.id, ...data })).unwrap();
                toast.success('Payee updated successfully');
            } else {
                result = await dispatch(createPayee(data)).unwrap();
                toast.success('Payee created successfully');
            }

            if (onSuccess) {
                onSuccess(result);
            }

            onClose();
        } catch (error: any) {
            toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} payee`);
        }
    };

    return (
        <Transition appear show as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title className="text-xl font-semibold text-[var(--text-primary)]">
                                        {isEditing ? 'Edit Payee' : 'Create New Payee'}
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            Payee Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('name')}
                                            type="text"
                                            className="input"
                                            placeholder="e.g., Walmart, Starbucks, Electric Company"
                                            autoFocus
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            Auto-Assign Category (Optional)
                                        </label>
                                        <select {...register('auto_assign_category_id')} className="input">
                                            <option value="">None - I'll choose each time</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                                            When selected, this category will be automatically assigned to transactions with this payee
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary">
                                            {isSubmitting ? 'Saving...' : isEditing ? 'Update Payee' : 'Create Payee'}
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

export default PayeeModal;