import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { RootState } from '@/types/redux';

import authReducer from './slices/authSlice';
import accountsReducer from './slices/accountsSlice';
import budgetReducer from './slices/budgetSlice';
import transactionsReducer from './slices/transactionsSlice';
import payeesReducer from './slices/payeesSlice';
import goalsReducer from './slices/goalsSlice';
import uiReducer from './slices/uiSlice';
import categoriesReducer from './slices/categoriesSlice';
import reportsReducer from './slices/reportsSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        accounts: accountsReducer,
        budget: budgetReducer,
        transactions: transactionsReducer,
        categories: categoriesReducer,
        payees: payeesReducer,
        goals: goalsReducer,
        reports: reportsReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;