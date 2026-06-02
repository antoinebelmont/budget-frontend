import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import apiService from '@/services/api';
import type { ImportResult } from '@/types/apiTypes';
import AccountPickerModal from './AccountPickerModal';
import FileUploadZone from './FileUploadZone';
import ImportResultModal from './ImportResultModal';

const DATE_FORMAT_OPTIONS = [
    { label: 'MM/DD/YYYY (US — 12/03/2026)', value: 'm/d/Y' },
    { label: 'DD/MM/YYYY (EU — 03/12/2026)', value: 'd/m/Y' },
    { label: 'YYYY-MM-DD (ISO — 2026-12-03)', value: 'Y-m-d' },
    { label: 'DD-MM-YYYY (03-12-2026)', value: 'd-m-Y' },
];

const ImportPage: React.FC = () => {
    const navigate = useNavigate();
    const filtersAccountId = useAppSelector((state) => state.transactions.filters.account_id);
    const preferences = useAppSelector((state) => state.auth.preferences);
    const storedDateFormat = preferences?.date_format ?? 'Y-m-d';

    const [step, setStep] = useState<'account' | 'file' | 'result'>(
        filtersAccountId !== undefined ? 'file' : 'account'
    );
    const [accountId, setAccountId] = useState<number>(filtersAccountId ?? 0);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dateFormat, setDateFormat] = useState<string>(storedDateFormat);

    const handleAccountSelect = (selectedAccountId: number) => {
        setAccountId(selectedAccountId);
        setStep('file');
    };

    const handleFileSelect = async (file: File) => {
        setLoading(true);
        setError(null);
        try {
            const importResult = await apiService.uploadAndImport(file, accountId, dateFormat);
            setResult(importResult);
            setStep('result');
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Import failed';
            setResult({
                success: false,
                imported_count: 0,
                ignored_rows: [],
                error_rows: [{ row_number: 1, reason: message }],
            });
            setError(message);
            setStep('result');
        } finally {
            setLoading(false);
        }
    };

    const handleResultClose = () => {
        navigate(`/transactions?account_id=${accountId}`);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                Import Transactions
            </h1>

            {step === 'account' && (
                <AccountPickerModal
                    open={true}
                    onClose={() => {}}
                    onAccountSelect={handleAccountSelect}
                />
            )}

            {step === 'file' && (
                <div className="space-y-6">
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4">
                        <label htmlFor="date-format" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                            Date format in CSV file
                        </label>
                        <p className="text-xs text-[var(--text-muted)] mb-2">
                            Select the date format used in your CSV so transactions are parsed correctly.
                        </p>
                        <select
                            id="date-format"
                            value={dateFormat}
                            onChange={(e) => setDateFormat(e.target.value)}
                            className="w-full max-w-xs rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        >
                            {DATE_FORMAT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <FileUploadZone onFileSelect={handleFileSelect} />

                    {loading && (
                        <div className="flex items-center justify-center gap-3 py-8">
                            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-[var(--text-muted)]">Importing transactions...</span>
                        </div>
                    )}
                </div>
            )}

            {step === 'result' && result && (
                <ImportResultModal
                    open={true}
                    result={result}
                    onClose={handleResultClose}
                />
            )}
        </div>
    );
};

export default ImportPage;
