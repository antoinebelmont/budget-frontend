import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store';
import { createGoal, updateGoal } from '../../store/slices/goalsSlice';
import { fetchBudget } from '../../store/slices/budgetSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { Goal, GoalForm } from '../../types/apiTypes';
import toast from 'react-hot-toast';
import { addMonths } from 'date-fns';

interface GoalModalProps {
    goal: Goal | null;
    onClose: () => void;
}

const schema = yup.object({
    category_id: yup.number().required('Category is required'),
    type: yup.string().oneOf(['target_balance', 'target_date', 'monthly_funding']).required('Goal type is required'),
    target_amount: yup.number().when('type', {
        is: (val: string) => val !== 'monthly_funding',
        then: (schema) => schema.required('Target amount is required').min(1, 'Must be greater than 0'),
        otherwise: (schema) => schema.nullable(),
    }),
    target_date: yup.string().when('type', {
        is: 'target_date',
        then: (schema) => schema.required('Target date is required'),
        otherwise: (schema) => schema.nullable(),
    }),
    monthly_amount: yup.number().when('type', {
        is: 'monthly_funding',
        then: (schema) => schema.required('Monthly amount is required').min(1, 'Must be greater than 0'),
        otherwise: (schema) => schema.nullable(),
    }),
});

const GoalModal: React.FC<GoalModalProps> = ({ goal, onClose }) => {
    const dispatch = useAppDispatch();
    const { items: categories } = useAppSelector((state) => state.categories);
    const { items: goals } = useAppSelector((state) => state.goals);
    const isEditing = !!goal;

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<GoalForm>({
        resolver: yupResolver(schema) as any,
        defaultValues: goal ? {
            category_id: goal.category_id,
            type: goal.type,
            target_amount: goal.target_amount || undefined,
            target_date: goal.target_date || undefined,
            monthly_amount: goal.monthly_amount || undefined,
        } : {
            type: 'target_balance',
        },
    });

    const watchType = watch('type');
    const watchTargetAmount = watch('target_amount');

    // Filter out categories that already have goals (unless editing)
    const availableCategories = categories.filter((cat: import('../../types/apiTypes').Category) => {
        if (isEditing && cat.id === goal.category_id) return true;
        return !goals.some(g => g.category_id === cat.id);
    });

    const onSubmit = async (data: GoalForm) => {
        try {
            if (isEditing) {
                await dispatch(updateGoal({ id: goal.id, ...data })).unwrap();
                toast.success('Goal updated successfully');
            } else {
                await dispatch(createGoal(data)).unwrap();
                toast.success('Goal created successfully');
            }

            await dispatch(fetchBudget());
            onClose();
        } catch (error: any) {
            toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} goal`);
        }
    };

    const handleQuickDate = (months: number) => {
        const date = addMonths(new Date(), months);
        setValue('target_date', date.toISOString().split('T')[0]);
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
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                                        {isEditing ? 'Edit Goal' : 'Create New Goal'}
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    {/* Category Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select {...register('category_id')} className="input">
                                            <option value="">Select a category...</option>
                                            {availableCategories.map((category: import('../../types/apiTypes').Category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && (
                                            <p className="mt-1 text-sm text-danger-600">{errors.category_id.message}</p>
                                        )}
                                        {availableCategories.length === 0 && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                All categories already have goals. Create a new category first.
                                            </p>
                                        )}
                                    </div>

                                    {/* Goal Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Goal Type <span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-3">
                                            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input
                                                    {...register('type')}
                                                    type="radio"
                                                    value="target_balance"
                                                    className="mt-1"
                                                />
                                                <div className="ml-3">
                                                    <div className="font-medium text-gray-900">💰 Target Balance</div>
                                                    <div className="text-sm text-gray-600">Save up to a specific amount</div>
                                                </div>
                                            </label>
                                            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input
                                                    {...register('type')}
                                                    type="radio"
                                                    value="target_date"
                                                    className="mt-1"
                                                />
                                                <div className="ml-3">
                                                    <div className="font-medium text-gray-900">📅 Target Date</div>
                                                    <div className="text-sm text-gray-600">Reach your goal by a specific date</div>
                                                </div>
                                            </label>
                                            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input
                                                    {...register('type')}
                                                    type="radio"
                                                    value="monthly_funding"
                                                    className="mt-1"
                                                />
                                                <div className="ml-3">
                                                    <div className="font-medium text-gray-900">🔄 Monthly Funding</div>
                                                    <div className="text-sm text-gray-600">Set a recurring monthly amount</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Target Amount (for target_balance and target_date) */}
                                    {(watchType === 'target_balance' || watchType === 'target_date') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Target Amount <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                <input
                                                    {...register('target_amount')}
                                                    type="number"
                                                    step="0.01"
                                                    className="input pl-8"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            {errors.target_amount && (
                                                <p className="mt-1 text-sm text-danger-600">{errors.target_amount.message}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Target Date (for target_date only) */}
                                    {watchType === 'target_date' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Target Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                {...register('target_date')}
                                                type="date"
                                                className="input"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            {errors.target_date && (
                                                <p className="mt-1 text-sm text-danger-600">{errors.target_date.message}</p>
                                            )}
                                            <div className="mt-2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuickDate(3)}
                                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                                                >
                                                    3 months
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuickDate(6)}
                                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                                                >
                                                    6 months
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuickDate(12)}
                                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                                                >
                                                    1 year
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Monthly Amount (for monthly_funding only) */}
                                    {watchType === 'monthly_funding' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Monthly Amount <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                <input
                                                    {...register('monthly_amount')}
                                                    type="number"
                                                    step="0.01"
                                                    className="input pl-8"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            {errors.monthly_amount && (
                                                <p className="mt-1 text-sm text-danger-600">{errors.monthly_amount.message}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Preview */}
                                    {watchTargetAmount && watchTargetAmount > 0 && (
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                            <p className="text-xs font-medium text-blue-800 mb-2">💡 Quick Calculation</p>
                                            <p className="text-sm text-blue-900">
                                                To reach <span className="font-semibold">${watchTargetAmount.toLocaleString()}</span>
                                                {watchType === 'target_date' && watch('target_date') && (
                                                    <span>
                            {' '}by <span className="font-semibold">
                              {new Date(watch('target_date') || '').toLocaleDateString()}
                            </span>
                          </span>
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || availableCategories.length === 0}
                                            className="flex-1 btn-primary"
                                        >
                                            {isSubmitting ? 'Saving...' : isEditing ? 'Update Goal' : 'Create Goal'}
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

export default GoalModal;