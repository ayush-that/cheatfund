"use client";

import { EventEmitter } from "events";
import { connectionManager } from "./connection-manager";

export interface DataCacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  stale: boolean;
}

export interface FetchOptions {
  ttl?: number; // Time to live in milliseconds
  retries?: number;
  retryDelay?: number;
  backgroundRefresh?: boolean;
  forceRefresh?: boolean;
}

export interface DataManagerConfig {
  defaultTTL: number;
  maxRetries: number;
  retryDelay: number;
  backgroundRefreshThreshold: number; // Refresh when data is X% through its TTL
}

class DataManager extends EventEmitter {
  private cache = new Map<string, DataCacheEntry>();
  private activeFetches = new Map<string, Promise<any>>();
  private intervals = new Map<string, NodeJS.Timeout>();
  private config: DataManagerConfig;
  private connectionUnsubscribe: (() => void) | null = null;

  constructor(config: Partial<DataManagerConfig> = {}) {
    super();
    this.config = {
      defaultTTL: 60000, // 1 minute default
      maxRetries: 3,
      retryDelay: 1000,
      backgroundRefreshThreshold: 0.8, // Refresh when 80% through TTL
      ...config,
    };

    // Set up connection state monitoring
    this.connectionUnsubscribe = connectionManager.onStateChange((state) => {
      if (state.isOnline && state.isVisible) {
        this.refreshStaleData();
      }
    });

    // Clean up expired entries every 30 seconds
    setInterval(() => this.cleanupExpiredEntries(), 30000);
  }

  private cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.emit("cache:expired", key);
      }
    }
  }

  private isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;

    const age = Date.now() - entry.timestamp;
    const staleThreshold = entry.ttl * this.config.backgroundRefreshThreshold;
    return age > staleThreshold;
  }

  private shouldRefresh(key: string, options: FetchOptions = {}): boolean {
    if (options.forceRefresh) return true;

    const entry = this.cache.get(key);
    if (!entry) return true;

    const age = Date.now() - entry.timestamp;
    return age > entry.ttl;
  }

  private async fetchWithRetry<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: FetchOptions = {},
  ): Promise<T> {
    const {
      retries = this.config.maxRetries,
      retryDelay = this.config.retryDelay,
    } = options;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await fetcher();
        this.emit("fetch:success", key, result);
        return result;
      } catch (error) {
        this.emit("fetch:error", key, error, attempt);

        if (attempt === retries) {
          throw error;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt)),
        );
      }
    }

    throw new Error("Max retries exceeded");
  }

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: FetchOptions = {},
  ): Promise<T> {
    const { ttl = this.config.defaultTTL, forceRefresh = false } = options;

    // Return cached data if available and not stale
    if (!forceRefresh && !this.shouldRefresh(key, options)) {
      const entry = this.cache.get(key);
      if (entry) {
        this.emit("cache:hit", key, entry.data);
        return entry.data;
      }
    }

    // Check if there's already an active fetch for this key
    if (this.activeFetches.has(key)) {
      this.emit("fetch:dedupe", key);
      return this.activeFetches.get(key);
    }

    // Start new fetch
    const fetchPromise = this.fetchWithRetry(key, fetcher, options);
    this.activeFetches.set(key, fetchPromise);

    try {
      const data = await fetchPromise;

      // Cache the result
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
        stale: false,
      });

      this.emit("data:updated", key, data);
      return data;
    } finally {
      this.activeFetches.delete(key);
    }
  }

  set<T>(key: string, data: T, ttl: number = this.config.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      stale: false,
    });
    this.emit("data:set", key, data);
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.emit("data:invalidated", key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.emit("data:invalidated", key);
      }
    }
  }

  startPolling<T>(
    key: string,
    fetcher: () => Promise<T>,
    interval: number,
    options: FetchOptions = {},
  ): () => void {
    const { ttl = this.config.defaultTTL } = options;

    // Clear existing interval for this key
    this.stopPolling(key);

    const poll = async () => {
      if (!connectionManager.shouldFetch()) return;

      try {
        const data = await this.get(key, fetcher, {
          ...options,
          forceRefresh: true,
        });
        this.emit("poll:success", key, data);
      } catch (error) {
        this.emit("poll:error", key, error);
      }
    };

    // Initial fetch
    poll();

    // Set up interval
    const intervalId = setInterval(poll, interval);
    this.intervals.set(key, intervalId);

    this.emit("polling:started", key, interval);

    // Return cleanup function
    return () => this.stopPolling(key);
  }

  stopPolling(key: string): void {
    const interval = this.intervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(key);
      this.emit("polling:stopped", key);
    }
  }

  stopAllPolling(): void {
    for (const [key, interval] of this.intervals.entries()) {
      clearInterval(interval);
      this.emit("polling:stopped", key);
    }
    this.intervals.clear();
  }

  async refreshStaleData(): Promise<void> {
    const staleKeys = Array.from(this.cache.keys()).filter((key) =>
      this.isStale(key),
    );

    for (const key of staleKeys) {
      const entry = this.cache.get(key);
      if (entry) {
        entry.stale = true;
        this.emit("data:stale", key, entry.data);
      }
    }
  }

  getCacheStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl,
      stale: entry.stale,
      expired: now - entry.timestamp > entry.ttl,
    }));

    return {
      totalEntries: this.cache.size,
      activeFetches: this.activeFetches.size,
      activePolling: this.intervals.size,
      entries,
    };
  }

  clear(): void {
    this.cache.clear();
    this.stopAllPolling();
    this.emit("cache:cleared");
  }

  destroy(): void {
    this.clear();
    this.removeAllListeners();

    if (this.connectionUnsubscribe) {
      this.connectionUnsubscribe();
    }
  }
}

// Global instance
export const dataManager = new DataManager({
  defaultTTL: 30000, // 30 seconds default TTL
  backgroundRefreshThreshold: 0.7, // Refresh when 70% through TTL
});

// React hook for using the data manager
export function useDataManager() {
  return dataManager;
}

// Utility function to create cache keys
export function createCacheKey(
  prefix: string,
  ...parts: (string | number)[]
): string {
  return [prefix, ...parts].join(":");
}

// Predefined cache key patterns
export const CACHE_KEYS = {
  FUND_DATA: (contractAddress: string) =>
    createCacheKey("fund", contractAddress),
  FUND_MEMBERS: (contractAddress: string) =>
    createCacheKey("fund", contractAddress, "members"),
  FUND_EVENTS: (contractAddress: string) =>
    createCacheKey("fund", contractAddress, "events"),
  USER_FUNDS: (address: string) => createCacheKey("user", address, "funds"),
  FLOW_BALANCE: (address: string) => createCacheKey("balance", "flow", address),
  PUBLIC_FUNDS: () => createCacheKey("funds", "public"),
} as const;
