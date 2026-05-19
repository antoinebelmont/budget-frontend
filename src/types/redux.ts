import {
    User,
    CategoryGroup,
    Transaction,
    PaginatedResponse,
    Payee,
    Goal,
    Account,
    SpendingReportData,
    NetWorthData,
    IncomeVsExpenseData,
    BudgetVsActualData,
    CategoryTrendData,
    CashFlowData,
    ReportFilters,
    SavedReport
} from '@/types/apiTypes';
export interface RootState {
    auth: AuthState;
    accounts: AccountsState;
    budget: BudgetState;
    transactions: TransactionsState;
    payees: PayeesState;
    goals: GoalsState;
    ui: UIState;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    preferences: Record<string, any> | null;
}

export interface AccountsState {
    items: Account[];
    currentAccount: Account | null;
    loading: boolean;
    error: string | null;
}

export interface BudgetState {
    categoryGroups: CategoryGroup[];
    currentMonth: string;
    loading: boolean;
    error: string | null;
}

export interface TransactionsState {
    items: Transaction[];
    pagination: PaginatedResponse<Transaction>['meta'] | null;
    loading: boolean;
    error: string | null;
    filters: {
        account_id?: number;
        category_id?: number;
        payee_id?: number;
        start_date?: string;
        end_date?: string;
    };
}

export interface PayeesState {
    items: Payee[];
    loading: boolean;
    error: string | null;
}

export interface GoalsState {
    items: Goal[];
    loading: boolean;
    error: string | null;
}

export interface UIState {
    sidebarOpen: boolean;
    currentPage: string;
    theme: 'light' | 'dark';
}

export interface ReportsState {
    spending: {
        data: SpendingReportData | null;
        loading: boolean;
        error: string | null;
    };
    netWorth: {
        data: NetWorthData | null;
        loading: boolean;
        error: string | null;
    };
    incomeVsExpense: {
        data: IncomeVsExpenseData | null;
        loading: boolean;
        error: string | null;
    };
    budgetVsActual: {
        data: BudgetVsActualData | null;
        loading: boolean;
        error: string | null;
    };
    categoryTrend: {
        data: CategoryTrendData | null;
        loading: boolean;
        error: string | null;
    };
    cashFlow: {
        data: CashFlowData | null;
        loading: boolean;
        error: string | null;
    };
    filters: ReportFilters;
    savedReports: SavedReport[];
    currentTab: string;
}