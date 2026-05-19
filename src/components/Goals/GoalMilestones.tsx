import React from 'react';
import { Goal } from '../../types/apiTypes';
import { formatCurrency, getMilestoneIcon } from '../../utils/goalHelpers';
import { format } from 'date-fns';

interface GoalMilestonesProps {
    goal: Goal;
}

const GoalMilestones: React.FC<GoalMilestonesProps> = ({ goal }) => {
    const progress = goal.progress_percentage || 0;

    const milestones = [
        { value: 25, achieved: progress >= 25, label: 'First Quarter' },
        { value: 50, achieved: progress >= 50, label: 'Halfway Point' },
        { value: 75, achieved: progress >= 75, label: 'Final Stretch' },
        { value: 100, achieved: progress >= 100, label: 'Goal Complete' },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>

            {/* Timeline */}
            <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-6">
                    {milestones.map((milestone) => (
                        <div key={milestone.value} className="relative flex items-start gap-4 pl-12">
                            {/* Circle indicator */}
                            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                milestone.achieved
                                    ? 'bg-green-100 border-green-500 text-green-600'
                                    : 'bg-gray-100 border-gray-300 text-gray-400'
                            }`}>
                                {milestone.achieved ? '✓' : milestone.value}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className={`font-medium ${milestone.achieved ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {milestone.label} ({milestone.value}%)
                                    </h4>
                                    {milestone.achieved && (
                                        <span className="text-2xl">{getMilestoneIcon(milestone.value)}</span>
                                    )}
                                </div>
                                {milestone.achieved && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatCurrency((goal.target_amount || 0) * (milestone.value / 100))} reached
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Activity Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-semibold text-gray-900">
                            {format(new Date(goal.created_at), 'MMM dd, yyyy')}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600">Last Updated</p>
                        <p className="font-semibold text-gray-900">
                            {format(new Date(goal.updated_at), 'MMM dd, yyyy')}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600">Current Progress</p>
                        <p className="font-semibold text-gray-900">{progress.toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Amount Saved</p>
                        <p className="font-semibold text-gray-900">
                            {formatCurrency(goal.category?.available || 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalMilestones;