import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  History,
  Target,
  BarChart3,
} from "lucide-react";

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState<"positions" | "history">(
    "positions"
  );

  const portfolioQuery = trpc.trades.portfolio.useQuery({
    userId: "default",
  });
  const historyQuery = trpc.trades.history.useQuery({
    userId: "default",
  });

  const resetMutation = trpc.trades.reset.useMutation({
    onSuccess: () => {
      portfolioQuery.refetch();
      historyQuery.refetch();
    },
  });

  const portfolio = portfolioQuery.data;
  const history = historyQuery.data || [];

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-400" />
            Paper Trading Portfolio
          </h1>
          <p className="text-gray-400 mt-1">
            Virtual portfolio to test strategies risk-free
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => resetMutation.mutate({ userId: "default" })}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Portfolio
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Balance"
          value={`$${portfolio.balance.toFixed(2)}`}
          icon={<Wallet className="w-5 h-5 text-blue-400" />}
        />
        <StatCard
          title="Equity"
          value={`$${portfolio.equity.toFixed(2)}`}
          icon={<BarChart3 className="w-5 h-5 text-purple-400" />}
        />
        <StatCard
          title="Total P&L"
          value={`${portfolio.totalProfit >= 0 ? "+" : ""}$${portfolio.totalProfit.toFixed(2)}`}
          change={portfolio.totalProfitPercent}
          icon={
            portfolio.totalProfit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )
          }
        />
        <StatCard
          title="Win Rate"
          value={`${portfolio.winRate.toFixed(1)}%`}
          subtitle={`${portfolio.winningTrades}W / ${portfolio.losingTrades}L`}
          icon={<Target className="w-5 h-5 text-yellow-400" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("positions")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "positions"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Open Positions ({portfolio.openPositions.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Trade History ({history.length})
        </button>
      </div>

      {/* Open Positions */}
      {activeTab === "positions" && (
        <div className="space-y-3">
          {portfolio.openPositions.length === 0 && (
            <div className="text-center py-12 bg-[#111827] rounded-xl border border-gray-800">
              <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No open positions</p>
              <p className="text-gray-500 text-sm mt-1">
                Go to the Dashboard to place trades
              </p>
            </div>
          )}
          {portfolio.openPositions.map((position) => (
            <PositionCard key={position.id} position={position} />
          ))}
        </div>
      )}

      {/* Trade History */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {history.length === 0 && (
            <div className="text-center py-12 bg-[#111827] rounded-xl border border-gray-800">
              <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No trade history</p>
            </div>
          )}
          {history.map((trade) => (
            <TradeHistoryCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}

function PositionCard({
  position,
}: {
  position: {
    id: string;
    symbol: string;
    type: "LONG" | "SHORT";
    entryPrice: number;
    currentPrice: number;
    quantity: number;
    profit: number;
    profitPercent: number;
    stopLoss: number;
    takeProfit: number;
    openedAt: Date;
  };
}) {
  const closeMutation = trpc.trades.close.useMutation({
    onSuccess: () => {
      // Refetch will be handled by the portfolio page
      window.location.reload();
    },
  });

  const isProfit = position.profit >= 0;

  return (
    <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded text-xs font-bold ${
              position.type === "LONG"
                ? "bg-green-400/10 text-green-400"
                : "bg-red-400/10 text-red-400"
            }`}
          >
            {position.type}
          </span>
          <span className="text-lg font-semibold text-white">
            {position.symbol}
          </span>
        </div>
        <div className="text-right">
          <p
            className={`text-lg font-bold ${
              isProfit ? "text-green-400" : "text-red-400"
            }`}
          >
            {isProfit ? "+" : ""
                  }${position.profit.toFixed(2)}
          </p>
          <p
            className={`text-sm ${
              isProfit ? "text-green-400" : "text-red-400"
            }`}
          >
            {position.profitPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
        <div>
          <p className="text-gray-500">Entry</p>
          <p className="text-white">${position.entryPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500">Current</p>
          <p className="text-white">${position.currentPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500">Stop Loss</p>
          <p className="text-red-400">${position.stopLoss.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500">Take Profit</p>
          <p className="text-green-400">${position.takeProfit.toFixed(2)}</p>
        </div>
      </div>

      <Button
        onClick={() =>
          closeMutation.mutate({
            userId: "default",
            positionId: position.id,
            exitPrice: position.currentPrice,
          })
        }
        className="mt-4 w-full bg-gray-700 hover:bg-gray-600"
      >
        Close Position
      </Button>
    </div>
  );
}

function TradeHistoryCard({
  trade,
}: {
  trade: {
    symbol: string;
    type: string;
    entryPrice: number;
    exitPrice?: number;
    profit: number;
    profitPercent: number;
    openedAt: Date;
    closedAt?: Date;
  };
}) {
  const isProfit = trade.profit > 0;

  return (
    <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded text-xs font-bold ${
              trade.type === "BUY"
                ? "bg-green-400/10 text-green-400"
                : "bg-red-400/10 text-red-400"
            }`}
          >
            {trade.type}
          </span>
          <span className="text-white font-medium">{trade.symbol}</span>
        </div>
        <div className="text-right">
          <p
            className={`font-bold ${
              isProfit ? "text-green-400" : "text-red-400"
            }`}
          >
            {isProfit ? "+" : ""}
                  ${trade.profit?.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-gray-500">
            {trade.closedAt
              ? new Date(trade.closedAt).toLocaleDateString()
              : "Open"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  change?: number;
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
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
