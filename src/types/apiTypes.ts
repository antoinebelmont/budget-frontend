export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    full_name: string;
    timezone: string;
    currency: string;
    preferences: UserPreferences;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserPreferences {
    currency_format: 'symbol_before' | 'symbol_after';
    date_format: string;
    first_day_of_week: number;
    notifications: {
        budget_warnings: boolean;
        goal_reminders: boolean;
        transaction_imports: boolean;
    };
    theme: 'light' | 'dark';
}

export interface Account {
    id: number;
    user_id: number;
    name: string;
    type: 'checking' | 'savings' | 'credit_card' | 'investment';
    balance: number;
    cleared_balance: number;
    uncleared_balance: number;
    closed: 0 | 1;
    created_at: string;
    updated_at: string;
}

export interface CategoryGroup {
    id: number;
    user_id: number;
    name: string;
    hidden: boolean;
    sort_order: number;
    categories: Category[];
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    user_id: number;
    category_group_id: number;
    name: string;
    budgeted: number;
    activity: number;
    available: number;
    color?: string;
    hidden: boolean;
    created_at: string;
    updated_at: string;
    goals?: Goal[];
}

export interface Payee {
    id: number;
    user_id: number;
    name: string;
    auto_assign_category_id?: number;
    auto_assign_category?: Category;
    total_spent?: number;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: number;
    user_id: number;
    account_id: number;
    category_id?: number;
    payee_id?: number;
    date: string;
    amount: number;
    memo?: string;
    cleared: 'cleared' | 'uncleared' | 'reconciled';
    approved: boolean;
    import_id?: string;
    account?: Account;
    category?: Category;
    payee?: Payee;
    created_at: string;
    updated_at: string;
}

export interface Goal {
    id: number;
    category_id: number;
    type: 'target_balance' | 'target_date' | 'monthly_funding';
    target_amount?: number;
    target_date?: string;
    monthly_amount?: number;
    category?: Category;
    current: number;
    progress_percentage?: number;
    remaining_amount?: number;
    months_remaining?: number;
    suggested_monthly_amount?: number;
    created_at: string;
    updated_at: string;
}

// API Response types
export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev?: string;
        next?: string;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
}

// Form types
export interface LoginForm {
    email: string;
    password: string;
    remember?: boolean;
}

export interface RegisterForm {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    timezone?: string;
    currency?: string;
}

export interface AccountForm {
    name: string;
    type: Account['type'];
    balance: number;
}

export interface TransactionForm {
    account_id: number;
    category_id?: number;
    payee_id?: number;
    date: string;
    amount: number;
    memo?: string;
    cleared: Transaction['cleared'];
}

// Import types
export interface ImportRowDetail {
    row_number: number;
    reason: string;
}

export interface ImportResult {
    imported_count: number;
    ignored_rows: ImportRowDetail[];
    error_rows: ImportRowDetail[];
    success: boolean;
}

export interface GoalForm {
    category_id: number;
    type: Goal['type'];
    target_amount?: number;
    target_date?: string;
    monthly_amount?: number;
}

export interface SpendingReportData {
    total_spent: number;
    transaction_count: number;
    by_category: {
        category: string;
        total: number;
        count: number;
    }[];
    top_payees: {
        payee: string;
        total: number;
        count: number;
    }[];
    period: {
        start: string;
        end: string;
    };
}

export interface NetWorthData {
    net_worth: number;
    accounts: {
        name: string;
        type: string;
        balance: number;
        contribution: number;
    }[];
    as_of: string;
}

export interface IncomeVsExpenseData {
    monthly_data: {
        month: string;
        income: number;
        expenses: number;
        net: number;
    }[];
    summary: {
        total_income: number;
        total_expenses: number;
        net_income: number;
        average_monthly_income: number;
        average_monthly_expenses: number;
    };
}

export interface BudgetVsActualData {
    month: string;
    categories: {
        id: number;
        name: string;
        category_group: string;
        budgeted: number;
        actual: number;
        difference: number;
        percentage: number;
    }[];
    summary: {
        total_budgeted: number;
        total_actual: number;
        total_difference: number;
        over_budget_count: number;
        under_budget_count: number;
    };
}

export interface CategoryTrendData {
    category: Category;
    months: {
        month: string;
        amount: number;
        transaction_count: number;
    }[];
}

export interface CashFlowData {
    months: {
        month: string;
        starting_balance: number;
        income: number;
        expenses: number;
        ending_balance: number;
        net_change: number;
    }[];
    summary: {
        average_income: number;
        average_expenses: number;
        average_net_change: number;
        trend: 'positive' | 'negative' | 'stable';
    };
}

export interface DateRange {
    start_date: string;
    end_date: string;
}

export interface ReportFilters {
    account_id?: number;
    category_id?: number;
    category_group_id?: number;
    date_range: DateRange;
}

export interface SavedReport {
    id: number;
    user_id: number;
    name: string;
    type: 'spending' | 'income_vs_expense' | 'net_worth' | 'budget_vs_actual' | 'category_trend' | 'cash_flow';
    filters: ReportFilters;
    created_at: string;
    updated_at: string;
}