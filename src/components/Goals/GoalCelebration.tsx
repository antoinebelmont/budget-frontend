import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface GoalCelebrationProps {
    show: boolean;
    milestone: number; // 25, 50, 75, 100
    goalName: string;
    onComplete?: () => void;
}

const GoalCelebration: React.FC<GoalCelebrationProps> = ({
                                                             show,
                                                             milestone,
                                                             goalName,
                                                             onComplete
                                                         }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            triggerCelebration(milestone);

            const timer = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, milestone, onComplete]);

    const triggerCelebration = (milestone: number) => {
        const duration = milestone === 100 ? 3000 : 2000;
        const particleCount = milestone === 100 ? 200 : 100;

        // Fire confetti
        const end = Date.now() + duration;

        const colors = milestone === 100
            ? ['#10b981', '#3b82f6', '#f59e0b', '#ec4899']
            : ['#3b82f6', '#6366f1'];

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
            });

            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    const getMessage = () => {
        switch (milestone) {
            case 25:
                return { emoji: '🎯', text: 'Great Start!', subtext: '25% Complete' };
            case 50:
                return { emoji: '🚀', text: 'Halfway There!', subtext: '50% Complete' };
            case 75:
                return { emoji: '💪', text: 'Almost Done!', subtext: '75% Complete' };
            case 100:
                return { emoji: '🎉', text: 'Goal Achieved!', subtext: 'Congratulations!' };
            default:
                return { emoji: '🌟', text: 'Progress!', subtext: 'Keep going!' };
        }
    };

    const message = getMessage();

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="animate-bounce-in bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md pointer-events-auto">
                <div className="text-7xl mb-4 animate-spin-slow">{message.emoji}</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{message.text}</h2>
                <p className="text-xl text-gray-600 mb-4">{message.subtext}</p>
                <p className="text-lg font-semibold text-primary-600">{goalName}</p>
            </div>
        </div>
    );
};

export default GoalCelebration;