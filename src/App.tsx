import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import AppLayout from './components/Layout/AppLayout';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import BudgetGrid from './components/Budget/BudgetGrid';
import AccountList from './components/Accounts/AccountList';
import TransactionsList from './components/Transactions/TransactionsList';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PayeesList from "@/components/Payees/PayeesList";
import GoalsList from './components/Goals/GoalsList';
import ReportsRouter from "@/components/Reports/ReportsRouter";
import AccountDetailPage from "@/components/Accounts/AccountDetailPage";
import SettingsPage from './components/Settings/SettingsPage';
import ImportPage from '@/components/Import/ImportPage';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#22c55e',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />

                    <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/budget" replace />} />
                        <Route path="budget" element={<BudgetGrid />} />
                        <Route path="accounts" element={<AccountList />} />
                        <Route path="accounts/:id" element={<AccountDetailPage />} />
                        <Route path="transactions" element={<TransactionsList />} />
                        <Route path="goals" element={<GoalsList />} />
                        <Route path="reports" element={<ReportsRouter />} />
                        <Route path="payees" element={<PayeesList />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="import" element={<ImportPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </Provider>
    );
};

export default App;