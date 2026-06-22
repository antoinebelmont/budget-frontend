import { useState, useCallback, useRef } from 'react';
import { CategoryForm } from '../types/apiTypes';

export interface PendingCategory {
    tempId: string;
    formData: CategoryForm;
    createdAt: number;
}

let tempIdCounter = 0;

function generateTempId(): string {
    return `pending_${Date.now()}_${++tempIdCounter}`;
}

/**
 * Hook to manage pending categories that haven't been persisted yet.
 * Tracks categories temporarily until transaction save succeeds.
 */
export function usePendingCategory() {
    const [pendingCategories, setPendingCategories] = useState<Map<string, PendingCategory>>(new Map());
    const pendingRef = useRef(pendingCategories);

    // Keep ref in sync with state
    pendingRef.current = pendingCategories;

    /**
     * Adds a new pending category and returns its temporary ID.
     */
    const addPending = useCallback((formData: CategoryForm): string => {
        const tempId = generateTempId();
        const pending: PendingCategory = {
            tempId,
            formData,
            createdAt: Date.now(),
        };

        setPendingCategories((prev) => {
            const next = new Map(prev);
            next.set(tempId, pending);
            return next;
        });

        return tempId;
    }, []);

    /**
     * Removes a pending category by its temporary ID.
     */
    const removePending = useCallback((tempId: string): void => {
        setPendingCategories((prev) => {
            const next = new Map(prev);
            next.delete(tempId);
            return next;
        });
    }, []);

    /**
     * Gets a pending category by its temporary ID.
     */
    const getPending = useCallback((tempId: string): PendingCategory | undefined => {
        return pendingRef.current.get(tempId);
    }, []);

    /**
     * Clears all pending categories. Should be called on component unmount.
     */
    const clearAll = useCallback((): void => {
        setPendingCategories(new Map());
    }, []);

    /**
     * Checks if there are any pending categories.
     */
    const hasPending = useCallback((): boolean => {
        return pendingRef.current.size > 0;
    }, []);

    return {
        pendingCategories,
        addPending,
        removePending,
        getPending,
        clearAll,
        hasPending,
    };
}
