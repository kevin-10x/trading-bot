import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { SUPPORTED_SYMBOLS } from "../../api/services/market-data";
import MarketCard from "@/components/MarketCard";
import SignalCard from "@/components/SignalCard";
import AIAnalysisPanel from "@/components/AIAnalysisPanel";
import PriceChart from "@/components/PriceChart";
import IndicatorPanel from "@/components/IndicatorPanel";
import QuickTrade from "@/components/QuickTrade";
import { Activity, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedMarket, setSelectedMarket] = useState<
    "crypto" | "forex" | "stocks" | "commodities"
  >("crypto");

  // Fetch current price
  const priceQuery = trpc.market.price.useQuery({
    symbol: selectedSymbol,
    market: selectedMarket,
  });

  // Fetch AI prediction
  const aiQuery = trpc.ai.predict.useQuery({
    symbol: selectedSymbol,
    market: selectedMarket,
  });

  // Fetch indicators
  const indicatorsQuery = trpc.market.indicators.useQuery({
    symbol: selectedSymbol,
    market: selectedMarket,
  });

  // Scan for signals
  const signalsQuery = trpc.signals.scan.useQuery(
    { market: selectedMarket, minConfidence: 80 },
    { refetchInterval: 30000 }
  );

  const price = priceQuery.data;
  const prediction = aiQuery.data;
  const indicators = indicatorsQuery.data;
  const signals = signalsQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Market Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
          <p className="text-gray-400 mt-1">
            AI-powered market analysis and signals
          </p>
        </div>

        <div className="flex gap-4">
          {/* Market Type Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(["crypto", "forex", "stocks", "commodities"] as const).map(
              (market) => (
                <button
                  key={market}
                  onClick={() => {
                    setSelectedMarket(market);
                    setSelectedSymbol(SUPPORTED_SYMBOLS[market][0]);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                    selectedMarket === market
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {market}
                </button>
              )
            )}
          </div>

          {/* Symbol Selector */}
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {SUPPORTED_SYMBOLS[selectedMarket].map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Price"
          value={price ? `$${price.price.toLocaleString()}` : "Loading..."}
          change={price?.change24h}
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          title="AI Signal"
          value={prediction?.signal || "Analyzing..."}
          confidence={prediction?.confidence}
          icon={
            prediction?.signal === "BUY" ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : prediction?.signal === "SELL" ? (
              <TrendingDown className="w-5 h-5 text-red-400" />
            ) : (
              <BarChart3 className="w-5 h-5 text-yellow-400" />
            )
          }
        />
        <StatCard
          title="24h Volume"
          value={
            price
              ? `${(price.volume24h / 1000000).toFixed(2)}M`
              : "Loading..."
          }
          icon={<BarChart3 className="w-5 h-5 text-blue-400" />}
        />
        <StatCard
          title="Active Signals"
          value={signals.length.toString()}
          subtitle="High confidence"
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <PriceChart
            symbol={selectedSymbol}
            market={selectedMarket}
            signal={prediction?.signal}
            timeframe="1h"
          />

          {/* Indicators */}
          {indicators && <IndicatorPanel indicators={indicators} />}

          {/* AI Analysis */}
          {prediction && (
            <AIAnalysisPanel prediction={prediction} symbol={selectedSymbol} />
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Trade */}
          <QuickTrade
            symbol={selectedSymbol}
            price={price?.price || 0}
            prediction={prediction}
          />

          {/* Recent Signals */}
          <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Top Signals
            </h3>
            <div className="space-y-3">
              {signals.slice(0, 5).map((signal, index) => (
                <SignalCard key={index} signal={signal} />
              ))}
              {signals.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No high-confidence signals found
                </p>
              )}
            </div>
          </div>

          {/* Market Overview */}
          <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Market Overview
            </h3>
            <div className="space-y-2">
              {SUPPORTED_SYMBOLS[selectedMarket].slice(0, 5).map((symbol) => (
                <MarketCard
                  key={symbol}
                  symbol={symbol}
                  market={selectedMarket}
                  isActive={symbol === selectedSymbol}
                  onClick={() => setSelectedSymbol(symbol)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  confidence,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  change?: number;
  confidence?: number;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{title}</span>
        <div className="text-gray-500">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {change !== undefined && (
        <div
          className={`text-sm mt-1 ${
            change >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(2)}%
        </div>
      )}
      {confidence !== undefined && (
        <div className="text-sm text-blue-400 mt-1">
          Confidence: {confidence.toFixed(1)}%
        </div>
      )}
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
