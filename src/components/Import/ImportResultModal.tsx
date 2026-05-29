import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { ImportResult } from '@/types/apiTypes';

interface ImportResultModalProps {
    open: boolean;
    result: ImportResult;
    onClose: () => void;
}

const ImportResultModal: React.FC<ImportResultModalProps> = ({ open, result, onClose }) => {
    const [showIgnored, setShowIgnored] = useState(false);

    const { success, imported_count, ignored_rows, error_rows } = result;
    const hasIgnored = ignored_rows.length > 0;
    const hasErrors = error_rows.length > 0;
    const isClean = success && !hasIgnored && !hasErrors;

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-10"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="import-result-title"
                onClose={onClose}
            >
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
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title
                                        id="import-result-title"
                                        className="text-lg font-medium text-[var(--text-primary)]"
                                    >
                                        Import Result
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {success ? (
                                    <div className="space-y-4">
                                        {isClean ? (
                                            <div className="flex flex-col items-center py-6 gap-3">
                                                <CheckCircleIcon className="w-12 h-12 text-[var(--success)]" />
                                                <p className="text-base font-medium text-[var(--text-primary)]">
                                                    All transactions imported successfully
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--success)]/10">
                                                    <CheckCircleIcon className="w-8 h-8 shrink-0 text-[var(--success)]" />
                                                    <div>
                                                        <p className="text-sm font-medium text-[var(--text-primary)]">
                                                            {imported_count} transaction{imported_count !== 1 ? 's' : ''} imported
                                                        </p>
                                                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                                            Import completed successfully
                                                        </p>
                                                    </div>
                                                </div>

                                                {hasIgnored && (
                                                    <div className="rounded-xl border border-[var(--border-color)] overflow-hidden">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowIgnored(!showIgnored)}
                                                            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-[var(--accent)]/5 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0" />
                                                                <span className="text-sm font-medium text-[var(--text-primary)]">
                                                                    {ignored_rows.length} duplicate{ignored_rows.length !== 1 ? 's' : ''} skipped
                                                                </span>
                                                            </div>
                                                            <ChevronDownIcon
                                                                className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${showIgnored ? 'rotate-180' : ''}`}
                                                            />
                                                        </button>
                                                        {showIgnored && (
                                                            <div className="border-t border-[var(--border-color)] divide-y divide-[var(--border-color)]">
                                                                {ignored_rows.map((row) => (
                                                                    <div
                                                                        key={row.row_number}
                                                                        className="px-4 py-2.5 text-sm"
                                                                    >
                                                                        <span className="text-[var(--text-muted)]">Row {row.row_number}:</span>{' '}
                                                                        <span className="text-[var(--text-secondary)]">{row.reason}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {hasErrors && (
                                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10">
                                                        <XCircleIcon className="w-5 h-5 shrink-0 text-[var(--danger)]" />
                                                        <span className="text-sm text-[var(--text-primary)]">
                                                            {error_rows.length} row{error_rows.length !== 1 ? 's' : ''} with errors
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <div className="flex justify-end pt-2">
                                            <button type="button" onClick={onClose} className="btn-primary">
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex flex-col items-center gap-3 py-4">
                                            <XCircleIcon className="w-12 h-12 text-[var(--danger)]" />
                                            <p className="text-base font-medium text-[var(--text-primary)]">
                                                Import failed
                                            </p>
                                        </div>

                                        {error_rows.length > 0 && (
                                            <div className="rounded-xl border border-red-500/30 divide-y divide-red-500/10 bg-red-500/5">
                                                {error_rows.map((row) => (
                                                    <div key={row.row_number} className="px-4 py-3">
                                                        <p className="text-sm font-medium text-[var(--text-primary)]">
                                                            Row {row.row_number}
                                                        </p>
                                                        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                                                            {row.reason}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-2">
                                            <button type="button" onClick={onClose} className="btn-primary">
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ImportResultModal;
