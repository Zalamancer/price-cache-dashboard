import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Pause, Play, RotateCcw } from "lucide-react";
import { PriceData } from "@/lib/api";

interface PriceHistoryPoint {
  time: string;
  timestamp: number;
  AAPL?: number;
  MSFT?: number;
  GOOGL?: number;
  AMZN?: number;
  TSLA?: number;
}

interface PriceChartProps {
  prices: Record<string, PriceData> | null;
  maxDataPoints?: number;
}

// Stock colors matching the ticker
const STOCK_COLORS: Record<string, string> = {
  AAPL: "#00FF88",  // Green
  MSFT: "#00D4FF",  // Cyan
  GOOGL: "#FF6B6B", // Red
  AMZN: "#FFD93D",  // Yellow
  TSLA: "#C77DFF",  // Purple
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}
            </span>
            <span className="text-foreground font-semibold">
              ${entry.value?.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PriceChart({ prices, maxDataPoints = 60 }: PriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(
    new Set(["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"])
  );
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const lastPricesRef = useRef<Record<string, number>>({});

  // Update price history when new prices arrive
  useEffect(() => {
    if (!prices || isPaused) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Calculate price changes
    const changes: Record<string, number> = {};
    Object.entries(prices).forEach(([symbol, data]) => {
      const lastPrice = lastPricesRef.current[symbol];
      if (lastPrice !== undefined) {
        changes[symbol] = data.price - lastPrice;
      }
      lastPricesRef.current[symbol] = data.price;
    });
    setPriceChanges(changes);

    // Create new data point
    const newPoint: PriceHistoryPoint = {
      time: timeStr,
      timestamp: now.getTime(),
    };

    Object.entries(prices).forEach(([symbol, data]) => {
      (newPoint as any)[symbol] = data.price;
    });

    setPriceHistory((prev) => {
      const updated = [...prev, newPoint];
      // Keep only the last maxDataPoints
      if (updated.length > maxDataPoints) {
        return updated.slice(-maxDataPoints);
      }
      return updated;
    });
  }, [prices, isPaused, maxDataPoints]);

  // Toggle stock visibility
  const toggleStock = (symbol: string) => {
    setSelectedStocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        // Don't allow deselecting all stocks
        if (newSet.size > 1) {
          newSet.delete(symbol);
        }
      } else {
        newSet.add(symbol);
      }
      return newSet;
    });
  };

  // Reset chart
  const resetChart = () => {
    setPriceHistory([]);
    lastPricesRef.current = {};
    setPriceChanges({});
  };

  // Calculate min/max for Y-axis domain
  const getYAxisDomain = () => {
    if (priceHistory.length === 0) return [0, 500];

    let min = Infinity;
    let max = -Infinity;

    priceHistory.forEach((point) => {
      selectedStocks.forEach((symbol) => {
        const value = (point as any)[symbol];
        if (value !== undefined) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });

    // Add 5% padding
    const padding = (max - min) * 0.05;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  };

  // Get current prices for display
  const currentPrices = prices
    ? Object.entries(prices).map(([symbol, data]) => ({
        symbol,
        price: data.price,
        change: priceChanges[symbol] || 0,
      }))
    : [];

  return (
    <Card className="bg-card border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Real-Time Price Chart
          </h2>
          <p className="text-xs text-muted-foreground">
            Live stock price fluctuations • {priceHistory.length} data points
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="gap-1"
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3" /> Resume
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" /> Pause
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetChart}
            className="gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
        </div>
      </div>

      {/* Stock selector pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(STOCK_COLORS).map((symbol) => {
          const isSelected = selectedStocks.has(symbol);
          const currentPrice = prices?.[symbol]?.price;
          const change = priceChanges[symbol] || 0;

          return (
            <button
              key={symbol}
              onClick={() => toggleStock(symbol)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-200 border
                ${
                  isSelected
                    ? "border-transparent"
                    : "border-border bg-transparent text-muted-foreground opacity-50"
                }
              `}
              style={{
                backgroundColor: isSelected ? `${STOCK_COLORS[symbol]}20` : undefined,
                color: isSelected ? STOCK_COLORS[symbol] : undefined,
                borderColor: isSelected ? STOCK_COLORS[symbol] : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STOCK_COLORS[symbol] }}
              />
              <span>{symbol}</span>
              {currentPrice && (
                <span className="font-semibold">${currentPrice.toFixed(2)}</span>
              )}
              {change !== 0 && (
                <span
                  className={`flex items-center ${
                    change > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {change > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-[350px]">
        {priceHistory.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={priceHistory}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3142" />
              <XAxis
                dataKey="time"
                stroke="#A0A0A0"
                style={{ fontSize: "10px" }}
                tick={{ fill: "#A0A0A0" }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#A0A0A0"
                style={{ fontSize: "10px" }}
                tick={{ fill: "#A0A0A0" }}
                domain={getYAxisDomain()}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => (
                  <span style={{ color: STOCK_COLORS[value] }}>{value}</span>
                )}
              />
              {Object.entries(STOCK_COLORS).map(([symbol, color]) =>
                selectedStocks.has(symbol) ? (
                  <Line
                    key={symbol}
                    type="monotone"
                    dataKey={symbol}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Collecting price data...</p>
              <p className="text-xs mt-1">Chart will appear after 2+ data points</p>
            </div>
          </div>
        )}
      </div>

      {/* Price summary cards */}
      <div className="grid grid-cols-5 gap-2 mt-4">
        {currentPrices.map(({ symbol, price, change }) => (
          <div
            key={symbol}
            className="bg-background/50 rounded-lg p-2 text-center border border-border"
          >
            <div
              className="text-xs font-semibold mb-1"
              style={{ color: STOCK_COLORS[symbol] }}
            >
              {symbol}
            </div>
            <div className="text-sm font-bold text-foreground">
              ${price.toFixed(2)}
            </div>
            {change !== 0 && (
              <div
                className={`text-xs flex items-center justify-center gap-0.5 ${
                  change > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {change > 0 ? "+" : ""}
                {change.toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
