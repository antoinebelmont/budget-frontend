import { Category } from '../types/apiTypes';

/**
 * Checks if a category with the given name already exists (case-insensitive).
 * @param categories - Array of categories to search
 * @param name - Name to search for
 * @returns The existing Category if found, null otherwise
 */
export function findDuplicateCategory(categories: Category[], name: string): Category | null {
    if (!name || name.trim() === '') {
        return null;
    }

    const normalizedName = name.trim().toLowerCase();

    return categories.find(
        (cat) => cat.name.toLowerCase() === normalizedName
    ) || null;
}

/**
 * Validates category name length (1-100 characters).
 * @param name - Name to validate
 * @returns true if valid, false otherwise
 */
export function isValidCategoryName(name: string): boolean {
    const trimmed = name?.trim() || '';
    return trimmed.length >= 1 && trimmed.length <= 100;
}
