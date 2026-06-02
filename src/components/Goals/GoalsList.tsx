import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchGoals, deleteGoal } from '../../store/slices/goalsSlice';
import { fetchBudget } from '../../store/slices/budgetSlice';
import { Goal } from '../../types/apiTypes';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import GoalCard from './GoalCard';
import GoalModal from './GoalModal';
import FundGoalModal from './FundGoalModal';
import GoalTemplatesModal from './GoalTemplatesModal';
import toast from 'react-hot-toast';

const GoalsList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items: goals, loading } = useAppSelector((state) => state.goals);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
    const [isFundModalOpen, setIsFundModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [fundingGoal, setFundingGoal] = useState<Goal | null>(null);
    const [filterType, setFilterType] = useState<'all' | Goal['type']>('all');
    const [sortBy, setSortBy] = useState<'progress' | 'amount' | 'date'>('progress');

    useEffect(() => {
        dispatch(fetchGoals());
    }, [dispatch]);

    const handleDelete = async (goal: Goal) => {
        if (window.confirm(`Are you sure you want to delete "${goal.category?.name}" goal?`)) {
            try {
                await dispatch(deleteGoal(goal.id)).unwrap();
                await dispatch(fetchBudget());
                toast.success('Goal deleted successfully');
            } catch (error) {
                toast.error('Failed to delete goal');
            }
        }
    };

    const handleEdit = (goal: Goal) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    const handleFund = (goal: Goal) => {
        setFundingGoal(goal);
        setIsFundModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGoal(null);
    };

    const handleCloseFundModal = () => {
        setIsFundModalOpen(false);
        setFundingGoal(null);
    };

    // Filter goals
    const filteredGoals = goals.filter((goal) => {
        if (filterType === 'all') return true;
        return goal.type === filterType;
    });

    // Sort goals
    const sortedGoals = [...filteredGoals].sort((a, b) => {
        switch (sortBy) {
            case 'progress':
                return (b.progress_percentage || 0) - (a.progress_percentage || 0);
            case 'amount':
                return (b.target_amount || 0) - (a.target_amount || 0);
            case 'date':
                if (!a.target_date) return 1;
                if (!b.target_date) return -1;
                return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
            default:
                return 0;
        }
    });

    // Calculate stats
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => (g.progress_percentage || 0) >= 100).length;
    const totalTargetAmount = goals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0);
    const totalCurrentAmount = goals.reduce((sum, g) => sum + (g.current || 0), 0);
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        {completedGoals} of {totalGoals} goals completed ({overallProgress.toFixed(0)}% overall)
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsTemplatesModalOpen(true)}
                        className="btn-secondary flex items-center"
                    >
                        <span className="mr-2">📋</span>
                        Templates
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Goal
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="text-sm text-gray-600">Total Goals</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{totalGoals}</div>
                </div>
                <div className="card p-4">
                    <div className="text-sm text-gray-600">Completed</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">{completedGoals}</div>
                </div>
                <div className="card p-4">
                    <div className="text-sm text-gray-600">Total Target</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        ${totalTargetAmount.toLocaleString()}
                    </div>
                </div>
                <div className="card p-4">
                    <div className="text-sm text-gray-600">Total Saved</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                        ${totalCurrentAmount.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Filters & Sort */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="input py-1 text-sm"
                        >
                            <option value="all">All Types</option>
                            <option value="target_balance">Target Balance</option>
                            <option value="target_date">Target Date</option>
                            <option value="monthly_funding">Monthly Funding</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="input py-1 text-sm"
                        >
                            <option value="progress">Progress</option>
                            <option value="amount">Amount</option>
                            <option value="date">Target Date</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Goals Grid */}
            {sortedGoals.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="text-gray-500">
                        <span className="text-6xl mb-4 block">🎯</span>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h3>
                        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                            Start by creating your first savings goal or choose from our templates
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setIsTemplatesModalOpen(true)}
                                className="btn-secondary"
                            >
                                Browse Templates
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="btn-primary"
                            >
                                Create Custom Goal
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sortedGoals.map((goal) => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onFund={handleFund}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {isModalOpen && (
                <GoalModal goal={editingGoal} onClose={handleCloseModal} />
            )}

            {isTemplatesModalOpen && (
                <GoalTemplatesModal onClose={() => setIsTemplatesModalOpen(false)} />
            )}

            {isFundModalOpen && fundingGoal && (
                <FundGoalModal goal={fundingGoal} onClose={handleCloseFundModal} />
            )}
        </div>
    );
};

export default GoalsList;