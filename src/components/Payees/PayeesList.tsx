import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchPayees, deletePayee } from '../../store/slices/payeesSlice';
import { Payee } from '../../types/api';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PayeeModal from './PayeeModal';
import toast from 'react-hot-toast';

const PayeesList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items: payees, loading } = useAppSelector((state) => state.payees);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayee, setEditingPayee] = useState<Payee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchPayees());
    }, [dispatch]);

    // ✅ Refresh payees when component receives focus or transactions might have changed
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                dispatch(fetchPayees());
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [dispatch]);

    const handleDelete = async (payee: Payee) => {
        if (window.confirm(`Are you sure you want to delete "${payee.name}"? This will not delete transactions, only unlink the payee.`)) {
            try {
                await dispatch(deletePayee(payee.id)).unwrap();
                toast.success('Payee deleted successfully');
                // Refresh the list to get updated totals
                dispatch(fetchPayees());
            } catch (error) {
                toast.error('Failed to delete payee', error);
            }
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingPayee(null);
        // ✅ Refresh payees after modal closes to get updated data
        dispatch(fetchPayees());
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));
    };

    const filteredPayees = payees.filter((payee) =>
        payee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && payees.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Payees</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        Manage where your money goes • {filteredPayees.length} payee{filteredPayees.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Payee
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[var(--text-muted)]" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search payees..."
                    className="input pl-10!"
                />
            </div>

            {/* Payees Grid */}
            {filteredPayees.length === 0 ? (
                <div className="text-center py-12 card">
                    <div className="text-gray-500">
                        {searchTerm ? (
                            <>
                                <p className="text-lg font-medium">No payees found</p>
                                <p className="text-sm mt-1">Try adjusting your search</p>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-center mb-4">
                                    <PlusIcon className="h-16 w-16 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium">No payees yet</p>
                                <p className="text-sm mt-1 mb-4">Add payees to track where your money goes</p>
                                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                                    Add Your First Payee
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPayees.map((payee) => (
                        <div key={payee.id} className="card p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] truncate">{payee.name}</h3>
                                    {payee.auto_assign_category && (
                                        <div className="mt-2 flex items-center">
                                            {payee.auto_assign_category.color && (
                                                <span
                                                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                                    style={{ backgroundColor: payee.auto_assign_category.color }}
                                                />
                                            )}
                                            <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)] truncate">
                        Auto: {payee.auto_assign_category.name}
                      </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex space-x-2 flex-shrink-0 ml-2">
                                    <button
                                        onClick={() => {
                                            setEditingPayee(payee);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-1 text-gray-400 dark:text-[var(--text-muted)] hover:text-primary-600 transition-colors"
                                        title="Edit payee"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(payee)}
                                        className="p-1 text-gray-400 dark:text-[var(--text-muted)] hover:text-danger-600 transition-colors"
                                        title="Delete payee"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm border-t border-[var(--border-default)] pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-[var(--text-secondary)]">Total Spent:</span>
                                    <span className="font-semibold text-red-600">
                    {payee.total_spent
                        ? formatCurrency(payee.total_spent)
                        : '$0.00'}
                  </span>
                                </div>

                                {/* Optional: Add transaction count if available */}
                                {payee.transaction_count !== undefined && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-[var(--text-secondary)]">Transactions:</span>
                                        <span className="font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                      {payee.transaction_count}
                    </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <PayeeModal
                    payee={editingPayee}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default PayeesList;