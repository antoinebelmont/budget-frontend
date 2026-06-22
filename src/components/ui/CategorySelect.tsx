import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { fetchBudget } from '../../store/slices/budgetSlice';
import { createCategory } from '../../store/slices/categoriesSlice';
import { findDuplicateCategory, isValidCategoryName } from '../../utils/categoryHelpers';
import { CategoryForm, CategoryGroup } from '../../types/apiTypes';

export interface PendingCategoryInfo {
    tempId: string;
    formData: CategoryForm;
    pending: true;
}

interface CategorySelectProps {
    /** Current value: number (category id), '' (nothing selected), or null */
    value: number | '' | null;
    onChange: (value: number | '' | null) => void;
    placeholder?: string;
    /** Show "— Remove category —" option */
    showRemoveOption?: boolean;
    /** Show "All categories" option at top (for filter use) */
    showAllOption?: boolean;
    allOptionLabel?: string;
    disabled?: boolean;
    /** CSS class for the trigger button */
    className?: string;
    /** Callback when a pending category is created (called with pending info for deferred creation) */
    onPendingCategory?: (pending: PendingCategoryInfo) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
    value,
    onChange,
    placeholder = 'Select category...',
    showRemoveOption = false,
    showAllOption = false,
    allOptionLabel = 'All categories',
    disabled = false,
    className = '',
    onPendingCategory,
}) => {
    const dispatch = useAppDispatch();
    const categories = useAppSelector((state) => state.categories.items);
    const categoryGroups = useAppSelector((state) => state.budget.categoryGroups);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formGroupId, setFormGroupId] = useState<number | ''>('');
    const [formColor, setFormColor] = useState('');
    const [formError, setFormError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch category groups when opening if not loaded
    useEffect(() => {
        if (open && categoryGroups.length === 0) {
            dispatch(fetchBudget());
        }
    }, [open, categoryGroups.length, dispatch]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener('mousedown', handler);
        }
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Reset states when dropdown closes
    useEffect(() => {
        if (!open) {
            setSearch('');
            setShowCreateForm(false);
            setFormName('');
            setFormGroupId('');
            setFormColor('');
            setFormError('');
        }
    }, [open]);

    const selectedCategory = categories.find((c) => c.id === value);

    const displayLabel = selectedCategory
        ? selectedCategory.name
        : value === -1
            ? '— Remove category —'
            : value === null && showAllOption
                ? allOptionLabel
                : placeholder;

    const filtered = search.trim() === ''
        ? categories
        : categories.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
        );

    const showCreateButton = search.trim() !== '' && filtered.length === 0;

    const handleSelect = (id: number | '' | null) => {
        onChange(id);
        setOpen(false);
    };

    const handleCreateClick = () => {
        // Pre-fill the name with what user already typed in search
        setFormName(search);
        setShowCreateForm(true);
        setFormError('');
        // Pre-select first category group if available
        if (categoryGroups.length > 0 && formGroupId === '') {
            setFormGroupId(categoryGroups[0].id);
        }
    };

    const handleCreateSubmit = async () => {
        setFormError('');

        // Validate name
        if (!formName.trim()) {
            setFormError('Name is required');
            return;
        }
        if (!isValidCategoryName(formName)) {
            setFormError('Name must be between 1 and 100 characters');
            return;
        }

        // Validate category group
        if (!formGroupId) {
            setFormError('Select a category group');
            return;
        }

        // Check for duplicate in local state
        const existing = findDuplicateCategory(categories, formName);
        if (existing) {
            // Auto-select existing category
            handleSelect(existing.id);
            return;
        }

        setIsCreating(true);

        // Prepare form data
        const formData: CategoryForm = {
            name: formName.trim(),
            category_group_id: formGroupId as number,
            color: formColor || null,
        };

        try {
            // If parent provides onPendingCategory, use deferred creation
            // Otherwise, create immediately (e.g., for filter context)
            if (onPendingCategory) {
                const tempId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                onPendingCategory({
                    tempId,
                    formData,
                    pending: true,
                });
                const pendingValue = -Number(tempId.split('_')[1]) - 1;
                handleSelect(pendingValue);
            } else {
                // Immediate creation - call the API directly
                const result = await dispatch(createCategory(formData)).unwrap();
                handleSelect(result.category.id);
            }
        } catch (error: any) {
            // Check if it's a duplicate error from backend
            if (error?.duplicate && error?.category) {
                handleSelect(error.category.id);
            } else {
                setFormError(error?.message || 'Error creating category');
                setIsCreating(false);
            }
        }
    };

    const handleCreateCancel = () => {
        setShowCreateForm(false);
        setFormName('');
        setFormGroupId('');
        setFormColor('');
        setFormError('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && showCreateForm) {
            e.preventDefault();
            handleCreateSubmit();
        }
        if (e.key === 'Escape' && showCreateForm) {
            handleCreateCancel();
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger — matches .input class styling */}
            <button
                type="button"
                onClick={() => !disabled && setOpen((v) => !v)}
                disabled={disabled}
                className={`
                    w-full flex items-center gap-2 py-2 px-3 rounded-lg border
                    border-[rgb(209_213_219)] bg-[var(--bg-surface)]
                    text-sm text-[var(--text-primary)]
                    hover:border-[var(--accent)] focus:border-[var(--accent)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--accent)]
                    focus:ring-offset-0 transition-all
                    dark:border-[#475569] dark:bg-[#1e293b] dark:text-[#f1f5f9]
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                <span className="flex-1 text-left truncate">
                    {displayLabel}
                </span>
                <ChevronDownIcon
                    className={`w-4 h-4 text-[var(--text-muted)] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[200px] rounded-xl border border-[rgb(209_213_219)] bg-[var(--bg-surface)] shadow-xl overflow-hidden dark:border-[#475569] dark:bg-[#1e293b]"
                    style={{ top: '100%', left: 0 }}>
                    {/* Search - hidden when create form is open */}
                    {!showCreateForm && (
                        <div className="p-2 border-b border-[rgb(209_213_219)] dark:border-[#475569]">
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search category..."
                                className="w-full py-2 px-3 rounded-lg border border-[rgb(209_213_219)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] dark:border-[#475569] dark:bg-[#1e293b] dark:text-[#f1f5f9]"
                            />
                        </div>
                    )}

                    {/* Inline Create Form */}
                    {showCreateForm ? (
                        <div className="p-3 border-b border-[rgb(209_213_219)] dark:border-[#475569]" onKeyDown={handleKeyDown}>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Category name"
                                    maxLength={100}
                                    className="w-full py-2 px-3 rounded-lg border border-[rgb(209_213_219)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] dark:border-[#475569] dark:bg-[#1e293b] dark:text-[#f1f5f9]"
                                    autoFocus
                                />
                                <select
                                    value={formGroupId}
                                    onChange={(e) => setFormGroupId(Number(e.target.value) || '')}
                                    className="w-full py-2 px-3 rounded-lg border border-[rgb(209_213_219)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] dark:border-[#475569] dark:bg-[#1e293b] dark:text-[#f1f5f9]"
                                >
                                    <option value="">Select group...</option>
                                    {categoryGroups.map((group: CategoryGroup) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formColor}
                                        onChange={(e) => setFormColor(e.target.value)}
                                        className="w-8 h-8 rounded border border-[rgb(209_213_219)] dark:border-[#475569] cursor-pointer"
                                    />
                                    <span className="text-xs text-[var(--text-muted)] dark:text-[#64748b]">Color (optional)</span>
                                </div>
                                {formError && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{formError}</p>
                                )}
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleCreateCancel}
                                        className="flex-1 py-1.5 px-3 rounded-lg border border-[rgb(209_213_219)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bulk-bar-accent)] dark:border-[#475569] dark:text-[#94a3b8]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateSubmit}
                                        disabled={isCreating}
                                        className="flex-1 py-1.5 px-3 rounded-lg bg-[var(--accent)] text-sm text-white hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isCreating ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Options */
                        <div className="max-h-52 overflow-y-auto py-1">
                            {/* All option */}
                            {showAllOption && (
                                <button
                                    type="button"
                                    onClick={() => handleSelect(null)}
                                    className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bulk-bar-accent)] transition-colors dark:text-[#94a3b8]"
                                >
                                    {allOptionLabel}
                                </button>
                            )}

                            {/* Remove option */}
                            {showRemoveOption && (
                                <button
                                    type="button"
                                    onClick={() => handleSelect(-1)}
                                    className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bulk-bar-accent)] transition-colors dark:text-[#94a3b8]"
                                >
                                    — Remove category —
                                </button>
                            )}

                            {/* No results with create button */}
                            {filtered.length === 0 && !showCreateButton ? (
                                <p className="px-3 py-2 text-sm text-[var(--text-muted)] italic dark:text-[#64748b]">No categories found</p>
                            ) : filtered.length === 0 && showCreateButton ? (
                                <button
                                    type="button"
                                    onClick={handleCreateClick}
                                    className="w-full text-left px-3 py-2 text-sm text-[var(--accent)] hover:bg-[var(--bulk-bar-accent)] transition-colors font-medium"
                                >
                                    + Create new category...
                                </button>
                            ) : (
                                filtered.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleSelect(cat.id)}
                                        className={`
                                            w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors
                                            ${value === cat.id
                                                ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
                                                : 'text-[var(--text-primary)] hover:bg-[var(--bulk-bar-accent)] dark:text-[#f1f5f9]'}
                                        `}
                                    >
                                        {cat.color && (
                                            <span
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                        )}
                                        <span className="truncate">{cat.name}</span>
                                    </button>
                                ))
                            )}

                            {/* Create button when there are results but user wants to create new */}
                            {filtered.length > 0 && search.trim() !== '' && (
                                <button
                                    type="button"
                                    onClick={handleCreateClick}
                                    className="w-full text-left px-3 py-2 text-sm text-[var(--accent)] hover:bg-[var(--bulk-bar-accent)] transition-colors font-medium border-t border-[rgb(209_213_219)] dark:border-[#475569]"
                                >
                                    + Create new category...
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
