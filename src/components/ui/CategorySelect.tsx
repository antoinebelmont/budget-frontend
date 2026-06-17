import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '../../store';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

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
}) => {
    const categories = useAppSelector((state) => state.categories.items);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

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

    // Reset search when dropdown closes
    useEffect(() => {
        if (!open) setSearch('');
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

    const handleSelect = (id: number | '' | null) => {
        onChange(id);
        setOpen(false);
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
                    {/* Search */}
                    <div className="p-2 border-b border-[rgb(209_213_219)] dark:border-[#475569]">
                        <input
                            autoFocus
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search category..."
                            className="w-full py-2 px-3 rounded-lg border border-[rgb(209_213_219)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] dark:border-[#475569] dark:bg-[#1e293b] dark:text-[#f1f5f9]"
                        />
                    </div>

                    {/* Options */}
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

                        {/* No results */}
                        {filtered.length === 0 ? (
                            <p className="px-3 py-2 text-sm text-[var(--text-muted)] italic dark:text-[#64748b]">No categories found</p>
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
                    </div>
                </div>
            )}
        </div>
    );
};
