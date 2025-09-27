# CheatFund

CheatFund is a decentralized chit fund platform built on Flow blockchain that revolutionizes traditional community-based savings and lending systems. It combines the transparency and automation of blockchain technology with privacy-preserving identity verification using Anon Aadhaar protocol.

## 🎯 What is CheatFund?

CheatFund digitizes and decentralizes the traditional chit fund system:

- **Group Savings**: Members contribute a fixed amount regularly to a common pool
- **Fair Bidding**: Automated bidding system determines fund allocation each cycle
- **Transparent Process**: All operations are recorded on-chain for complete transparency
- **Privacy-First**: Identity verification without revealing personal data using zero-knowledge proofs

**Demo App**: [CheatFund Live Demo](https://landing-page-cheat-fund.vercel.app/) | [Source Code](https://github.com/ayush-that/cheatfund)

**Documentation**: CheatFund Documentation

## 🚀 Key Features

### 🔒 Privacy-Preserving Identity Verification

- **Anon Aadhaar Integration**: Verify Indian identity without revealing personal details
- **Zero-Knowledge Proofs**: Age verification (18+) using ZK circuits
- **No Data Storage**: Identity verification happens client-side

### 🏦 Decentralized Chit Fund Operations

- **Smart Contract Automation**: Eliminates intermediaries and manual processes
- **Transparent Bidding**: Fair, automated winner selection each cycle
- **Multi-Network Support**: Flow EVM, Ethereum, Polygon support
- **Real-time Updates**: Live fund status and member activities

### 💡 User-Friendly Experience

- **Web3 Wallet Integration**: Seamless MetaMask connection
- **Intuitive Dashboard**: Clean UI for fund management
- **Mobile Responsive**: Works on all devices
- **Transaction History**: Complete audit trail of all activities

## 🏗️ Architecture Overview

### Smart Contract Layer

- **ChitFundFactory**: Creates and manages multiple chit funds
- **ChitFund**: Core contract handling contributions, bidding, and distributions
- **Flow EVM**: Primary blockchain for low-cost, fast transactions

### Frontend Layer

- **Next.js 15**: Modern React framework with app router
- **TypeScript**: Type-safe development
- **Tailwind CSS + shadcn/ui**: Beautiful, accessible components
- **Ethers.js**: Blockchain interaction library

### Authentication & Privacy

- **Supabase Auth**: Web3 wallet authentication
- **Anon Aadhaar**: Privacy-preserving identity verification
- **Zustand**: Client-side state management

### Database

- **PostgreSQL**: User data and fund metadata
- **Prisma**: Type-safe database ORM
- **Vercel**: Serverless deployment

## 📦 Project Structure

```
cheatfund/
├── contracts/                  # Smart contracts (Solidity)
│   ├── ChitFund.sol           # Core chit fund logic
│   ├── ChitFundFactory.sol    # Factory for creating funds
│   └── scripts/               # Deployment scripts
├── src/
│   ├── app/                   # Next.js app router
│   │   ├── create/           # Fund creation page
│   │   ├── join/             # Fund joining pages
│   │   └── fund/             # Fund management pages
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── dashboard.tsx     # Main dashboard
│   │   └── aadhar-verification.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── contracts/        # Smart contract hooks
│   │   └── use-web3-auth.ts  # Web3 authentication
│   ├── lib/                  # Utility libraries
│   │   ├── contracts.ts      # Contract configurations
│   │   ├── wallet.ts         # Wallet integration
│   │   └── web3.ts          # Web3 utilities
│   └── stores/              # State management
├── prisma/                   # Database schema
├── docs/                     # Documentation
└── test/                     # Smart contract tests
```

## 🛠️ Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **PostgreSQL** database
- **Flow wallet** for testing
- **Foundry** for smart contract development

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/ayush-that/cheatfund.git
cd cheatfund
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Environment setup**

```bash
# Copy environment template
cp .env.example .env.local

# Configure your environment variables
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_key"
NEXT_PUBLIC_CHITFUND_FACTORY_ADDRESS="0x..." # After deployment
NEXT_PUBLIC_FLOW_TESTNET_RPC="https://testnet.evm.nodes.onflow.org"
```

4. **Database setup**

```bash
# Run Prisma migrations
pnpm db:migrate

# Generate Prisma client
pnpm postinstall
```

5. **Smart contract deployment**

```bash
# Deploy to Flow Testnet
make deploy-flow-testnet

# Or deploy locally for development
make deploy-local
```

6. **Start development server**

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Smart Contract Integration

### Core Contracts

#### ChitFund Contract

- **Purpose**: Core chit fund operations
- **Key Functions**:
  - `joinFund()` - Join an existing fund
  - `contribute()` - Make monthly contribution
  - `submitBid()` - Submit bid for current cycle
  - `selectWinner()` - Automated winner selection
  - `distributeFunds()` - Distribute funds to winner

#### ChitFundFactory Contract

- **Purpose**: Create and manage multiple chit funds
- **Key Functions**:
  - `createChitFund()` - Create new fund
  - `getAllChitFunds()` - Get all funds
  - `getUserChitFunds()` - Get user's funds

### Contract Integration Examples

```typescript
// Create a new chit fund
const { createChitFund } = useChitFundFactory();

const fundData = await createChitFund({
  fundName: "Tech Professionals Fund",
  contributionAmount: "1.0", // in ETH
  totalMembers: 10,
});

// Join an existing fund
const { joinFund } = useChitFund(contractAddress);
await joinFund();

// Make contribution
const { contribute } = useChitFund(contractAddress);
await contribute();
```

## 🧪 Testing & Development

### Smart Contract Commands

```shell
# Build contracts
forge build

# Run tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Format code
forge fmt

# Coverage report
forge coverage

# Deploy to local testnet
anvil

# Deploy contracts
forge script scripts/DeployChitFund.s.sol --rpc-url <rpc_url> --private-key <private_key>
```

### Frontend Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Run tests
pnpm test

# Database operations
pnpm db:push        # Push schema changes
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio
```

## 🚀 Deployment

### Smart Contracts

```bash
# Deploy to different networks
make deploy-flow-testnet    # Flow Testnet
make deploy-sepolia        # Ethereum Sepolia
make deploy-mumbai         # Polygon Mumbai
make deploy-base-sepolia   # Base Sepolia
```

### Frontend Deployment

```bash
# Deploy to Vercel
vercel deploy

# Or build for production
pnpm build
pnpm start
```

## 📚 How It Works

### 1. Identity Verification

Users verify their Indian identity using Anon Aadhaar protocol:

- Client-side proof generation using ZK circuits
- Age verification (18+) without revealing personal data
- No sensitive information stored on servers

### 2. Fund Creation

Organizers create chit funds specifying:

- Contribution amount per cycle
- Number of members
- Duration and cycle frequency
- Payment token (ETH or ERC20)

### 3. Member Participation

Members join funds and participate in cycles:

- Regular contributions to the common pool
- Bidding process for fund allocation
- Automated winner selection based on lowest bid
- Transparent fund distribution

### 4. Cycle Management

Smart contracts automatically handle:

- Contribution collection
- Bidding period management
- Winner selection algorithm
- Fund distribution to winner
- Cycle progression

## 🌐 Supported Networks

| Network          | Chain ID | RPC URL                                     | Status       |
| ---------------- | -------- | ------------------------------------------- | ------------ |
| Flow Testnet     | 545      | https://testnet.evm.nodes.onflow.org        | ✅ Active    |
| Flow Mainnet     | 747      | https://mainnet.evm.nodes.onflow.org        | 🚧 Planned   |
| Ethereum Sepolia | 11155111 | https://ethereum-sepolia-rpc.publicnode.com | ✅ Supported |
| Polygon Mumbai   | 80001    | https://rpc-mumbai.maticvigil.com           | ✅ Supported |

## 🔒 Security Features

- **Multi-signature Wallets**: For large fund management
- **Time-locked Withdrawals**: Prevent rush withdrawals
- **Audit Trail**: Complete transaction history on-chain
- **Emergency Pause**: Admin controls for crisis management
- **Comprehensive Testing**: 95%+ test coverage

## 🎪 Demo Flow

1. **Identity Verification**: Connect wallet + Aadhaar verification
2. **Fund Discovery**: Browse available public funds
3. **Join Fund**: Participate in a fund with other members
4. **Contribute**: Make monthly contributions to the pool
5. **Bid**: Submit bids when eligible for fund allocation
6. **Receive Funds**: Automatic distribution to cycle winner
7. **Track Progress**: Monitor fund status and member activities

## 📊 Technical Metrics

- **Transaction Finality**: < 3 seconds (Flow blockchain)
- **Gas Costs**: < $0.01 per transaction
- **User Onboarding**: < 2 minutes with Aadhaar
- **System Uptime**: 99.9% availability target

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- **TypeScript**: Strict type checking enabled
- **ESLint + Prettier**: Automated code formatting
- **Conventional Commits**: Structured commit messages
- **Test Coverage**: Minimum 80% coverage for new features

## 📞 Support & Community

### Resources

- **GitHub Repository**: [CheatFund Source Code](https://github.com/ayush-that/cheatfund)
- **Live Demo**: [CheatFund Demo](https://landing-page-cheat-fund.vercel.app/)
- **Documentation**: Project Docs

## 🔮 Roadmap

### Phase 1 (Current) - MVP ✅

- [x] Core smart contracts
- [x] Basic frontend interface
- [x] Anon Aadhaar integration
- [x] Flow Testnet deployment

### Phase 2 - Enhanced Features 🚧

- [ ] Multi-token support
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Mainnet deployment

### Phase 3 - Scale & Expand 📋

- [ ] Cross-chain compatibility
- [ ] Insurance integration
- [ ] Governance token launch
- [ ] Enterprise partnerships

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)

---
