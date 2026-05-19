import React from 'react';
import { getProgressColor, getMilestoneName } from '../../utils/goalHelpers';

interface GoalProgressBarProps {
    progress: number;
    height?: number;
    showLabel?: boolean;
    animated?: boolean;
}

export const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
                                                             progress,
                                                             height = 8,
                                                             showLabel = true,
                                                             animated = true
                                                         }) => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const color = getProgressColor(clampedProgress);

    return (
        <div className="space-y-2">
            {showLabel && (
                <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">
                    {getMilestoneName(clampedProgress)}
                    </span>
                    <span className="font-bold text-gray-900">
        {clampedProgress.toFixed(1)}%
        </span>
        </div>
)}

    <div
        className="w-full bg-gray-200 rounded-full overflow-hidden shadow-inner"
    style={{ height: `${height}px` }}
>
    <div
        className={`h-full rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''}`}
    style={{
        width: `${clampedProgress}%`,
            backgroundColor: color,
            boxShadow: clampedProgress > 0 ? `0 0 8px ${color}40` : 'none'
    }}
    />
    </div>

    {/* Milestone Markers (optional, visible on hover) */}
    {clampedProgress < 100 && (
        <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span className={clampedProgress >= 25 ? 'text-green-600 font-medium' : ''}>
        {clampedProgress >= 25 ? '✓' : '○'} 25%
    </span>
    <span className={clampedProgress >= 50 ? 'text-green-600 font-medium' : ''}>
        {clampedProgress >= 50 ? '✓' : '○'} 50%
    </span>
    <span className={clampedProgress >= 75 ? 'text-green-600 font-medium' : ''}>
        {clampedProgress >= 75 ? '✓' : '○'} 75%
    </span>
    <span className={clampedProgress >= 100 ? 'text-green-600 font-medium' : ''}>
        {clampedProgress >= 100 ? '✓' : '○'} 100%
    </span>
    </div>
    )}
    </div>
);
};

