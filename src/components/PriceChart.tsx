import { useEffect, useRef, useState, useId } from "react";

interface PriceChartProps {
  symbol: string;
  market: "crypto" | "forex" | "stocks" | "commodities";
  signal?: "BUY" | "SELL" | "HOLD";
  timeframe?: string;
}

const TIMEFRAMES = ["1m", "15m", "1h", "4h", "1d"];

// Map app symbol+market to TradingView symbol format
function toTVSymbol(symbol: string, market: string): string {
  if (market === "crypto") {
    return `BINANCE:${symbol}`;
  }
  if (market === "forex") {
    return `FX:${symbol}`;
  }
  if (market === "stocks") {
    const nasdaq = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "NFLX", "AMD", "INTC"];
    if (nasdaq.includes(symbol)) return `NASDAQ:${symbol}`;
    return `NYSE:${symbol}`;
  }
  if (market === "commodities") {
    const commodityMap: Record<string, string> = {
      GOLD: "OANDA:XAUUSD",
      SILVER: "OANDA:XAGUSD",
      OIL: "TVC:USOIL",
      NATGAS: "TVC:NATGASUSD",
      COPPER: "TVC:COPPER",
    };
    return commodityMap[symbol] ?? `TVC:${symbol}`;
  }
  return symbol;
}

// Map app timeframe to TradingView interval
function toTVInterval(tf: string): string {
  const map: Record<string, string> = {
    "1m": "1",
    "15m": "15",
    "1h": "60",
    "4h": "240",
    "1d": "D",
  };
  return map[tf] ?? "60";
}

export default function PriceChart({
  symbol,
  market,
  signal,
  timeframe = "1h",
}: PriceChartProps) {
  const uid = useId();
  // useId generates something like ":r0:" — sanitize it to a valid HTML id
  const containerId = `tv-chart-${uid.replace(/[^a-zA-Z0-9]/g, "")}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<unknown>(null);
  const [activeTimeframe, setActiveTimeframe] = useState(timeframe);

  useEffect(() => {
    // Clear any previous widget content
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (containerRef.current && (window as any).TradingView) {
        widgetRef.current = new (window as any).TradingView.widget({
          autosize: true,
          symbol: toTVSymbol(symbol, market),
          interval: toTVInterval(activeTimeframe),
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#111827",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerId,
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // Clean up script tag on unmount / dependency change
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [symbol, market, activeTimeframe, containerId]);

  const signalColor =
    signal === "BUY"
      ? { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/40" }
      : signal === "SELL"
      ? { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/40" }
      : { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/40" };

  return (
    <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
      {/* Timeframe selector bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                activeTimeframe === tf
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Signal badge */}
        {signal && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${signalColor.bg} ${signalColor.text} ${signalColor.border}`}
          >
            {signal}
          </span>
        )}
      </div>

      {/* TradingView widget container */}
      <div
        id={containerId}
        ref={containerRef}
        style={{ height: "500px", width: "100%" }}
      />
    </div>
  );
}
