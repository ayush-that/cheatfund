"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACTS, CHITFUND_EVENTS } from "~/lib/contracts";
import { getProvider } from "~/lib/web3";

export interface ContractEvent {
  id: string;
  type: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  args: any[];
  data: Record<string, any>;
}

export function useContractEvents(
  contractAddress: string,
  eventTypes?: string[],
) {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseContractEvent = useCallback(
    (
      log: ethers.Log,
      eventInterface: ethers.Interface,
    ): ContractEvent | null => {
      try {
        const parsed = eventInterface.parseLog(log);
        if (!parsed) return null;

        return {
          id: `${log.transactionHash}-${log.index}`,
          type: parsed.name,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          timestamp: Date.now(), // In real app, get from block timestamp
          args: parsed.args.slice(),
          data: Object.fromEntries(
            parsed.fragment.inputs.map((input, i) => [
              input.name,
              parsed.args[i],
            ]),
          ),
        };
      } catch (error) {
        return null;
      }
    },
    [],
  );

  const fetchHistoricalEvents = useCallback(async () => {
    if (!contractAddress) return;

    try {
      setLoading(true);
      setError(null);

      const provider = getProvider();
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACTS.CHITFUND.abi,
        provider,
      );

      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000);
      const filters = eventTypes || Object.values(CHITFUND_EVENTS);
      const eventLogs: ethers.Log[] = [];

      for (const eventType of filters) {
        try {
          const filter = contract.filters[eventType]();
          const logs = await contract.queryFilter(
            filter,
            fromBlock,
            currentBlock,
          );
          eventLogs.push(...logs);
        } catch (error) {}
      }

      const parsedEvents = eventLogs
        .map((log) => parseContractEvent(log, contract.interface))
        .filter(Boolean) as ContractEvent[];

      parsedEvents.sort((a, b) => b.blockNumber - a.blockNumber);

      setEvents(parsedEvents);
    } catch (error: any) {
      setError(error.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, [contractAddress, eventTypes, parseContractEvent]);

  const startEventListener = useCallback(() => {
    if (!contractAddress) return;

    const provider = getProvider();
    const contract = new ethers.Contract(
      contractAddress,
      CONTRACTS.CHITFUND.abi,
      provider,
    );

    const filters = eventTypes || Object.values(CHITFUND_EVENTS);
    const listeners: Array<{ filter: any; handler: any }> = [];

    filters.forEach((eventType) => {
      try {
        const filter = contract.filters[eventType]();
        const handler = (...args: any[]) => {
          const log = args[args.length - 1];
          const event = parseContractEvent(log, contract.interface);

          if (event) {
            setEvents((prev) => {
              if (prev.some((e) => e.id === event.id)) {
                return prev;
              }
              return [event, ...prev].slice(0, 100);
            });
          }
        };

        contract.on(filter, handler);
        listeners.push({ filter, handler });
      } catch (error) {}
    });

    return () => {
      listeners.forEach(({ filter, handler }) => {
        contract.removeListener(filter, handler);
      });
    };
  }, [contractAddress, eventTypes, parseContractEvent]);

  useEffect(() => {
    fetchHistoricalEvents();
  }, [fetchHistoricalEvents]);

  useEffect(() => {
    const cleanup = startEventListener();
    return cleanup;
  }, [startEventListener]);

  const getEventsByType = useCallback(
    (eventType: string) => {
      return events.filter((event) => event.type === eventType);
    },
    [events],
  );

  const getLatestEvent = useCallback(
    (eventType?: string) => {
      const filteredEvents = eventType
        ? events.filter((event) => event.type === eventType)
        : events;

      return filteredEvents.length > 0 ? filteredEvents[0] : null;
    },
    [events],
  );

  return {
    events,
    loading,
    error,
    getEventsByType,
    getLatestEvent,
    refetch: fetchHistoricalEvents,
  };
}
