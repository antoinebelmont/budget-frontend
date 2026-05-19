import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export type DateRangePreset = 'last30' | 'last60' | 'last90' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom';

export interface DateRangeOption {
    label: string;
    value: DateRangePreset;
    start: Date;
    end: Date;
}

export const getDateRangeOptions = (): DateRangeOption[] => {
    const today = new Date();

    return [
        {
            label: 'Last 30 Days',
            value: 'last30',
            start: subDays(today, 30),
            end: today,
        },
        {
            label: 'Last 60 Days',
            value: 'last60',
            start: subDays(today, 60),
            end: today,
        },
        {
            label: 'Last 90 Days',
            value: 'last90',
            start: subDays(today, 90),
            end: today,
        },
        {
            label: 'This Month',
            value: 'thisMonth',
            start: startOfMonth(today),
            end: endOfMonth(today),
        },
        {
            label: 'Last Month',
            value: 'lastMonth',
            start: startOfMonth(subMonths(today, 1)),
            end: endOfMonth(subMonths(today, 1)),
        },
        {
            label: 'This Year',
            value: 'thisYear',
            start: startOfYear(today),
            end: endOfYear(today),
        },
        {
            label: 'Last Year',
            value: 'lastYear',
            start: startOfYear(subMonths(today, 12)),
            end: endOfYear(subMonths(today, 12)),
        },
    ];
};

export const formatDateForAPI = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
};

export const formatMonthYear = (date: string): string => {
    return format(new Date(date), 'MMM yyyy');
};