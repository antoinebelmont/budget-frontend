import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAppDispatch } from '../../store';
import { createGoal } from '../../store/slices/goalsSlice';
import { createCategory } from '../../store/slices/categoriesSlice';
import { fetchBudget } from '../../store/slices/budgetSlice';
import { GOAL_TEMPLATES, GoalTemplate } from '../../constants/goalTemplates';
import { addMonths } from 'date-fns';
import toast from 'react-hot-toast';

interface GoalTemplatesModalProps {
    onClose: () => void;
}

const GoalTemplatesModal: React.FC<GoalTemplatesModalProps> = ({ onClose }) => {
    const dispatch = useAppDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [customMonths, setCustomMonths] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);

    const filteredTemplates = GOAL_TEMPLATES.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectTemplate = (template: GoalTemplate) => {
        setSelectedTemplate(template);
        setCustomAmount(template.suggestedAmount.toString());
        setCustomMonths(template.suggestedMonths?.toString() || '6');
    };

    const handleCreateFromTemplate = async () => {
        if (!selectedTemplate) return;

        setIsCreating(true);
        try {
            // First, create the category
            const categoryResponse = await dispatch(createCategory({
                name: selectedTemplate.categoryName,
                category_group_id: 1, // You might want to make this dynamic
                budgeted: 0,
                color: selectedTemplate.color,
            })).unwrap();

            // Then create the goal
            const goalData: any = {
                category_id: categoryResponse.category.id,
                type: selectedTemplate.type,
            };

            if (selectedTemplate.type === 'monthly_funding') {
                goalData.monthly_amount = parseFloat(customAmount);
            } else {
                goalData.target_amount = parseFloat(customAmount);
                if (selectedTemplate.type === 'target_date') {
                    const months = parseInt(customMonths);
                    goalData.target_date = addMonths(new Date(), months).toISOString().split('T')[0];
                }
            }

            await dispatch(createGoal(goalData)).unwrap();
            await dispatch(fetchBudget());

            toast.success(`${selectedTemplate.emoji} ${selectedTemplate.name} goal created!`);
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create goal from template');
        } finally {
            setIsCreating(false);
        }
    };

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
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                                {!selectedTemplate ? (
                                    // Template Selection View
                                    <>
                                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                            <div>
                                                <Dialog.Title className="text-xl font-semibold text-gray-900">
                                                    📋 Goal Templates
                                                </Dialog.Title>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Choose a template to get started quickly
                                                </p>
                                            </div>
                                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>

                                        {/* Search */}
                                        <div className="p-6 border-b border-gray-200">
                                            <div className="relative">
                                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search templates..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="input pl-10"
                                                />
                                            </div>
                                        </div>

                                        {/* Templates Grid */}
                                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {filteredTemplates.map((template) => (
                                                    <button
                                                        key={template.id}
                                                        onClick={() => handleSelectTemplate(template)}
                                                        className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <span className="text-3xl">{template.emoji}</span>
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: template.color }}
                                                            />
                                                        </div>
                                                        <h3 className="font-semibold text-gray-900 mb-1">
                                                            {template.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-600 mb-3">
                                                            {template.description}
                                                        </p>
                                                        <div className="flex items-center justify-between text-xs">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {template.type.replace('_', ' ')}
                              </span>
                                                            <span className="font-semibold text-gray-900">
                                ${template.suggestedAmount.toLocaleString()}
                              </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            {filteredTemplates.length === 0 && (
                                                <div className="text-center py-12">
                                                    <p className="text-gray-500">No templates found matching "{searchTerm}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    // Customize Template View
                                    <>
                                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setSelectedTemplate(null)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    ← Back
                                                </button>
                                                <div>
                                                    <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                                        <span className="text-2xl">{selectedTemplate.emoji}</span>
                                                        {selectedTemplate.name}
                                                    </Dialog.Title>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {selectedTemplate.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {/* Customize Amount */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {selectedTemplate.type === 'monthly_funding' ? 'Monthly Amount' : 'Target Amount'}
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                                                    <input
                                                        type="number"
                                                        value={customAmount}
                                                        onChange={(e) => setCustomAmount(e.target.value)}
                                                        className="input pl-8 text-lg font-semibold"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Suggested: ${selectedTemplate.suggestedAmount.toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Customize Timeline (for target_date) */}
                                            {selectedTemplate.type === 'target_date' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Timeline (months)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={customMonths}
                                                        onChange={(e) => setCustomMonths(e.target.value)}
                                                        className="input"
                                                        min="1"
                                                        max="120"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Target date: {addMonths(new Date(), parseInt(customMonths) || 6).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Preview */}
                                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                                <p className="text-sm font-medium text-gray-900 mb-3">Goal Preview:</p>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Category:</span>
                                                        <span className="font-semibold">{selectedTemplate.categoryName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Type:</span>
                                                        <span className="font-semibold capitalize">
                              {selectedTemplate.type.replace('_', ' ')}
                            </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Amount:</span>
                                                        <span className="font-semibold">
                              ${parseFloat(customAmount || '0').toLocaleString()}
                            </span>
                                                    </div>
                                                    {selectedTemplate.type === 'target_date' && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Target Date:</span>
                                                            <span className="font-semibold">
                                {addMonths(new Date(), parseInt(customMonths) || 6).toLocaleDateString()}
                              </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    onClick={() => setSelectedTemplate(null)}
                                                    className="flex-1 btn-secondary"
                                                >
                                                    Back to Templates
                                                </button>
                                                <button
                                                    onClick={handleCreateFromTemplate}
                                                    disabled={isCreating || !customAmount}
                                                    className="flex-1 btn-primary"
                                                >
                                                    {isCreating ? 'Creating...' : 'Create Goal'}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default GoalTemplatesModal;
