// src/components/Budget/CategoryModal.tsx
import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store';
import { createCategory, updateCategory } from '../../store/slices/categoriesSlice';
import { fetchBudget } from '../../store/slices/budgetSlice'; // ADD THIS IMPORT
import { Category, CategoryForm } from '../../types/api';
import toast from 'react-hot-toast';

interface CategoryModalProps {
    category: Category | null;
    categoryGroupId: number;
    onClose: () => void;
}

const schema = yup.object({
    name: yup.string()
        .required('Category name is required')
        .min(2, 'Name must be at least 2 characters'),
    category_group_id: yup.number()
        .required('Category group is required'),
    budgeted: yup.number()
        .min(0, 'Budget cannot be negative')
        .default(0),
    color: yup.string()
        .matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
        .nullable(),
});

const CategoryModal: React.FC<CategoryModalProps> = ({
                                                         category,
                                                         categoryGroupId,
                                                         onClose
                                                     }) => {
    const dispatch = useAppDispatch();
    const { categoryGroups, currentMonth } = useAppSelector((state) => state.budget); // GET currentMonth
    const isEditing = !!category;
    const [selectedColor, setSelectedColor] = useState(category?.color || '#3b82f6');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<CategoryForm>({
        resolver: yupResolver(schema),
        defaultValues: category ? {
            name: category.name,
            category_group_id: category.category_group_id,
            budgeted: category.budgeted,
            color: category.color || undefined,
        } : {
            category_group_id: categoryGroupId,
            budgeted: 0,
            color: '#3b82f6',
        },
    });

    const watchName = watch('name', '');

    const onSubmit = async (data: CategoryForm) => {
        try {
            const categoryData = { ...data, color: selectedColor };

            if (isEditing) {
                await dispatch(updateCategory({
                    id: category.id,
                    ...categoryData
                })).unwrap();
                toast.success('Category updated successfully');
            } else {
                await dispatch(createCategory(categoryData)).unwrap();
                toast.success('Category created successfully');
            }

            // ✅ REFRESH THE BUDGET DATA TO SHOW NEW CATEGORY
            await dispatch(fetchBudget(currentMonth));

            onClose();
        } catch (error: any) {
            toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
        }
    };

    const colorPresets = [
        '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6',
        '#6366f1', '#8b5cf6', '#ec4899', '#6b7280', '#000000'
    ];

    return (
        <Transition appear show as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[var(--bg-surface)] p-6 shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title className="text-xl font-semibold text-[var(--text-primary)]">
                                        {isEditing ? 'Edit Category' : 'Create New Category'}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    {/* Category Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('name')}
                                            type="text"
                                            className="input"
                                            placeholder="e.g., Groceries, Rent, Gas"
                                        />
                                        {errors.name && (
                                            <p className="mt-1.5 text-sm text-danger-600">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Category Group */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category Group <span className="text-red-500">*</span>
                                        </label>
                                        <select {...register('category_group_id')} className="input">
                                            <option value="">Select a group...</option>
                                            {categoryGroups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_group_id && (
                                            <p className="mt-1.5 text-sm text-danger-600">
                                                {errors.category_group_id.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Initial Budget */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Initial Budget
                                        </label>
                                        <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                                            <input
                                                {...register('budgeted')}
                                                type="number"
                                                step="0.01"
                                                className="input pl-6!"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {errors.budgeted && (
                                            <p className="mt-1.5 text-sm text-danger-600">
                                                {errors.budgeted.message}
                                            </p>
                                        )}
                                        <p className="mt-1.5 text-xs text-gray-500">
                                            You can adjust this amount later in your budget
                                        </p>
                                    </div>

                                    {/* Color Picker */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Category Color (Optional)
                                        </label>
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <input
                                                    type="color"
                                                    value={selectedColor}
                                                    onChange={(e) => setSelectedColor(e.target.value)}
                                                    className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-600 mb-2">Quick colors:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {colorPresets.map((color) => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            onClick={() => setSelectedColor(color)}
                                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                                                selectedColor === color
                                                                    ? 'border-gray-900 ring-2 ring-blue-500'
                                                                    : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs font-medium text-gray-600 mb-2">Preview:</p>
                                        <div className="flex items-center gap-2">
                      <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: selectedColor }}
                      />
                                            <span className="text-sm text-gray-900 font-medium">
                        {watchName || 'Category Name'}
                      </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 btn-primary"
                                        >
                                            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default CategoryModal;