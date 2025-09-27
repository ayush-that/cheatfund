# Web3 Authentication Setup Guide

This project implements Web3 authentication using Supabase and Ethereum wallets.

## Prerequisites

1. **Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Ethereum Wallet**: Users need MetaMask or another Ethereum wallet installed

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database (existing)
DATABASE_URL="postgresql://postgres:password@localhost:5432/cheatfund"
```

### 2. Supabase Configuration

#### Enable Web3 Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Web3 Wallet** provider
4. Configure the following settings:

```toml
[auth.web3.ethereum]
enabled = true
```

#### Security Configuration (Recommended)

Add rate limiting and CAPTCHA protection:

```toml
[auth.rate_limit]
web3 = 30  # Number of Web3 logins allowed per 5-minute interval per IP

[auth.captcha]
enabled = true
provider = "hcaptcha"
secret = "your-hcaptcha-secret-key"
```

#### Redirect URLs

Add your application URLs to the allowed redirect URLs:

- `http://localhost:3000/` (for development)
- `https://yourdomain.com/` (for production)

### 3. How It Works

#### Authentication Flow

1. **Wallet Detection**: The app checks if `window.ethereum` is available
2. **Wallet Connection**: User connects their Ethereum wallet
3. **Message Signing**: User signs a message using EIP-4361 standard
4. **Supabase Authentication**: The signed message is verified by Supabase
5. **Session Creation**: Supabase creates a user session with wallet address

#### User Data Structure

When a user authenticates with Web3, Supabase stores:

```json
{
  "id": "user-uuid",
  "user_metadata": {
    "wallet_address": "0x...",
    "provider": "ethereum"
  },
  "app_metadata": {
    "provider": "web3",
    "providers": ["web3"]
  }
}
```

### 4. Features

- ✅ **Ethereum Wallet Authentication**: Connect with MetaMask or other wallets
- ✅ **EIP-4361 Standard**: Secure message signing for authentication
- ✅ **Session Management**: Automatic session handling with Supabase
- ✅ **User Dashboard**: Display user information and session details
- ✅ **Error Handling**: Comprehensive error handling for wallet issues
- ✅ **TypeScript Support**: Full TypeScript support with proper types

### 5. Usage

#### For Users

1. Visit the application
2. Click "Connect Wallet"
3. Approve the connection in your wallet
4. Sign the authentication message
5. Access your dashboard

#### For Developers

The authentication state is managed by the `useWeb3Auth` hook:

```typescript
const { user, session, loading, error, signInWithWeb3, signOut } =
  useWeb3Auth();
```

### 6. Security Considerations

- **Rate Limiting**: Configure rate limits to prevent abuse
- **CAPTCHA**: Enable CAPTCHA for additional security
- **Redirect URLs**: Only allow trusted domains
- **Message Validation**: Supabase validates the signed message
- **Session Expiry**: Sessions automatically expire

### 7. Troubleshooting

#### Common Issues

1. **"No Ethereum wallet found"**
   - User needs to install MetaMask or another Ethereum wallet
   - Ensure the wallet is unlocked

2. **"User rejected the request"**
   - User cancelled the wallet connection
   - User cancelled the message signing

3. **"Invalid signature"**
   - The signed message doesn't match what Supabase expects
   - Check if the wallet is connected to the correct network

#### Development Tips

- Use browser developer tools to inspect wallet interactions
- Check Supabase logs for authentication errors
- Test with different wallet providers
- Verify network connectivity

### 8. Production Deployment

1. Set up production Supabase project
2. Configure production redirect URLs
3. Enable security features (rate limiting, CAPTCHA)
4. Set up monitoring and logging
5. Test with real wallets on mainnet

## API Reference

### useWeb3Auth Hook

```typescript
interface Web3AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface Web3AuthActions {
  signInWithWeb3: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

### Supabase Client

```typescript
import { supabase } from "~/lib/supabase";

// Sign in with Web3
const { data, error } = await supabase.auth.signInWithWeb3({
  chain: "ethereum",
  statement: "I accept the Terms of Service and Privacy Policy",
});
```

## Support

For issues related to:

- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Web3 Authentication**: Check [Supabase Web3 Auth Guide](https://supabase.com/docs/guides/auth/auth-web3)
- **EIP-4361**: Check [EIP-4361 Specification](https://eips.ethereum.org/EIPS/eip-4361)
