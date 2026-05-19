import React, { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../store';
import { setDateRange } from '../../store/slices/reportsSlice';
import { getDateRangeOptions, formatDateForAPI, DateRangePreset } from '../../utils/dateHelpers';
import clsx from 'clsx';

const DateRangePicker: React.FC = () => {
    const dispatch = useAppDispatch();
    const { date_range } = useAppSelector((state) => state.reports.filters);
    const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('last30');
    const [showCustom, setShowCustom] = useState(false);

    const dateOptions = getDateRangeOptions();

    const handlePresetChange = (preset: DateRangePreset) => {
        if (preset === 'custom') {
            setShowCustom(true);
            setSelectedPreset(preset);
            return;
        }

        const option = dateOptions.find(opt => opt.value === preset);
        if (option) {
            setSelectedPreset(preset);
            setShowCustom(false);
            dispatch(setDateRange({
                start_date: formatDateForAPI(option.start),
                end_date: formatDateForAPI(option.end),
            }));
        }
    };

    const handleCustomDateChange = (field: 'start_date' | 'end_date', value: string) => {
        dispatch(setDateRange({
            ...date_range,
            [field]: value,
        }));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-[var(--text-muted)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Date Range</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {dateOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handlePresetChange(option.value)}
                        className={clsx(
                            'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                            selectedPreset === option.value && !showCustom
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                        )}
                    >
                        {option.label}
                    </button>
                ))}
                <button
                    onClick={() => handlePresetChange('custom')}
                    className={clsx(
                        'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                        showCustom
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-[var(--text-secondary)] dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                    )}
                >
                    Custom
                </button>
            </div>

            {showCustom && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Start Date</label>
                        <input
                            type="date"
                            value={date_range.start_date}
                            onChange={(e) => handleCustomDateChange('start_date', e.target.value)}
                            className="input text-sm"
                        />
                    </div>
                    <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">End Date</label>
                        <input
                            type="date"
                            value={date_range.end_date}
                            onChange={(e) => handleCustomDateChange('end_date', e.target.value)}
                            className="input text-sm"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;