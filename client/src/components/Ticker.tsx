import { useEffect, useState } from "react";
import { usePrices } from "@/hooks/usePrice";
import { TrendingUp, TrendingDown } from "lucide-react";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  latency: number;
}

export default function Ticker() {
  const { prices } = usePrices(2000);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});

  // Initialize previous prices
  useEffect(() => {
    if (!prices || typeof prices !== "object") return;

    const pricesObj = prices as Record<string, any>;
    const initial: Record<string, number> = {};

    SYMBOLS.forEach((symbol) => {
      const priceData = pricesObj[symbol];
      if (priceData && typeof priceData === "object" && "price" in priceData) {
        initial[symbol] = priceData.price;
      }
    });

    if (Object.keys(initial).length > 0) {
      setPreviousPrices(initial);
    }
  }, []);

  // Update ticker items when prices change
  useEffect(() => {
    if (!prices || typeof prices !== "object") return;

    const pricesObj = prices as Record<string, any>;
    const items: TickerItem[] = [];

    SYMBOLS.forEach((symbol) => {
      const priceData = pricesObj[symbol];
      if (priceData && typeof priceData === "object" && "price" in priceData) {
        const previousPrice = previousPrices[symbol] || priceData.price;
        const change = priceData.price - previousPrice;
        const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

        items.push({
          symbol,
          price: priceData.price,
          change,
          changePercent,
          latency: priceData.latency_us || 0,
        });

        // Update previous price for next comparison
        setPreviousPrices((prev) => ({
          ...prev,
          [symbol]: priceData.price,
        }));
      }
    });

    if (items.length > 0) {
      setTickerItems(items);
    }
  }, [prices]);

  if (tickerItems.length === 0) {
    return null;
  }

  // Duplicate items for continuous scrolling effect
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="bg-gradient-to-r from-card via-card to-card border-b border-border overflow-hidden">
      <div className="relative h-16 flex items-center">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

        {/* Scrolling container */}
        <div className="flex animate-scroll whitespace-nowrap gap-8 px-4">
          {displayItems.map((item, idx) => (
            <div
              key={`${item.symbol}-${idx}`}
              className="flex items-center gap-3 flex-shrink-0 group cursor-pointer hover:opacity-80 transition-opacity"
            >
              {/* Symbol */}
              <span className="font-bold text-accent text-sm min-w-12">{item.symbol}</span>

              {/* Price */}
              <span className="text-foreground font-semibold text-sm min-w-20">
                ${item.price.toFixed(2)}
              </span>

              {/* Change indicator */}
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                  item.change >= 0
                    ? "bg-accent/10 text-accent"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {item.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="text-xs font-semibold">
                  {item.change >= 0 ? "+" : ""}
                  {item.changePercent.toFixed(2)}%
                </span>
              </div>

              {/* Latency badge */}
              <span className="text-muted-foreground text-xs px-2 py-1 rounded bg-background/50 min-w-14">
                {item.latency.toFixed(1)}µs
              </span>

              {/* Separator */}
              {idx < displayItems.length - 1 && (
                <div className="w-px h-6 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSS for scrolling animation */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
