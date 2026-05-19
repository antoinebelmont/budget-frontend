import React from 'react';
import { Goal } from '../../types/apiTypes';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCurrency, getMilestoneIcon, getGoalTypeLabel } from '../../utils/goalHelpers';
import {GoalProgressBar} from './GoalProgressBar';

interface GoalCardProps {
    goal: Goal;
    onEdit: (goal: Goal) => void;
    onDelete: (goal: Goal) => void;
    onFund: (goal: Goal) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onFund }) => {
    const progress = goal.progress_percentage || 0;
    const isCompleted = progress >= 100;

    return (
        <div className="card p-6 hover:shadow-lg transition-all relative overflow-hidden">
            {/* Achievement Badge */}
            {isCompleted && (
                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
                    ✓ Completed!
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getMilestoneIcon(progress)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {goal.category?.name || 'Unnamed Goal'}
                        </h3>
                    </div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {getGoalTypeLabel(goal.type)}
          </span>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(goal)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Edit goal"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(goal)}
                        className="p-1.5 text-gray-400 hover:text-danger-600 transition-colors"
                        title="Delete goal"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            {goal.target_amount && (
                <>
                    <GoalProgressBar progress={progress} />

                    {/* Amounts */}
                    <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                        <div>
                            <p className="text-xs text-gray-600">Current</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(goal.current || 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Target</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(goal.target_amount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Remaining</p>
                            <p className="text-lg font-semibold text-orange-600">
                                {formatCurrency(goal.remaining_amount || 0)}
                            </p>
                        </div>
                        {goal.target_date && (
                            <div>
                                <p className="text-xs text-gray-600">Target Date</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {new Date(goal.target_date).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Suggested Monthly */}
                    {goal.suggested_monthly_amount && goal.suggested_monthly_amount > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-blue-600">💡</span>
                                <div>
                                    <p className="text-xs text-blue-800 font-medium">Suggested Monthly</p>
                                    <p className="text-sm font-semibold text-blue-900">
                                        {formatCurrency(goal.suggested_monthly_amount)}/month
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Monthly Funding Type */}
            {goal.type === 'monthly_funding' && goal.monthly_amount && (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-1">Monthly Amount</p>
                    <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(goal.monthly_amount)}
                    </p>
                </div>
            )}

            {/* Fund Button */}
            {!isCompleted && (
                <button
                    onClick={() => onFund(goal)}
                    className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
                >
                    <span>💰</span>
                    Fund This Goal
                </button>
            )}

            {/* Completed Message */}
            {isCompleted && (
                <div className="text-center py-3 bg-green-50 rounded-lg mt-4">
                    <p className="text-sm font-semibold text-green-800">
                        🎉 Goal achieved! Great job!
                    </p>
                </div>
            )}
        </div>
    );
};

export default GoalCard;