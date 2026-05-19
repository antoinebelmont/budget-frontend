import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
    WalletIcon,
    CreditCardIcon,
    ArrowsRightLeftIcon,
    TrophyIcon,
    ChartBarIcon,
    UsersIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchAccountsForSidebar } from '../../store/slices/accountsSlice';
import clsx from 'clsx';

const navigation = [
    { name: 'Budget', to: '/budget', icon: WalletIcon },
    { name: 'Accounts', to: '/accounts', icon: CreditCardIcon },
    { name: 'Transactions', to: '/transactions', icon: ArrowsRightLeftIcon },
    { name: 'Payees', to: '/payees', icon: UsersIcon },
    { name: 'Goals', to: '/goals', icon: TrophyIcon },
    { name: 'Reports', to: '/reports', icon: ChartBarIcon },
];

const Sidebar: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useAppSelector((state) => state.auth);
    const { sidebarAccounts } = useAppSelector((state) => state.accounts);
    const { preferences } = useAppSelector((state) => state.auth);
    const [transactionsExpanded, setTransactionsExpanded] = useState(false);

    const currentAccountId = searchParams.get('account_id');

    useEffect(() => {
        dispatch(fetchAccountsForSidebar());
    }, [dispatch]);

    useEffect(() => {
        const isTransactionsPage = location.pathname === '/transactions' || location.pathname.startsWith('/transactions');
        setTransactionsExpanded(isTransactionsPage);
    }, [location]);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    const showTransactionCounts = preferences?.show_transaction_counts ?? false;
    const hasMultipleAccounts = sidebarAccounts.length >= 2;

    return (
        <div className="hidden md:flex md:w-64 md:flex-col">
            <div className="flex flex-col flex-grow bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] pt-5 pb-4 overflow-y-auto dark:shadow-xl dark:shadow-black/20">
                <div className="flex items-center flex-shrink-0 px-4">
                    <WalletIcon className="h-8 w-8 text-primary-600" />
                    <span className="ml-2 text-xl font-bold text-[var(--text-primary)]">Budget App</span>
                </div>

                <nav className="mt-8 flex-grow flex flex-col">
                    <div className="flex-grow">
                        <div className="px-2 space-y-1">
                            {navigation.map((item) => {
                                if (item.name === 'Transactions') {
                                    if (!hasMultipleAccounts) {
                                        const singleAccount = sidebarAccounts[0];
                                        return (
                                            <NavLink
                                                key={item.name}
                                                to={singleAccount ? `/transactions?account_id=${singleAccount.id}` : '/transactions'}
                                                className={({ isActive }) =>
                                                    clsx(
                                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                                                        isActive
                                                            ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/40 dark:text-primary-200 border-l-2 border-primary-500 dark:border-primary-400 -ml-px'
                                                            : 'text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-slate-700/70 hover:text-[var(--text-primary)]'
                                                    )
                                                }
                                            >
                                                <item.icon className="mr-3 h-5 w-5 group-hover:text-[var(--text-primary)] transition-colors" />
                                                {item.name}
                                            </NavLink>
                                        );
                                    }

                                    return (
                                        <div key={item.name}>
                                            <NavLink
                                                to="/transactions"
                                                className={({ isActive }) =>
                                                    clsx(
                                                        'group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors',
                                                        isActive && !currentAccountId
                                                            ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/40 dark:text-primary-200 border-l-2 border-primary-500 dark:border-primary-400 -ml-px'
                                                            : 'text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-slate-700/70 hover:text-[var(--text-primary)]'
                                                    )
                                                }
                                                onClick={() => setTransactionsExpanded(!transactionsExpanded)}
                                            >
                                                <span className="flex items-center">
                                                    <item.icon className="mr-3 h-5 w-5 group-hover:text-[var(--text-primary)] transition-colors" />
                                                    {item.name}
                                                </span>
                                                {transactionsExpanded ? (
                                                    <ChevronDownIcon className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRightIcon className="h-4 w-4" />
                                                )}
                                            </NavLink>
                                            {transactionsExpanded && (
                                                <div className="ml-6 mt-1 space-y-1">
                                                    {sidebarAccounts.map((account) => (
                                                        <NavLink
                                                            key={account.id}
                                                            to={`/transactions?account_id=${account.id}`}
                                                            className={({ isActive }) =>
                                                                clsx(
                                                                    'group flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md transition-colors',
                                                                    isActive
                                                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                                                                        : 'text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-[var(--text-secondary)]'
                                                                )
                                                            }
                                                        >
                                                            <span>{account.name}</span>
                                                            {showTransactionCounts && (
                                                                <span className="text-xs text-[var(--text-muted)]">({account.transaction_count})</span>
                                                            )}
                                                        </NavLink>
                                                    ))}
                                                    <NavLink
                                                        to="/transactions"
                                                        className={({ isActive }) =>
                                                            clsx(
                                                                'group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors',
                                                                !currentAccountId
                                                                    ? 'text-primary-700 dark:text-primary-300 font-medium'
                                                                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                                                            )
                                                        }
                                                    >
                                                        All Transactions
                                                    </NavLink>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.to}
                                        className={({ isActive }) =>
                                            clsx(
                                                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                                                isActive
                                                    ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/40 dark:text-primary-200 border-l-2 border-primary-500 dark:border-primary-400 -ml-px'
                                                    : 'text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-slate-700/70 hover:text-[var(--text-primary)]'
                                            )
                                        }
                                    >
                                        <item.icon className="mr-3 h-5 w-5 group-hover:text-[var(--text-primary)] transition-colors" />
                                        {item.name}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>

                    <div className="px-2 mt-6 pt-6 border-t border-[var(--border-default)]">
                        <div className="flex items-center px-2 py-2">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-[var(--text-primary)]">{user?.first_name} {user?.last_name}</p>
                                <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <NavLink
                                to="/settings"
                                className="group flex items-center px-2 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/70 hover:text-[var(--text-primary)]"
                            >
                                <Cog6ToothIcon className="mr-3 h-5 w-5 group-hover:text-[var(--text-primary)] transition-colors" />
                                Settings
                            </NavLink>

                            <button
                                onClick={handleLogout}
                                className="w-full group flex items-center px-2 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/70 hover:text-[var(--text-primary)]"
                            >
                                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 group-hover:text-[var(--text-primary)] transition-colors" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;