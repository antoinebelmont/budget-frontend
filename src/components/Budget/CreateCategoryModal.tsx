import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

// Mock types (in real app, import from your types file)
interface CategoryForm {
    name: string;
    category_group_id: number;
    budgeted: number;
    color?: string;
}

interface CategoryGroup {
    id: number;
    name: string;
}

// Mock category groups for demo
const mockCategoryGroups: CategoryGroup[] = [
    { id: 1, name: 'Monthly Bills' },
    { id: 2, name: 'Everyday Expenses' },
    { id: 3, name: 'Savings Goals' },
    { id: 4, name: 'Quality of Life' },
];

const CreateCategoryModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#3b82f6');

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryForm>({
        defaultValues: {
            budgeted: 0,
            color: '#3b82f6',
        },
    });

    const colorPresets = [
        '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6',
        '#6366f1', '#8b5cf6', '#ec4899', '#6b7280', '#000000'
    ];

    const onSubmit = async (data: CategoryForm) => {
        try {
            // In real app: await dispatch(createCategory({ ...data, color: selectedColor })).unwrap();
            console.log('Creating category:', { ...data, color: selectedColor });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert(`Category "${data.name}" created successfully!`);
            reset();
            setIsOpen(false);
        } catch (error) {
            alert('Failed to create category');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Demo trigger button */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Category
                </button>

                {/* Modal */}
                {isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Create New Category</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                                {/* Category Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register('name', {
                                            required: 'Category name is required',
                                            minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                        })}
                                        type="text"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g., Groceries, Rent, Gas"
                                    />
                                    {errors.name && (
                                        <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Category Group */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Group <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('category_group_id', {
                                            required: 'Please select a category group',
                                            valueAsNumber: true
                                        })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                    >
                                        <option value="">Select a group...</option>
                                        {mockCategoryGroups.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_group_id && (
                                        <p className="mt-1.5 text-sm text-red-600">{errors.category_group_id.message}</p>
                                    )}
                                </div>

                                {/* Initial Budget */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Initial Budget
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            {...register('budgeted', {
                                                valueAsNumber: true,
                                                min: { value: 0, message: 'Budget cannot be negative' }
                                            })}
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.budgeted && (
                                        <p className="mt-1.5 text-sm text-red-600">{errors.budgeted.message}</p>
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
                                    <div className="flex items-center gap-4">
                                        {/* Color Input */}
                                        <div className="relative">
                                            <input
                                                type="color"
                                                value={selectedColor}
                                                onChange={(e) => setSelectedColor(e.target.value)}
                                                className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                                                style={{ colorScheme: 'light' }}
                                            />
                                            <div
                                                className="absolute inset-0 rounded-lg pointer-events-none border-2 border-gray-200"
                                                style={{ backgroundColor: selectedColor }}
                                            />
                                        </div>

                                        {/* Color Presets */}
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-600 mb-2">Quick colors:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {colorPresets.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setSelectedColor(color)}
                                                        className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                                                            selectedColor === color
                                                                ? 'border-gray-900 ring-2 ring-blue-500 ring-offset-1'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                        style={{ backgroundColor: color }}
                                                        title={color}
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
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: selectedColor }}
                    />
                                        <span className="text-sm text-gray-900 font-medium">
                      {register('name').name || 'Category Name'}
                    </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            reset();
                                            setIsOpen(false);
                                        }}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create Category'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Use</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Click "Create Category" to open the modal</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Enter a descriptive name for your category (e.g., "Groceries", "Utilities")</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Select which category group it belongs to</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Set an initial budget amount (optional)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Choose a color to help identify your category visually</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CreateCategoryModal;