# Smart Data Fetching Guide

## Overview

This guide explains the new smart data fetching system that replaces the problematic 30000ms intervals throughout the application. The new system provides:

- **Event-driven updates** instead of fixed polling intervals
- **Smart caching** with TTL and invalidation strategies
- **Connection state awareness** to pause/resume fetching
- **Deduplication** to prevent multiple simultaneous requests
- **Background refresh** to keep data fresh without user interaction
- **Retry logic** with exponential backoff

## Key Components

### 1. DataManager (`src/lib/data-manager.ts`)

The central data management system that handles:

- Caching with configurable TTL
- Request deduplication
- Background refresh
- Retry logic
- Event emission for data updates

```typescript
import { dataManager, CACHE_KEYS } from "~/lib/data-manager";

// Get data with caching
const data = await dataManager.get(
  CACHE_KEYS.FUND_DATA(contractAddress),
  () => fetchFundData(),
  { ttl: 30000, retries: 3 },
);

// Start polling with smart refresh
const cleanup = dataManager.startPolling(
  CACHE_KEYS.FUND_DATA(contractAddress),
  () => fetchFundData(),
  15000, // 15 seconds instead of 30
  { ttl: 30000 },
);
```

### 2. ConnectionManager (`src/lib/connection-manager.ts`)

Monitors connection state and page visibility to optimize data fetching:

```typescript
import { connectionManager } from "~/lib/connection-manager";

// Check if we should fetch data
if (connectionManager.shouldFetch()) {
  // Only fetch when online and page is visible
}

// Listen for connection changes
connectionManager.onStateChange((state) => {
  if (state.isOnline && state.isVisible) {
    // Refresh stale data when coming back online
  }
});
```

### 3. Enhanced Hooks

#### useChitFundEnhanced

Replaces the original `useChitFund` with smart caching and event-driven updates:

```typescript
import { useChitFundEnhanced } from "~/hooks/contracts/useChitFundEnhanced";

const { fundData, loading, error, lastUpdate, refreshData } =
  useChitFundEnhanced(contractAddress, {
    enablePolling: true,
    pollingInterval: 15000, // 15 seconds instead of 30
    enableEventListening: true,
    cacheTTL: 30000,
  });
```

#### useFlowBalanceEnhanced

Enhanced Flow balance fetching with smart caching:

```typescript
import { useFlowBalanceEnhanced } from "~/hooks/useFlowBalanceEnhanced";

const { balance, loading, error, lastUpdate, refetch } = useFlowBalanceEnhanced(
  address,
  {
    refreshInterval: 60000, // 1 minute instead of 30 seconds
    enablePolling: true,
    cacheTTL: 60000,
  },
);
```

#### useSmartDataFetching

Generic hook for any data fetching needs:

```typescript
import { useSmartDataFetching, CACHE_KEYS } from "~/hooks/useSmartDataFetching";

const { data, loading, error, lastUpdate, refetch, invalidate } =
  useSmartDataFetching(
    CACHE_KEYS.FUND_DATA(contractAddress),
    () => fetchFundData(),
    {
      ttl: 30000,
      enablePolling: true,
      pollingInterval: 15000,
      enableEventListening: true,
    },
  );
```

## Migration Guide

### Before (Problematic 30000ms intervals)

```typescript
// OLD: Fixed 30-second intervals everywhere
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

### After (Smart data fetching)

```typescript
// NEW: Event-driven with smart caching
const { data, loading, error, refetch } = useSmartDataFetching(
  cacheKey,
  fetcher,
  {
    ttl: 30000,
    enablePolling: true,
    pollingInterval: 15000, // More frequent but smarter
    enableEventListening: true,
  },
);
```

## Benefits

### 1. **No More Data Disappearing**

- Smart caching prevents data loss
- Background refresh keeps data fresh
- Event-driven updates provide real-time changes

### 2. **Better Performance**

- Request deduplication prevents duplicate calls
- Connection state awareness pauses fetching when offline
- TTL-based caching reduces unnecessary requests

### 3. **Improved User Experience**

- Faster initial loads with cached data
- Real-time updates through event listening
- Graceful handling of network issues

### 4. **Resource Efficiency**

- Pauses fetching when page is not visible
- Stops polling when offline
- Configurable intervals based on data importance

## Configuration

### Cache TTL Settings

- **Fund data**: 30 seconds (frequently changing)
- **Flow balance**: 60 seconds (less frequently changing)
- **Public funds**: 60 seconds (moderately changing)
- **User data**: 120 seconds (rarely changing)

### Polling Intervals

- **Critical data**: 15 seconds (fund status, contributions)
- **Important data**: 30 seconds (member lists, balances)
- **Background data**: 60 seconds (public funds, statistics)

### Event Listening

Enable for data that changes due to user actions:

- Fund contributions
- Bid submissions
- Member joins/leaves
- Winner selections

## Best Practices

### 1. **Use Appropriate Cache Keys**

```typescript
// Good: Specific and descriptive
CACHE_KEYS.FUND_DATA(contractAddress);
CACHE_KEYS.FUND_MEMBERS(contractAddress);
CACHE_KEYS.USER_FUNDS(address);

// Bad: Generic or unclear
("fund-data");
("members");
("user-info");
```

### 2. **Configure TTL Based on Data Volatility**

```typescript
// High volatility (frequently changing)
{ ttl: 15000, pollingInterval: 10000 }

// Medium volatility
{ ttl: 30000, pollingInterval: 15000 }

// Low volatility (rarely changing)
{ ttl: 120000, pollingInterval: 60000 }
```

### 3. **Enable Event Listening for User Actions**

```typescript
// Enable for data that changes due to user interactions
{
  enableEventListening: true,
  enablePolling: true // Fallback for missed events
}
```

### 4. **Handle Errors Gracefully**

```typescript
const { data, loading, error, refetch } = useSmartDataFetching(
  key,
  fetcher,
  {
    retries: 3,
    retryDelay: 1000
  }
);

if (error) {
  // Show error state with retry option
  return <ErrorState onRetry={refetch} />;
}
```

## Monitoring and Debugging

### Cache Statistics

```typescript
import { dataManager } from "~/lib/data-manager";

const stats = dataManager.getCacheStats();
console.log("Cache stats:", stats);
```

### Event Monitoring

```typescript
dataManager.on("data:updated", (key, data) => {
  console.log("Data updated:", key, data);
});

dataManager.on("fetch:error", (key, error) => {
  console.error("Fetch error:", key, error);
});
```

### Connection State Monitoring

```typescript
import { connectionManager } from "~/lib/connection-manager";

connectionManager.onStateChange((state) => {
  console.log("Connection state:", state);
});
```

## Troubleshooting

### Data Not Updating

1. Check if event listening is enabled
2. Verify cache TTL settings
3. Ensure connection state is online
4. Check for fetch errors in console

### Performance Issues

1. Reduce polling frequency for non-critical data
2. Increase TTL for stable data
3. Disable polling for data that only changes on user actions
4. Use event listening instead of polling where possible

### Memory Leaks

1. Ensure cleanup functions are called
2. Remove event listeners on unmount
3. Clear intervals and timeouts
4. Use the provided cleanup mechanisms

## Future Enhancements

1. **WebSocket Integration**: Real-time updates via WebSocket
2. **Service Worker Caching**: Offline data persistence
3. **Predictive Prefetching**: Load data before it's needed
4. **Adaptive Polling**: Adjust intervals based on data change frequency
5. **Cross-tab Synchronization**: Share cache between browser tabs
