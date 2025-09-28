"use client";

import { EventEmitter } from "events";

export interface ConnectionState {
  isOnline: boolean;
  isVisible: boolean;
  lastOnlineTime: Date | null;
  lastOfflineTime: Date | null;
  reconnectAttempts: number;
}

class ConnectionManager extends EventEmitter {
  private state: ConnectionState = {
    isOnline: true,
    isVisible: true,
    lastOnlineTime: new Date(),
    lastOfflineTime: null,
    reconnectAttempts: 0,
  };

  private reconnectTimeout: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (typeof window === "undefined") return;

    // Online/offline events
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));

    // Visibility change events
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this),
    );

    // Page focus/blur events
    window.addEventListener("focus", this.handleFocus.bind(this));
    window.addEventListener("blur", this.handleBlur.bind(this));

    // Before unload
    window.addEventListener("beforeunload", this.handleBeforeUnload.bind(this));
  }

  private handleOnline() {
    this.state.isOnline = true;
    this.state.lastOnlineTime = new Date();
    this.state.reconnectAttempts = 0;

    this.clearReconnectTimeout();
    this.emit("online");
    this.emit("state:changed", this.state);
  }

  private handleOffline() {
    this.state.isOnline = false;
    this.state.lastOfflineTime = new Date();

    this.emit("offline");
    this.emit("state:changed", this.state);
  }

  private handleVisibilityChange() {
    this.state.isVisible = !document.hidden;
    this.emit("visibility:changed", this.state.isVisible);
    this.emit("state:changed", this.state);
  }

  private handleFocus() {
    this.state.isVisible = true;
    this.emit("focus");
    this.emit("state:changed", this.state);
  }

  private handleBlur() {
    this.state.isVisible = false;
    this.emit("blur");
    this.emit("state:changed", this.state);
  }

  private handleBeforeUnload() {
    this.emit("beforeunload");
  }

  private clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private scheduleReconnect() {
    if (this.state.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit("reconnect:failed");
      return;
    }

    this.state.reconnectAttempts++;
    const delay =
      this.reconnectDelay * Math.pow(2, this.state.reconnectAttempts - 1);

    this.reconnectTimeout = setTimeout(() => {
      this.emit("reconnect:attempt", this.state.reconnectAttempts);
      this.scheduleReconnect();
    }, delay);
  }

  // Public methods
  getState(): ConnectionState {
    return { ...this.state };
  }

  isConnected(): boolean {
    return this.state.isOnline && this.state.isVisible;
  }

  shouldFetch(): boolean {
    return this.isConnected();
  }

  onStateChange(callback: (state: ConnectionState) => void) {
    this.on("state:changed", callback);
    return () => this.off("state:changed", callback);
  }

  onOnline(callback: () => void) {
    this.on("online", callback);
    return () => this.off("online", callback);
  }

  onOffline(callback: () => void) {
    this.on("offline", callback);
    return () => this.off("offline", callback);
  }

  onVisibilityChange(callback: (isVisible: boolean) => void) {
    this.on("visibility:changed", callback);
    return () => this.off("visibility:changed", callback);
  }

  onFocus(callback: () => void) {
    this.on("focus", callback);
    return () => this.off("focus", callback);
  }

  onBlur(callback: () => void) {
    this.on("blur", callback);
    return () => this.off("blur", callback);
  }

  onReconnectAttempt(callback: (attempt: number) => void) {
    this.on("reconnect:attempt", callback);
    return () => this.off("reconnect:attempt", callback);
  }

  onReconnectFailed(callback: () => void) {
    this.on("reconnect:failed", callback);
    return () => this.off("reconnect:failed", callback);
  }

  destroy() {
    this.clearReconnectTimeout();
    this.removeAllListeners();

    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline.bind(this));
      window.removeEventListener("offline", this.handleOffline.bind(this));
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange.bind(this),
      );
      window.removeEventListener("focus", this.handleFocus.bind(this));
      window.removeEventListener("blur", this.handleBlur.bind(this));
      window.removeEventListener(
        "beforeunload",
        this.handleBeforeUnload.bind(this),
      );
    }
  }
}

// Global instance
export const connectionManager = new ConnectionManager();

// React hook for using the connection manager
export function useConnectionManager() {
  return connectionManager;
}
