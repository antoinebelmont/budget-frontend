export interface GoalTemplate {
    id: string;
    name: string;
    emoji: string;
    description: string;
    type: 'target_balance' | 'target_date' | 'monthly_funding';
    suggestedAmount: number;
    suggestedMonths?: number;
    color: string;
    categoryName: string;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
    {
        id: 'emergency',
        name: 'Emergency Fund',
        emoji: '🏥',
        description: '3-6 months of expenses for unexpected situations',
        type: 'target_balance',
        suggestedAmount: 5000,
        color: '#ef4444',
        categoryName: 'Emergency Fund',
    },
    {
        id: 'vacation',
        name: 'Vacation',
        emoji: '✈️',
        description: 'Save for your dream getaway',
        type: 'target_date',
        suggestedAmount: 3000,
        suggestedMonths: 6,
        color: '#3b82f6',
        categoryName: 'Vacation Savings',
    },
    {
        id: 'car',
        name: 'New Car',
        emoji: '🚗',
        description: 'Down payment or full purchase',
        type: 'target_balance',
        suggestedAmount: 10000,
        color: '#10b981',
        categoryName: 'Car Savings',
    },
    {
        id: 'house',
        name: 'House Down Payment',
        emoji: '🏠',
        description: 'Save for your future home',
        type: 'target_balance',
        suggestedAmount: 20000,
        color: '#f59e0b',
        categoryName: 'House Savings',
    },
    {
        id: 'education',
        name: 'Education Fund',
        emoji: '🎓',
        description: 'Invest in learning and growth',
        type: 'monthly_funding',
        suggestedAmount: 500,
        color: '#8b5cf6',
        categoryName: 'Education',
    },
    {
        id: 'wedding',
        name: 'Wedding',
        emoji: '💍',
        description: 'Your special day savings',
        type: 'target_date',
        suggestedAmount: 15000,
        suggestedMonths: 12,
        color: '#ec4899',
        categoryName: 'Wedding Fund',
    },
    {
        id: 'retirement',
        name: 'Retirement',
        emoji: '🌴',
        description: 'Long-term retirement savings',
        type: 'monthly_funding',
        suggestedAmount: 1000,
        color: '#06b6d4',
        categoryName: 'Retirement',
    },
    {
        id: 'gifts',
        name: 'Holiday Gifts',
        emoji: '🎁',
        description: 'Budget for special occasions',
        type: 'target_date',
        suggestedAmount: 1000,
        suggestedMonths: 3,
        color: '#f43f5e',
        categoryName: 'Gift Fund',
    },
    {
        id: 'business',
        name: 'Start a Business',
        emoji: '💼',
        description: 'Capital for your entrepreneurial dreams',
        type: 'target_balance',
        suggestedAmount: 25000,
        color: '#6366f1',
        categoryName: 'Business Fund',
    },
    {
        id: 'tech',
        name: 'New Tech/Gadget',
        emoji: '💻',
        description: 'Latest technology upgrade',
        type: 'target_balance',
        suggestedAmount: 2000,
        color: '#14b8a6',
        categoryName: 'Tech Savings',
    },
];
