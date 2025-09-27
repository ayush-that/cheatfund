# UI Components Specification

## 📋 Overview

This document provides detailed specifications for all UI components required to integrate with the ChitFund smart contracts. Each component includes design patterns, state management, and integration points.

## 🏗️ Component Architecture

### Component Categories

1. **Smart Contract Components** - Direct blockchain interaction
2. **Data Display Components** - Read-only contract data
3. **Form Components** - User input with validation
4. **Status Components** - Transaction and state feedback
5. **Layout Components** - Page structure and navigation

---

## 🔗 Smart Contract Components

### 1. FundCreator Component

**Purpose**: Create new ChitFund contracts via Factory
**Location**: `src/components/fund/FundCreator.tsx`

```typescript
interface FundCreatorProps {
  onSuccess?: (contractAddress: string) => void;
  onError?: (error: Error) => void;
}

interface FundFormData {
  fundName: string;
  description: string;
  contributionAmount: string;
  totalMembers: number;
  paymentToken: "ETH" | "ERC20";
  tokenAddress?: string;
  isPublic: boolean;
}

export function FundCreator({ onSuccess, onError }: FundCreatorProps) {
  // Implementation details...
}
```

**Key Features**:

- Form validation with Zod schema
- Real-time gas estimation
- Transaction progress tracking
- Error handling with user-friendly messages
- Integration with `useChitFundFactory` hook

**UI Elements**:

- Fund name input with character limit
- Description textarea
- Contribution amount input with ETH/USD conversion
- Member count slider (3-10)
- Token selection (ETH/ERC20)
- Privacy toggle (Public/Private)
- Gas estimation display
- Create button with loading state

### 2. FundJoiner Component

**Purpose**: Join existing ChitFund
**Location**: `src/components/fund/FundJoiner.tsx`

```typescript
interface FundJoinerProps {
  contractAddress: string;
  fundData: FundData;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function FundJoiner({
  contractAddress,
  fundData,
  onSuccess,
  disabled,
}: FundJoinerProps) {
  // Implementation details...
}
```

**Key Features**:

- Pre-join validation (fund not full, not started)
- Member requirement display
- Transaction confirmation
- Success/error feedback

**UI Elements**:

- Fund information summary
- Join requirements checklist
- Gas fee estimation
- Join button with loading state
- Progress indicator

### 3. ContributionForm Component

**Purpose**: Make cycle contributions
**Location**: `src/components/fund/ContributionForm.tsx`

```typescript
interface ContributionFormProps {
  contractAddress: string;
  contributionAmount: bigint;
  isEthBased: boolean;
  deadline: number;
  onSuccess?: () => void;
}

export function ContributionForm({
  contractAddress,
  contributionAmount,
  isEthBased,
  deadline,
  onSuccess,
}: ContributionFormProps) {
  // Implementation details...
}
```

**Key Features**:

- Automatic amount calculation
- Deadline countdown
- Balance validation
- Token approval (for ERC20)
- Transaction tracking

**UI Elements**:

- Amount display (read-only)
- Balance check indicator
- Deadline countdown timer
- Contribute button
- Transaction status

### 4. BiddingInterface Component

**Purpose**: Submit bids for cycle winner
**Location**: `src/components/fund/BiddingInterface.tsx`

```typescript
interface BiddingInterfaceProps {
  contractAddress: string;
  cycleData: CycleData;
  onBidSubmitted?: (bidPercentage: number) => void;
}

export function BiddingInterface({
  contractAddress,
  cycleData,
  onBidSubmitted,
}: BiddingInterfaceProps) {
  // Implementation details...
}
```

**Key Features**:

- Bid percentage slider (0-30%)
- Payout calculation preview
- Bid validation
- Submission confirmation
- Real-time bid status

**UI Elements**:

- Bid percentage slider
- Payout preview calculation
- Current highest bid display
- Submit bid button
- Bidding deadline countdown

---

## 📊 Data Display Components

### 1. FundCard Component

**Purpose**: Display fund summary in lists
**Location**: `src/components/fund/FundCard.tsx`

```typescript
interface FundCardProps {
  contractAddress: string;
  fundInfo: ChitFundInfo;
  showActions?: boolean;
  variant?: "default" | "compact" | "detailed";
}

export function FundCard({
  contractAddress,
  fundInfo,
  showActions = true,
  variant = "default",
}: FundCardProps) {
  // Implementation details...
}
```

**Key Features**:

- Multiple display variants
- Real-time member count
- Status indicators
- Action buttons
- Responsive design

**UI Elements**:

- Fund name and description
- Creator address (truncated)
- Member count progress
- Contribution amount
- Status badge
- Action buttons (Join/View)

### 2. CycleProgress Component

**Purpose**: Display current cycle information
**Location**: `src/components/fund/CycleProgress.tsx`

```typescript
interface CycleProgressProps {
  cycleData: CycleData;
  totalMembers: number;
  className?: string;
}

export function CycleProgress({
  cycleData,
  totalMembers,
  className,
}: CycleProgressProps) {
  // Implementation details...
}
```

**Key Features**:

- Cycle timeline visualization
- Phase indicators (Contribution/Bidding/Complete)
- Progress percentages
- Time remaining displays

**UI Elements**:

- Cycle number indicator
- Phase progress bar
- Deadline countdowns
- Pool amount display
- Winner announcement (if applicable)

### 3. MembersList Component

**Purpose**: Display fund members and their status
**Location**: `src/components/fund/MembersList.tsx`

```typescript
interface MembersListProps {
  contractAddress: string;
  members: MemberData[];
  currentUserAddress?: string;
  showDetails?: boolean;
}

export function MembersList({
  contractAddress,
  members,
  currentUserAddress,
  showDetails = false,
}: MembersListProps) {
  // Implementation details...
}
```

**Key Features**:

- Member address display (ENS support)
- Status indicators (contributed, bid, winner)
- Current user highlighting
- Responsive grid layout

**UI Elements**:

- Member cards with avatars
- Status badges
- Contribution indicators
- Bid status (if visible)
- Winner highlighting

### 4. TransactionHistory Component

**Purpose**: Display transaction history for a fund
**Location**: `src/components/fund/TransactionHistory.tsx`

```typescript
interface TransactionHistoryProps {
  contractAddress: string;
  events: ContractEvent[];
  showUserOnly?: boolean;
  maxItems?: number;
}

export function TransactionHistory({
  contractAddress,
  events,
  showUserOnly = false,
  maxItems = 10,
}: TransactionHistoryProps) {
  // Implementation details...
}
```

**Key Features**:

- Event type filtering
- User-specific filtering
- Pagination support
- Block explorer links

**UI Elements**:

- Event list with icons
- Timestamp formatting
- Transaction hash links
- Event details expansion
- Filter controls

---

## 📝 Form Components

### 1. NetworkSelector Component

**Purpose**: Select blockchain network
**Location**: `src/components/common/NetworkSelector.tsx`

```typescript
interface NetworkSelectorProps {
  selectedNetwork: number;
  onNetworkChange: (chainId: number) => void;
  supportedNetworks: number[];
}

export function NetworkSelector({
  selectedNetwork,
  onNetworkChange,
  supportedNetworks,
}: NetworkSelectorProps) {
  // Implementation details...
}
```

**Key Features**:

- Supported network filtering
- Network switching integration
- Status indicators
- Error handling

### 2. TokenSelector Component

**Purpose**: Select payment token (ETH/ERC20)
**Location**: `src/components/common/TokenSelector.tsx`

```typescript
interface TokenSelectorProps {
  selectedToken: "ETH" | string;
  onTokenChange: (token: string) => void;
  showBalance?: boolean;
}

export function TokenSelector({
  selectedToken,
  onTokenChange,
  showBalance = true,
}: TokenSelectorProps) {
  // Implementation details...
}
```

**Key Features**:

- Token list with logos
- Balance display
- Custom token input
- Validation

### 3. AmountInput Component

**Purpose**: Input amounts with validation
**Location**: `src/components/common/AmountInput.tsx`

```typescript
interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  token: string;
  placeholder?: string;
  maxValue?: bigint;
  showUSDValue?: boolean;
  error?: string;
}

export function AmountInput({
  value,
  onChange,
  token,
  placeholder,
  maxValue,
  showUSDValue = true,
  error,
}: AmountInputProps) {
  // Implementation details...
}
```

**Key Features**:

- Real-time validation
- USD conversion display
- Max amount handling
- Error state styling

---

## 🔄 Status Components

### 1. TransactionStatus Component

**Purpose**: Show transaction progress and status
**Location**: `src/components/common/TransactionStatus.tsx`

```typescript
interface TransactionStatusProps {
  transactionHash?: string;
  status: "pending" | "confirmed" | "failed";
  type: string;
  onClose?: () => void;
}

export function TransactionStatus({
  transactionHash,
  status,
  type,
  onClose,
}: TransactionStatusProps) {
  // Implementation details...
}
```

**Key Features**:

- Progress indicators
- Block explorer links
- Status animations
- Error details
- Retry functionality

**UI States**:

- Pending: Spinner with "Transaction pending..."
- Confirmed: Checkmark with "Transaction confirmed!"
- Failed: X with error message and retry button

### 2. LoadingStates Component

**Purpose**: Consistent loading states across app
**Location**: `src/components/common/LoadingStates.tsx`

```typescript
interface LoadingStateProps {
  type: "skeleton" | "spinner" | "pulse";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingState({
  type,
  size = "md",
  className,
}: LoadingStateProps) {
  // Implementation details...
}
```

**Variants**:

- Skeleton: For content placeholders
- Spinner: For actions/buttons
- Pulse: For cards/sections

### 3. ErrorBoundary Component

**Purpose**: Catch and display component errors
**Location**: `src/components/common/ErrorBoundary.tsx`

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
  onError?: (error: Error) => void;
}

export function ErrorBoundary({
  children,
  fallback: Fallback,
  onError,
}: ErrorBoundaryProps) {
  // Implementation details...
}
```

**Key Features**:

- Custom fallback components
- Error reporting
- Recovery options
- Development vs production modes

---

## 🎨 Layout Components

### 1. FundLayout Component

**Purpose**: Common layout for fund pages
**Location**: `src/components/layout/FundLayout.tsx`

```typescript
interface FundLayoutProps {
  contractAddress: string;
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
}

export function FundLayout({
  contractAddress,
  children,
  showSidebar = true,
  showHeader = true,
}: FundLayoutProps) {
  // Implementation details...
}
```

**Key Features**:

- Fund context provider
- Navigation breadcrumbs
- Sidebar with fund info
- Responsive design

### 2. DashboardLayout Component

**Purpose**: Layout for dashboard pages
**Location**: `src/components/layout/DashboardLayout.tsx`

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export function DashboardLayout({
  children,
  sidebar,
  header,
}: DashboardLayoutProps) {
  // Implementation details...
}
```

**Key Features**:

- Flexible grid system
- Responsive breakpoints
- Sidebar management
- Header integration

---

## 🎯 Component Integration Patterns

### 1. Container/Presenter Pattern

```typescript
// Container Component (handles logic)
export function FundDashboardContainer({ contractAddress }: { contractAddress: string }) {
  const fundData = useChitFund(contractAddress);
  const events = useContractEvents(contractAddress);

  return (
    <FundDashboardPresenter
      fundData={fundData}
      events={events}
      onContribute={fundData.contribute}
      onSubmitBid={fundData.submitBid}
    />
  );
}

// Presenter Component (handles UI)
export function FundDashboardPresenter({ fundData, events, onContribute, onSubmitBid }) {
  // Pure UI logic
}
```

### 2. Compound Component Pattern

```typescript
// Main component with sub-components
export function FundCard({ children, ...props }) {
  return (
    <div className="fund-card">
      {children}
    </div>
  );
}

FundCard.Header = function FundCardHeader({ children }) {
  return <div className="fund-card-header">{children}</div>;
};

FundCard.Body = function FundCardBody({ children }) {
  return <div className="fund-card-body">{children}</div>;
};

FundCard.Actions = function FundCardActions({ children }) {
  return <div className="fund-card-actions">{children}</div>;
};

// Usage
<FundCard>
  <FundCard.Header>
    <h3>{fundName}</h3>
  </FundCard.Header>
  <FundCard.Body>
    <p>{description}</p>
  </FundCard.Body>
  <FundCard.Actions>
    <Button>Join</Button>
  </FundCard.Actions>
</FundCard>
```

### 3. Render Props Pattern

```typescript
// Flexible data provider
export function FundDataProvider({
  contractAddress,
  children
}: {
  contractAddress: string;
  children: (data: FundData) => React.ReactNode;
}) {
  const fundData = useChitFund(contractAddress);

  return <>{children(fundData)}</>;
}

// Usage
<FundDataProvider contractAddress={address}>
  {(fundData) => (
    <div>
      <h1>{fundData.fundName}</h1>
      <p>Members: {fundData.members?.length}</p>
    </div>
  )}
</FundDataProvider>
```

---

## 📱 Responsive Design Specifications

### Breakpoints

```typescript
const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;
```

### Component Responsive Behavior

#### FundCard

- **Mobile (sm)**: Stack vertically, full width
- **Tablet (md)**: 2 columns
- **Desktop (lg+)**: 3-4 columns

#### FundDashboard

- **Mobile**: Single column, collapsible sections
- **Tablet**: Sidebar toggleable
- **Desktop**: Fixed sidebar, main content area

#### BiddingInterface

- **Mobile**: Full-screen modal
- **Tablet+**: Inline component

---

## 🎨 Design System Integration

### Color Scheme

```typescript
const colors = {
  primary: {
    50: "#eff6ff",
    500: "#3b82f6",
    900: "#1e3a8a",
  },
  success: {
    50: "#f0fdf4",
    500: "#22c55e",
    900: "#14532d",
  },
  warning: {
    50: "#fffbeb",
    500: "#f59e0b",
    900: "#92400e",
  },
  error: {
    50: "#fef2f2",
    500: "#ef4444",
    900: "#7f1d1d",
  },
} as const;
```

### Typography Scale

```typescript
const typography = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
} as const;
```

### Component Variants

```typescript
// Button variants
const buttonVariants = {
  default: "bg-primary-500 text-white hover:bg-primary-600",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  outline: "border border-primary-500 text-primary-500 hover:bg-primary-50",
  ghost: "text-primary-500 hover:bg-primary-50",
  destructive: "bg-error-500 text-white hover:bg-error-600",
} as const;

// Card variants
const cardVariants = {
  default: "bg-white border border-gray-200 rounded-lg shadow-sm",
  elevated: "bg-white border-0 rounded-lg shadow-md",
  outlined: "bg-transparent border-2 border-gray-200 rounded-lg",
} as const;
```

---

## 🧪 Component Testing Strategy

### Unit Testing

```typescript
// Example test for FundCard component
import { render, screen } from '@testing-library/react';
import { FundCard } from './FundCard';

describe('FundCard', () => {
  const mockFundInfo = {
    chitFundAddress: '0x123...',
    fundName: 'Test Fund',
    creator: '0xabc...',
    contributionAmount: BigInt('1000000000000000000'), // 1 ETH
    totalMembers: 5,
    paymentToken: '0x000...',
    createdAt: Date.now(),
    isActive: true,
  };

  it('renders fund information correctly', () => {
    render(<FundCard fundInfo={mockFundInfo} contractAddress="0x123..." />);

    expect(screen.getByText('Test Fund')).toBeInTheDocument();
    expect(screen.getByText(/1 ETH/)).toBeInTheDocument();
    expect(screen.getByText(/5 members/)).toBeInTheDocument();
  });

  it('shows join button when showActions is true', () => {
    render(
      <FundCard
        fundInfo={mockFundInfo}
        contractAddress="0x123..."
        showActions={true}
      />
    );

    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
// Example integration test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FundCreator } from './FundCreator';

describe('FundCreator Integration', () => {
  it('creates fund successfully', async () => {
    const mockOnSuccess = jest.fn();

    render(<FundCreator onSuccess={mockOnSuccess} />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/fund name/i), {
      target: { value: 'Test Fund' }
    });

    fireEvent.change(screen.getByLabelText(/contribution amount/i), {
      target: { value: '1.0' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create fund/i }));

    // Wait for success
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
```

---

## 📋 Implementation Checklist

### Phase 1: Core Components

- [ ] FundCreator with form validation
- [ ] FundCard with multiple variants
- [ ] FundJoiner with validation
- [ ] TransactionStatus with animations
- [ ] LoadingStates for all scenarios

### Phase 2: Interactive Components

- [ ] ContributionForm with deadline tracking
- [ ] BiddingInterface with real-time updates
- [ ] MembersList with status indicators
- [ ] CycleProgress with timeline
- [ ] TransactionHistory with filtering

### Phase 3: Layout & Navigation

- [ ] FundLayout with sidebar
- [ ] DashboardLayout responsive
- [ ] Navigation breadcrumbs
- [ ] Mobile-first responsive design
- [ ] Error boundaries throughout

### Phase 4: Polish & Testing

- [ ] Unit tests for all components
- [ ] Integration tests for flows
- [ ] Accessibility compliance
- [ ] Performance optimization
- [ ] Documentation completion

---

This comprehensive UI specification provides the blueprint for building all necessary components to integrate with your perfect smart contracts. Each component is designed to be reusable, testable, and maintainable! 🎨
