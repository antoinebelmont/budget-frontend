# Budget App - Frontend

A React + TypeScript budget management application built with Vite, Redux Toolkit, and Tailwind CSS.

## Features

- **Budget Management**: Create and manage budget categories organized by groups with monthly tracking
- **Accounts**: Manage multiple account types (checking, savings, credit cards, investments) with balance tracking
- **Transactions**: Full transaction management with filtering, bulk operations, and CSV export
- **Goals**: Track financial goals with visual progress indicators
- **Payees**: Manage payees for transaction categorization
- **Reports**: Comprehensive reporting suite including:
  - Overview Dashboard
  - Spending Analysis
  - Income vs Expense
  - Net Worth
  - Budget vs Actual
  - Cash Flow
  - Saved Reports
- **Import**: Import transactions from CSV files with account mapping
- **Settings**: Application configuration

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Redux Toolkit with typed hooks
- **Routing**: React Router 7
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios with interceptors
- **Forms**: React Hook Form with Yup validation
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## Project Structure

```
src/
├── components/
│   ├── Accounts/        # Account management components
│   ├── Auth/            # Login and registration forms
│   ├── Budget/          # Budget grid and category management
│   ├── Goals/           # Goal tracking components
│   ├── Import/          # CSV import functionality
│   ├── Layout/          # App layout (sidebar, header)
│   ├── Payees/          # Payee management
│   ├── Reports/         # All report components
│   └── Transactions/    # Transaction list and modals
├── services/
│   ├── api.ts           # API service with axios
│   ├── authService.ts   # Authentication service
│   └── reportsService.ts
├── store/
│   ├── index.ts         # Redux store configuration
│   └── slices/          # Redux slices for each domain
└── App.js               # Main application component
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Starts the development server at `http://localhost:5173`

### Build

```bash
pnpm build
```

Builds the application for production.

### Preview

```bash
pnpm preview
```

Preview the production build locally.

> **Note**: On first install, you may be prompted to approve build scripts for esbuild. This is expected behavior.

## API Configuration

The application expects a backend API. Configure the API URL via environment variable:

```
VITE_API_URL=http://localhost:8000/api
```

Default fallback: `http://localhost:8000/api`

## Authentication

The app uses JWT token authentication stored in `localStorage`. Tokens are automatically attached to API requests via axios interceptors.

## Available Scripts

| Command         | Description                     |
|-----------------|---------------------------------|
| `pnpm dev`      | Start development server        |
| `pnpm build`    | Build for production            |
| `pnpm lint`     | Run ESLint                      |
| `pnpm preview`  | Preview production build        |

## Routes

| Path             | Component             | Description              |
|------------------|-----------------------|--------------------------|
| `/login`         | LoginForm             | User login               |
| `/register`      | RegisterForm          | User registration        |
| `/budget`        | BudgetGrid            | Monthly budget overview  |
| `/accounts`      | AccountList           | Account listing          |
| `/accounts/:id`  | AccountDetailPage     | Account details          |
| `/transactions`  | TransactionsList      | Transaction management   |
| `/goals`         | GoalsList             | Financial goals          |
| `/reports`       | ReportsRouter         | Reports dashboard        |
| `/payees`        | PayeesList            | Payee management          |
| `/settings`      | SettingsPage          | App settings             |
| `/import`        | ImportPage           | CSV transaction import   |