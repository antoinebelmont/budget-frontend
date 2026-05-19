
import React from 'react';
import { useAppSelector } from '../../store';
import ReportsLayout from './ReportsLayout';
import OverviewReport from './OverviewReport';
import SpendingReport from './SpendingReport';
import IncomeExpenseReport from './IncomeExpenseReport';
import NetWorthReport from './NetWorthReport';
import BudgetActualReport from './BudgetActualReport';
import CashFlowReport from './CashFlowReport';
import SavedReports from './SavedReports';

const ReportsRouter: React.FC = () => {
    const currentTab = useAppSelector((state) => state.reports.currentTab);

    const renderContent = () => {
        switch (currentTab) {
            case 'overview':
                return <OverviewReport />;
            case 'spending':
                return <SpendingReport />;
            case 'income-expense':
                return <IncomeExpenseReport />;
            case 'net-worth':
                return <NetWorthReport />;
            case 'budget-actual':
                return <BudgetActualReport />;
            case 'cash-flow':
                return <CashFlowReport />;
            case 'saved':
                return <SavedReports />;
            default:
                return <OverviewReport />;
        }
    };

    return <ReportsLayout>{renderContent()}</ReportsLayout>;
};

export default ReportsRouter;
