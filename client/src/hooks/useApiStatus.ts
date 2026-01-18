import { useEffect, useState } from "react";

export type ApiStatus = "live" | "fallback" | "checking";

interface ApiStatusInfo {
  status: ApiStatus;
  message: string;
  lastChecked: Date | null;
}

/**
 * Hook to detect whether the API is live or in fallback mode
 * Checks by fetching actual price data and examining the source field
 */
export function useApiStatus(checkInterval: number = 10000) {
  const [apiStatus, setApiStatus] = useState<ApiStatusInfo>({
    status: "checking",
    message: "Checking API status...",
    lastChecked: null,
  });

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch("/api/prices", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          
          // Check if data has the "source" field indicating it's from the real API
          const firstPrice = Object.values(data.prices || {})[0] as any;
          const isLive = firstPrice?.source === "yahoo_finance";
          
          setApiStatus({
            status: isLive ? "live" : "fallback",
            message: isLive ? "✓ API Live • Healthy" : "Using Fallback Data",
            lastChecked: new Date(),
          });
        } else {
          setApiStatus({
            status: "fallback",
            message: "Using Fallback Data",
            lastChecked: new Date(),
          });
        }
      } catch (error) {
        setApiStatus({
          status: "fallback",
          message: "Using Fallback Data",
          lastChecked: new Date(),
        });
      }
    };

    // Check immediately
    checkApiStatus();

    // Set up periodic checks
    const interval = setInterval(checkApiStatus, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  return apiStatus;
}
