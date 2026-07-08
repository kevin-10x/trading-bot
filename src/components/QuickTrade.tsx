import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
} from "lucide-react";

interface QuickTradeProps {
  symbol: string;
  price: number;
  prediction?: {
    signal: "BUY" | "SELL" | "HOLD";
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
  } | null;
}

export default function QuickTrade({
  symbol,
  price,
  prediction,
}: QuickTradeProps) {
  const [riskPercent, setRiskPercent] = useState(2);

  // Fetch portfolio
  const portfolioQuery = trpc.trades.portfolio.useQuery({
    userId: "default",
  });

  // Mutations
  const openTrade = trpc.trades.open.useMutation({
    onSuccess: () => portfolioQuery.refetch(),
  });

  const portfolio = portfolioQuery.data;

  const handleTrade = (signal: "BUY" | "SELL") => {
    if (!price) return;

    const stopLoss =
      signal === "BUY" ? price * 0.985 : price * 1.015;
    const takeProfit =
      signal === "BUY" ? price * 1.03 : price * 0.97;

    openTrade.mutate({
      userId: "default",
      symbol,
      signal,
      entryPrice: price,
      stopLoss,
      takeProfit,
      riskPercent,
    });
  };

  return (
    <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-blue-400" />
        Paper Trading
      </h3>

      {/* Portfolio Summary */}
      {portfolio && (
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">Balance</p>
              <p className="text-sm font-bold text-white">
                ${portfolio.balance.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Equity</p>
              <p className="text-sm font-bold text-white">
                ${portfolio.equity.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">P&L</p>
              <p
                className={`text-sm font-bold ${
                  portfolio.totalProfit >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {portfolio.totalProfit >= 0 ? "+" : ""}
                  ${portfolio.totalProfit.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Win Rate</p>
              <p className="text-sm font-bold text-blue-400">
                {portfolio.winRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Percent className="w-3 h-3" />
            Risk per trade
          </span>
          <span className="text-xs text-white font-medium">
            {riskPercent}%
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          value={riskPercent}
          onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.5%</span>
          <span>10%</span>
        </div>
      </div>

      {/* Trade Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => handleTrade("BUY")}
          disabled={!price || openTrade.isPending}
          className="bg-green-600 hover:bg-green-500 text-white py-6"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          BUY
        </Button>
        <Button
          onClick={() => handleTrade("SELL")}
          disabled={!price || openTrade.isPending}
          className="bg-red-600 hover:bg-red-500 text-white py-6"
        >
          <TrendingDown className="w-5 h-5 mr-2" />
          SELL
        </Button>
      </div>

      {/* Suggested Levels */}
      {prediction && prediction.signal !== "HOLD" && (
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-2">AI Suggested Levels</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Entry</span>
              <span className="text-white">
                ${prediction.entryPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-500">TP</span>
              <span className="text-green-400">
                ${prediction.takeProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-500">SL</span>
              <span className="text-red-400">
                ${prediction.stopLoss.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Open Positions Count */}
      {portfolio && portfolio.openPositions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <p className="text-sm text-blue-400">
            {portfolio.openPositions.length} open position
            {portfolio.openPositions.length > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
