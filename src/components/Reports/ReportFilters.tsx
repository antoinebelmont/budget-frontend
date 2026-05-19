import React from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../store';
import { setFilters, clearFilters } from '../../store/slices/reportsSlice';
import DateRangePicker from './DateRangePicker';

interface ReportFiltersProps {
    showAccountFilter?: boolean;
    showCategoryFilter?: boolean;
    showCategoryGroupFilter?: boolean;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
                                                         showAccountFilter = true,
                                                         showCategoryFilter = true,
                                                         showCategoryGroupFilter = false,
                                                     }) => {
    const dispatch = useAppDispatch();
    const filters = useAppSelector((state) => state.reports.filters);
    const { items: accounts } = useAppSelector((state) => state.accounts);
    const { items: categories } = useAppSelector((state) => state.categories);
    const { categoryGroups } = useAppSelector((state) => state.budget);

    const handleFilterChange = (key: string, value: any) => {
        dispatch(setFilters({ [key]: value || undefined }));
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
    };

    const activeFiltersCount = Object.entries(filters).filter(
        ([key, value]) => key !== 'date_range' && value !== undefined
    ).length;

    return (
        <div className="card p-4 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-5 w-5 text-[var(--text-muted)]" />
                    <h3 className="font-semibold text-[var(--text-primary)]">Filters</h3>
                    {activeFiltersCount > 0 && (
                        <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
                    )}
                </div>
                {activeFiltersCount > 0 && (
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                    >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Clear
                    </button>
                )}
            </div>

            <DateRangePicker />

            {(showAccountFilter || showCategoryFilter || showCategoryGroupFilter) && (
                <div className="pt-3 border-t border-[var(--border-default)] space-y-3">
                    {showAccountFilter && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Account</label>
                            <select
                                value={filters.account_id || ''}
                                onChange={(e) => handleFilterChange('account_id', e.target.value ? Number(e.target.value) : undefined)}
                                className="input"
                            >
                                <option value="">All Accounts</option>
                                {accounts.filter(a => !a.closed).map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {showCategoryGroupFilter && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category Group</label>
                            <select
                                value={filters.category_group_id || ''}
                                onChange={(e) => handleFilterChange('category_group_id', e.target.value ? Number(e.target.value) : undefined)}
                                className="input"
                            >
                                <option value="">All Groups</option>
                                {categoryGroups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {showCategoryFilter && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
                            <select
                                value={filters.category_id || ''}
                                onChange={(e) => handleFilterChange('category_id', e.target.value ? Number(e.target.value) : undefined)}
                                className="input"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportFilters;