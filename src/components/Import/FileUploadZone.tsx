import React, { useCallback, useRef, useState } from 'react';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ACCEPTED_EXTENSION = '.csv';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FileUploadZoneProps {
    onFileSelect: (file: File) => void;
}

interface ValidationResult {
    valid: boolean;
    error: string | null;
}

function validateFile(file: File): ValidationResult {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (extension !== ACCEPTED_EXTENSION) {
        return { valid: false, error: `Invalid file type. Only ${ACCEPTED_EXTENSION} files are accepted.` };
    }
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'File size exceeds the 10 MB limit.' };
    }
    return { valid: true, error: null };
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFileSelect }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback((file: File) => {
        const result = validateFile(file);
        if (!result.valid) {
            setError(result.error);
            setSelectedFile(null);
            return;
        }
        setError(null);
        setSelectedFile(file);
        onFileSelect(file);
    }, [onFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = '';
    }, [handleFile]);

    const handleBrowseClick = () => {
        inputRef.current?.click();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setError(null);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={selectedFile ? `Selected file: ${selectedFile.name}. Press Enter or Space to change file.` : 'Upload a CSV file. Press Enter or Space to browse.'}
            aria-describedby={error ? 'file-upload-error' : undefined}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={selectedFile ? undefined : handleBrowseClick}
            onKeyDown={handleKeyDown}
            className={`
                relative flex flex-col items-center justify-center w-full p-8
                border-2 border-dashed rounded-xl
                transition-all duration-200 cursor-pointer
                ${isDragging
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : error
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                        : selectedFile
                            ? 'border-[var(--border-default)] bg-[var(--bg-surface)]'
                            : 'border-[var(--border-default)] hover:border-[var(--text-muted)] bg-[var(--bg-surface)]'
                }
            `}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
            />

            {selectedFile && !error ? (
                <div className="flex flex-col items-center gap-3 w-full">
                    <div className="flex items-center gap-3 w-full max-w-sm">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--accent)]/10">
                            <ArrowUpTrayIcon className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="flex-shrink-0 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)] transition-colors"
                            aria-label="Remove selected file"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleBrowseClick}
                        className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] underline transition-colors"
                    >
                        Choose a different file
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--accent)]/10">
                        <ArrowUpTrayIcon className="w-6 h-6 text-[var(--accent)]" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                            <span className="text-[var(--accent)] hover:text-[var(--accent-hover)] underline underline-offset-2">
                                Browse files
                            </span>
                            {' '}or drag and drop
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            CSV files only, up to 10 MB
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <p id="file-upload-error" role="alert" className="text-sm text-red-600 dark:text-red-400 mt-3">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FileUploadZone;
