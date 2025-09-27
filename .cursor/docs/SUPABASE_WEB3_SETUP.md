# Supabase Web3 Authentication Setup Guide

## 🚨 **CRITICAL SETUP STEPS**

The wallet address not showing is likely due to **Supabase Web3 authentication not being properly enabled**. Follow these steps exactly:

### 1. **Enable Web3 Authentication in Supabase Dashboard**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Scroll down to find **"Web3 Wallet"**
5. **Enable** the Web3 Wallet provider
6. Click **Save**

### 2. **Configure Web3 Settings (CLI Method)**

If using Supabase CLI, add this to your `supabase/config.toml`:

```toml
[auth.web3.ethereum]
enabled = true

[auth.web3.solana]
enabled = true  # Optional, only if you want Solana support
```

### 3. **Set Environment Variables**

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. **Configure Redirect URLs**

In Supabase Dashboard → Authentication → URL Configuration:

Add these URLs:

- `http://localhost:3000/` (development)
- `https://yourdomain.com/` (production)

## 🔍 **Debugging Steps**

### Step 1: Check Browser Console

After authentication, check the browser console for these logs:

- "Connected wallet address: 0x..."
- "Supabase Web3 auth success: {...}"
- "User data structure: {...}"
- "Complete user object: {...}"

### Step 2: Verify Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Find your authenticated user
3. Check the `user_metadata` field
4. Look for `wallet_address` or similar fields

### Step 3: Expected Data Structure

After successful Web3 auth, the user object should contain:

```json
{
  "id": "user-uuid",
  "user_metadata": {
    "wallet_address": "0x...",
    "provider": "web3"
  },
  "identities": [
    {
      "identity_data": {
        "address": "0x...",
        "chain": "ethereum"
      }
    }
  ]
}
```

## 🛠 **Troubleshooting Common Issues**

### Issue 1: "signInWithWeb3 is not a function"

**Cause**: Web3 provider not enabled in Supabase
**Solution**: Enable Web3 Wallet provider in dashboard

### Issue 2: Wallet address shows "N/A"

**Cause**: Web3 authentication not properly configured
**Solutions**:

1. Enable Web3 provider in Supabase dashboard
2. Check console logs for user data structure
3. Verify wallet connection is successful

### Issue 3: "No Ethereum wallet found"

**Cause**: MetaMask or wallet not installed
**Solution**: Install MetaMask browser extension

### Issue 4: Authentication fails silently

**Causes**:

1. Web3 provider not enabled
2. Incorrect redirect URLs
3. Network issues

**Solutions**:

1. Check Supabase dashboard configuration
2. Verify redirect URLs match exactly
3. Check browser network tab for errors

## 📋 **Verification Checklist**

- [ ] Web3 Wallet provider enabled in Supabase dashboard
- [ ] Environment variables set correctly
- [ ] Redirect URLs configured
- [ ] MetaMask installed and unlocked
- [ ] Browser console shows connection logs
- [ ] User appears in Supabase Users table

## 🔧 **Manual Testing**

1. **Test Wallet Connection**:

   ```javascript
   // In browser console
   await window.ethereum.request({ method: "eth_requestAccounts" });
   ```

2. **Test Supabase Connection**:

   ```javascript
   // In browser console
   console.log(supabase.supabaseUrl, supabase.supabaseKey);
   ```

3. **Test Web3 Auth**:
   ```javascript
   // Should not throw "not a function" error
   console.log(typeof supabase.auth.signInWithWeb3);
   ```

## 🚀 **Expected Flow**

1. User clicks "Connect Wallet"
2. MetaMask popup appears
3. User approves connection
4. Console shows: "Connected wallet address: 0x..."
5. User signs authentication message
6. Console shows: "Supabase Web3 auth success"
7. Dashboard displays actual wallet address
8. User appears in Supabase Users table

## 📞 **Getting Help**

If still having issues:

1. **Check Supabase Status**: https://status.supabase.com
2. **Supabase Discord**: https://discord.supabase.com
3. **GitHub Issues**: https://github.com/supabase/supabase/issues
4. **Documentation**: https://supabase.com/docs/guides/auth/auth-web3

## 🎯 **Key Points**

- **Web3 authentication MUST be enabled in Supabase dashboard**
- Wallet address should be in `user.user_metadata.wallet_address`
- EIP-4361 standard is used for message signing
- Debugging logs are essential for troubleshooting
- Test with a fresh browser session if having issues
