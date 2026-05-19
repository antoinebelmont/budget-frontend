
// ============================================
// 3. UTILITY FUNCTIONS
// ============================================

// src/utils/goalHelpers.ts
import { Goal } from '@/types/apiTypes';

export const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return '#10b981'; // green
    if (percentage >= 75) return '#3b82f6'; // blue
    if (percentage >= 50) return '#f59e0b'; // yellow
    if (percentage >= 25) return '#f97316'; // orange
    return '#ef4444'; // red
};

export const getMilestoneIcon = (percentage: number): string => {
    if (percentage >= 100) return '🎉';
    if (percentage >= 75) return '💪';
    if (percentage >= 50) return '🚀';
    if (percentage >= 25) return '🎯';
    return '🌱';
};

export const getMilestoneName = (percentage: number): string => {
    if (percentage >= 100) return 'Goal Achieved!';
    if (percentage >= 75) return 'Almost There!';
    if (percentage >= 50) return 'Halfway Point!';
    if (percentage >= 25) return 'Great Start!';
    return 'Getting Started';
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const getGoalTypeLabel = (type: Goal['type']): string => {
    switch (type) {
        case 'target_balance': return 'Target Balance';
        case 'target_date': return 'Target Date';
        case 'monthly_funding': return 'Monthly Funding';
        default: return type;
    }
};

export const calculateMonthsRemaining = (targetDate: string | undefined): number | null => {
    if (!targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return Math.max(0, diffMonths);
};

export const shouldShowMilestone = (
    previousProgress: number,
    currentProgress: number,
    milestone: number
): boolean => {
    return previousProgress < milestone && currentProgress >= milestone;
};