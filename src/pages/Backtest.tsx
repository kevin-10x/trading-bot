import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  History,
  Play,
  BarChart3,
  TrendingUp,
  Target,
  Shield,
  Award,
} from "lucide-react";

const STRATEGIES = [
  { id: "ai", name: "AI Ensemble", description: "XGBoost + Technical Analysis" },
  { id: "rsi", name: "RSI Strategy", description: "Mean reversion with RSI" },
  { id: "macd", name: "MACD Strategy", description: "Trend following with MACD" },
  { id: "ema_cross", name: "EMA Crossover", description: "Moving average crossover" },
];

export default function Backtest() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [market, setMarket] = useState<"crypto" | "forex" | "stocks" | "commodities">("crypto");
  const [strategy, setStrategy] = useState<"ai" | "rsi" | "macd" | "ema_cross">("ai");
  const [isRunning, setIsRunning] = useState(false);

  const backtestQuery = trpc.backtest.run.useQuery(
    { symbol, market, strategy },
    { enabled: isRunning }
  );

  const compareQuery = trpc.backtest.compare.useQuery(
    { symbol, market },
    { enabled: isRunning }
  );

  const result = backtestQuery.data;

  const runBacktest = () => {
    setIsRunning(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <History className="w-8 h-8 text-blue-400" />
          Backtest Engine
        </h1>
        <p className="text-gray-400 mt-1">
          Test trading strategies on historical data
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Backtest Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Market</label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="crypto">Crypto</option>
              <option value="forex">Forex</option>
              <option value="stocks">Stocks</option>
              <option value="commodities">Commodities</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {STRATEGIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={runBacktest}
              disabled={isRunning && backtestQuery.isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-2"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning && backtestQuery.isLoading
                ? "Running..."
                : "Run Backtest"}
            </Button>
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStrategy(s.id as any)}
            className={`p-4 rounded-xl border text-left transition-all ${
              strategy === s.id
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-800 bg-[#111827] hover:border-gray-700"
            }`}
          >
            <h4 className="text-white font-medium">{s.name}</h4>
            <p className="text-sm text-gray-400 mt-1">{s.description}</p>
          </button>
        ))}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Performance Metrics */}
          <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Backtest Results: {symbol} - {STRATEGIES.find((s) => s.id === strategy)?.name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResultCard
                label="Total Return"
                value={`${result.totalReturn >= 0 ? "+" : ""}${result.totalReturn.toFixed(2)}%`}
                icon={<TrendingUp className="w-5 h-5" />}
                color={result.totalReturn >= 0 ? "text-green-400" : "text-red-400"}
              />
              <ResultCard
                label="Win Rate"
                value={`${result.winRate.toFixed(1)}%`}
                icon={<Target className="w-5 h-5" />}
                color="text-blue-400"
              />
              <ResultCard
                label="Total Trades"
                value={result.totalTrades.toString()}
                icon={<BarChart3 className="w-5 h-5" />}
                color="text-purple-400"
              />
              <ResultCard
                label="Sharpe Ratio"
                value={result.sharpeRatio.toFixed(2)}
                icon={<Award className="w-5 h-5" />}
                color="text-yellow-400"
              />
              <ResultCard
                label="Max Drawdown"
                value={`-${result.maxDrawdownPercent.toFixed(2)}%`}
                icon={<Shield className="w-5 h-5" />}
                color="text-red-400"
              />
              <ResultCard
                label="Profit Factor"
                value={result.profitFactor.toFixed(2)}
                icon={<TrendingUp className="w-5 h-5" />}
                color="text-green-400"
              />
              <ResultCard
                label="Avg Win"
                value={`$${result.avgWin.toFixed(2)}`}
                icon={<TrendingUp className="w-5 h-5" />}
                color="text-green-400"
              />
              <ResultCard
                label="Avg Loss"
                value={`$${result.avgLoss.toFixed(2)}`}
                icon={<TrendingUp className="w-5 h-5" />}
                color="text-red-400"
              />
            </div>
          </div>

          {/* Equity Curve Placeholder */}
          <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Equity Curve
            </h3>
            <div className="h-64 flex items-end gap-1">
              {result.equityCurve.map((point, i, arr) => {
                const maxEquity = Math.max(...arr.map((a) => a.equity));
                const minEquity = Math.min(...arr.map((a) => a.equity));
                const range = maxEquity - minEquity || 1;
                const height =
                  ((point.equity - minEquity) / range) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-blue-500/50 hover:bg-blue-400 transition-colors rounded-t"
                    style={{ height: `${Math.max(5, height)}%` }}
                    title={`$${point.equity.toFixed(2)}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Start</span>
              <span>End</span>
            </div>
          </div>

          {/* Strategy Comparison */}
          {compareQuery.data && (
            <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Strategy Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm text-gray-400">
                        Strategy
                      </th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400">
                        Return
                      </th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400">
                        Win Rate
                      </th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400">
                        Trades
                      </th>
                      <th className="text-right py-3 px-4 text-sm text-gray-400">
                        Sharpe
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareQuery.data.map((item: any, i: number) => (
                      <tr
                        key={i}
                        className="border-b border-gray-800 hover:bg-gray-800/30"
                      >
                        <td className="py-3 px-4 text-white font-medium">
                          {item.strategy}
                        </td>
                        <td
                          className={`py-3 px-4 text-right ${
                            item.totalReturn >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {item.totalReturn >= 0 ? "+" : ""}
                          {item.totalReturn?.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right text-blue-400">
                          {item.winRate?.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right text-gray-300">
                          {item.totalTrades}
                        </td>
                        <td className="py-3 px-4 text-right text-yellow-400">
                          {item.sharpeRatio?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
