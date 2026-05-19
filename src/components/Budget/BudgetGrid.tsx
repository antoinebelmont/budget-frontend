// src/components/Budget/BudgetGrid.tsx - Updated calculation helpers
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchBudget, updateCategoryBudget, setCurrentMonth } from '../../store/slices/budgetSlice';
import { deleteCategory } from '../../store/slices/categoriesSlice';
import { Category } from '../../types/apiTypes';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format, addMonths, subMonths } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import CategoryModal from './CategoryModal';

const BudgetGrid: React.FC = () => {
    const dispatch = useAppDispatch();
    const { categoryGroups, currentMonth, loading } = useAppSelector((state) => state.budget);
    const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
    const [editingCategory, setEditingCategory] = useState<number | null>(null);
    const [budgetValue, setBudgetValue] = useState<string>('');
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchBudget(currentMonth));
    }, [dispatch, currentMonth]);

    useEffect(() => {
        setExpandedGroups(categoryGroups.map(g => g.id));
    }, [categoryGroups]);

    const toggleGroup = (groupId: number) => {
        setExpandedGroups(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    const handleBudgetChange = async (category: Category) => {
        if (budgetValue === '') return;

        try {
            await dispatch(updateCategoryBudget({
                categoryId: category.id,
                budgeted: parseFloat(budgetValue),
            })).unwrap();

            toast.success(`Budget updated for ${category.name}`);
            setEditingCategory(null);
            setBudgetValue('');
        } catch (error) {
            toast.error('Failed to update budget');
        }
    };

    const handleAddCategory = (groupId: number) => {
        setSelectedGroupId(groupId);
        setSelectedCategory(null);
        setIsCategoryModalOpen(true);
    };

    const handleEditCategory = (category: Category, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedCategory(category);
        setSelectedGroupId(category.category_group_id);
        setIsCategoryModalOpen(true);
    };

    const handleDeleteCategory = async (category: Category, e: React.MouseEvent) => {
        e.stopPropagation();

        if (window.confirm(`Are you sure you want to delete "${category.name}"? This cannot be undone.`)) {
            try {
                await dispatch(deleteCategory(category.id)).unwrap();
                toast.success('Category deleted successfully');
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete category');
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getAvailableColor = (available: number) => {
        if (available < 0) return 'text-danger-600';
        if (available === 0) return 'text-[var(--text-secondary)]';
        return 'text-success-600';
    };

    // ✅ Safe calculation helpers that handle undefined/null values
    const safeSum = (categories: Category[], field: keyof Pick<Category, 'budgeted' | 'transactions_sum' | 'monthly_available'>) => {
        const result: number = categories.reduce((sum, cat) => {
            const value = cat[field];
            return sum + (!isNaN(value) ? +value : 0);
        }, 0);
        console.log(field,result)
        return result;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => dispatch(setCurrentMonth(format(subMonths(new Date(currentMonth + '-02'), 1), 'yyyy-MM')))}
                        className="btn-secondary"
                    >
                        ← Previous
                    </button>

                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        {format(new Date(currentMonth + '-02'), 'MMMM yyyy')}
                    </h2>

                    <button
                        onClick={() => dispatch(setCurrentMonth(format(addMonths(new Date(currentMonth + '-02'), 1), 'yyyy-MM')))}
                        className="btn-secondary"
                    >
                        Next →
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden">
<table className="min-w-full divide-y divide-[var(--border-default)]">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Category</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Budgeted</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Activity</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Available</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-[var(--bg-surface)] divide-y divide-[var(--border-default)]">
                    {categoryGroups.map((group) => (
                        <React.Fragment key={group.id}>
                            <tr className="bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => toggleGroup(group.id)}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            {expandedGroups.includes(group.id) ? (
                                                <ChevronUpIcon className="h-5 w-5 text-[var(--text-muted)] mr-2" />
                                            ) : (
                                                <ChevronDownIcon className="h-5 w-5 text-[var(--text-muted)] mr-2" />
                                            )}
                                            <span className="font-semibold text-[var(--text-primary)]">{group.name}</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddCategory(group.id);
                                            }}
                                            className="ml-4 p-1 text-[var(--text-muted)] hover:text-primary-600"
                                            title="Add category"
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-semibold">
                                    {formatCurrency(safeSum(group.categories, 'budgeted'))}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold">
                                    {formatCurrency(safeSum(group.categories, 'transactions_sum'))}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold">
                                    {formatCurrency(safeSum(group.categories, 'monthly_available'))}
                                </td>
                                <td className="px-6 py-4"></td>
                            </tr>

                            {expandedGroups.includes(group.id) && group.categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4">
                                        <div className="pl-8 flex items-center">
                                            {category.color && (
                                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                                            )}
                                            <span className="text-sm text-[var(--text-primary)]">{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingCategory === category.id ? (
                                            <input
                                                type="number"
                                                value={budgetValue}
                                                onChange={(e) => setBudgetValue(e.target.value)}
                                                onBlur={() => handleBudgetChange(category)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') handleBudgetChange(category);
                                                    if (e.key === 'Escape') {
                                                        setEditingCategory(null);
                                                        setBudgetValue('');
                                                    }
                                                }}
                                                className="w-32 text-right input py-1"
                                                autoFocus
                                            />
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingCategory(category.id);
                                                    setBudgetValue(category.budgeted.toString());
                                                }}
                                                className="text-sm text-primary-600 hover:text-primary-700"
                                            >
                                                {formatCurrency(category.budgeted || 0)}
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm">
                                        {formatCurrency(category.transactions_sum || 0)}
                                    </td>
                                    <td className={clsx('px-6 py-4 text-right text-sm font-medium', getAvailableColor(category.monthly_available || 0))}>
                                        {formatCurrency(category.monthly_available || 0)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={(e) => handleEditCategory(category, e)}
                                                className="p-1 text-[var(--text-muted)] hover:text-primary-600"
                                                title="Edit category"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteCategory(category, e)}
                                                className="p-1 text-[var(--text-muted)] hover:text-danger-600"
                                                title="Delete category"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
            </div>

            {isCategoryModalOpen && selectedGroupId && (
                <CategoryModal
                    category={selectedCategory}
                    categoryGroupId={selectedGroupId}
                    onClose={() => {
                        setIsCategoryModalOpen(false);
                        setSelectedCategory(null);
                        setSelectedGroupId(null);
                    }}
                />
            )}
        </div>
    );
};

export default BudgetGrid;