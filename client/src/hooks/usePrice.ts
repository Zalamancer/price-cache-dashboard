import { useEffect, useState } from "react";
import { fetchPrice, fetchAllPrices, fetchStats, PriceData, CacheStats } from "@/lib/api";

/**
 * Hook to fetch and update a single price
 */
export function usePrice(symbol: string, interval: number = 2000) {
  const [price, setPrice] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchPrice(symbol);
        if (data) {
          setPrice(data);
          setError(null);
        } else {
          setError(`Failed to fetch price for ${symbol}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [symbol, interval]);

  return { price, loading, error };
}

/**
 * Hook to fetch and update all prices
 */
export function usePrices(interval: number = 2000) {
  const [prices, setPrices] = useState<Record<string, PriceData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchAllPrices();
        if (data) {
          setPrices(data);
          setError(null);
        } else {
          setError("Failed to fetch prices");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return { prices, loading, error };
}

/**
 * Hook to fetch and update cache statistics
 */
export function useStats(interval: number = 2000) {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchStats();
        if (data) {
          setStats(data);
          setError(null);
        } else {
          setError("Failed to fetch stats");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return { stats, loading, error };
}
