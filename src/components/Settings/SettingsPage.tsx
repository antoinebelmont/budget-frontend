import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setTheme } from '../../store/slices/uiSlice';
import { fetchUserPreferences, updateUserPreferences } from '../../store/slices/authSlice';
import { SunIcon, MoonIcon, Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const theme = useAppSelector((state) => state.ui.theme);
    const { user, preferences } = useAppSelector((state) => state.auth);
    const [showTransactionCounts, setShowTransactionCounts] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dispatch(fetchUserPreferences()).finally(() => setLoading(false));
    }, [dispatch]);

    useEffect(() => {
        if (preferences) {
            setShowTransactionCounts(preferences.show_transaction_counts ?? false);
        }
    }, [preferences]);

    const handleTransactionCountsToggle = async () => {
        const newValue = !showTransactionCounts;
        setShowTransactionCounts(newValue);
        try {
            await dispatch(updateUserPreferences({ show_transaction_counts: newValue })).unwrap();
            toast.success('Preference saved');
        } catch (error) {
            setShowTransactionCounts(!newValue);
            toast.error('Failed to save preference');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
                <p className="text-[var(--text-secondary)] mt-1">Manage your preferences</p>
            </div>

            <div className="card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Appearance</h2>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {theme === 'light' ? (
                            <SunIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                        ) : (
                            <MoonIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                        )}
                        <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">Theme</p>
                            <p className="text-xs text-[var(--text-muted)]">
                                {theme === 'light' ? 'Light mode' : 'Dark mode'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => dispatch(setTheme(theme === 'light' ? 'dark' : 'light'))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>

            <div className="card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Profile</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">First Name</label>
                        <p className="mt-1 text-sm text-[var(--text-primary)]">{user?.first_name || '—'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Last Name</label>
                        <p className="mt-1 text-sm text-[var(--text-primary)]">{user?.last_name || '—'}</p>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Email</label>
                        <p className="mt-1 text-sm text-[var(--text-primary)]">{user?.email || '—'}</p>
                    </div>
                </div>
            </div>

            <div className="card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Preferences</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Currency</label>
                        <p className="mt-1 text-sm text-[var(--text-primary)]">{user?.currency || 'USD'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Timezone</label>
                        <p className="mt-1 text-sm text-[var(--text-primary)]">{user?.timezone || 'UTC'}</p>
                    </div>
                </div>
            </div>

            <div className="card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Sidebar</h2>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bars3BottomLeftIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                        <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">Show transaction counts</p>
                            <p className="text-xs text-[var(--text-muted)]">
                                Display transaction counts next to accounts in sidebar
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleTransactionCountsToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            showTransactionCounts ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                showTransactionCounts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
