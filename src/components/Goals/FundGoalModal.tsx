import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store';
import { fundGoal, fetchGoals } from '../../store/slices/goalsSlice'; // ← ADD fetchGoals
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { fetchBudget } from '../../store/slices/budgetSlice';
import { Goal } from '../../types/api';
import { formatCurrency } from '../../utils/goalHelpers';
import toast from 'react-hot-toast';

interface FundGoalModalProps {
    goal: Goal;
    onClose: () => void;
}

interface FundForm {
    amount: number;
    accountId: number;
    date: string;
    goalId: number;
}

const schema = yup.object({
    amount: yup.number().required('Amount is required').min(0.01, 'Amount must be greater than 0'),
    accountId: yup.number().required('Account is required'),
    date: yup.string().required('Date is required'),
});

const FundGoalModal: React.FC<FundGoalModalProps> = ({ goal, onClose }) => {
    const dispatch = useAppDispatch();
    const { items: accounts } = useAppSelector((state) => state.accounts);

    useEffect(() => {
        dispatch(fetchAccounts());
    }, [dispatch]);

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FundForm>({
        resolver: yupResolver(schema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            amount: goal.remaining_amount || 0,
        },
    });

    const watchAmount = watch('amount');
    const currentAmount = goal.category?.available || 0;
    const targetAmount = goal.target_amount || 0;
    const newTotal = currentAmount + (watchAmount || 0);
    const newProgress = targetAmount > 0 ? (newTotal / targetAmount) * 100 : 0;

    const onSubmit = async (data: FundForm) => {
        try {
            const previousProgress = goal.progress_percentage || 0;

            // Create the transaction (fund goal)
            await dispatch(fundGoal({
                goalId: goal.id,
                amount: data.amount,
                accountId: data.accountId,
                date: data.date,
            })).unwrap();

            // ✅ FIX: Refresh both budget AND goals data
            await Promise.all([
                dispatch(fetchBudget()),
                dispatch(fetchGoals()), // ← This was missing!
            ]);

            toast.success(`Successfully added ${formatCurrency(data.amount)} to your goal! 🎉`);

            // Check for milestone achievements
            if (newProgress >= 100 && previousProgress < 100) {
                setTimeout(() => toast.success('🎉 Goal Achieved! Congratulations!'), 500);
            } else if (newProgress >= 75 && previousProgress < 75) {
                setTimeout(() => toast.success('💪 75% Complete! Almost there!'), 500);
            } else if (newProgress >= 50 && previousProgress < 50) {
                setTimeout(() => toast.success('🚀 Halfway there! Keep it up!'), 500);
            } else if (newProgress >= 25 && previousProgress < 25) {
                setTimeout(() => toast.success('🎯 25% Complete! Great start!'), 500);
            }

            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to fund goal');
        }
    };

    const handleQuickAmount = (amount: number) => {
        setValue('amount', amount);
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
                                        💰 Fund Goal
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Goal Info */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
                                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                                        {goal.category?.name}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div>
                                            <p className="text-xs text-gray-600">Current</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(currentAmount)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Target</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(targetAmount)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Remaining</p>
                                            <p className="text-sm font-semibold text-orange-600">
                                                {formatCurrency(goal.remaining_amount || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount to Add <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                                            <input
                                                {...register('amount')}
                                                type="number"
                                                step="0.01"
                                                className="input pl-8 text-lg font-semibold"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {errors.amount && (
                                            <p className="mt-1 text-sm text-danger-600">{errors.amount.message}</p>
                                        )}

                                        {/* Quick Amount Buttons */}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {goal.suggested_monthly_amount && goal.suggested_monthly_amount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuickAmount(goal.suggested_monthly_amount!)}
                                                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1.5 rounded-full font-medium"
                                                >
                                                    Suggested: {formatCurrency(goal.suggested_monthly_amount)}
                                                </button>
                                            )}
                                            {goal.remaining_amount && goal.remaining_amount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuickAmount(goal.remaining_amount!)}
                                                    className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1.5 rounded-full font-medium"
                                                >
                                                    Full Amount: {formatCurrency(goal.remaining_amount)}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleQuickAmount(100)}
                                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full"
                                            >
                                                $100
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQuickAmount(50)}
                                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full"
                                            >
                                                $50
                                            </button>
                                        </div>
                                    </div>

                                    {/* Account */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            From Account <span className="text-red-500">*</span>
                                        </label>
                                        <select {...register('accountId')} className="input">
                                            <option value="">Select account...</option>
                                            {accounts.filter(a => !a.closed).map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.name} ({formatCurrency(account.balance)})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.accountId && (
                                            <p className="mt-1 text-sm text-danger-600">{errors.accountId.message}</p>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('date')}
                                            type="date"
                                            className="input"
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.date && (
                                            <p className="mt-1 text-sm text-danger-600">{errors.date.message}</p>
                                        )}
                                    </div>

                                    {/* Preview */}
                                    {watchAmount > 0 && (
                                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                            <p className="text-xs font-medium text-purple-800 mb-2">📊 After This Contribution</p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-purple-900">New Total:</span>
                                                    <span className="font-semibold text-purple-900">
                            {formatCurrency(newTotal)}
                          </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-purple-900">Progress:</span>
                                                    <span className="font-semibold text-purple-900">
                            {newProgress.toFixed(1)}%
                          </span>
                                                </div>
                                                {newProgress >= 100 && (
                                                    <div className="mt-2 bg-green-100 border border-green-300 rounded p-2">
                                                        <p className="text-xs text-green-800 font-semibold text-center">
                                                            🎉 This will complete your goal!
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary">
                                            {isSubmitting ? 'Adding Funds...' : 'Add Funds'}
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

export default FundGoalModal;