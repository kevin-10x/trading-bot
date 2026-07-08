import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

interface SignalCardProps {
  signal: {
    symbol: string;
    signal: "BUY" | "SELL" | "HOLD";
    confidence: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    riskReward: string;
    reasons: string[];
  };
}

export default function SignalCard({ signal }: SignalCardProps) {
  const signalColor =
    signal.signal === "BUY"
      ? "text-green-400 bg-green-400/10 border-green-400/30"
      : signal.signal === "SELL"
      ? "text-red-400 bg-red-400/10 border-red-400/30"
      : "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";

  const SignalIcon =
    signal.signal === "BUY"
      ? TrendingUp
      : signal.signal === "SELL"
      ? TrendingDown
      : Minus;

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-bold ${signalColor}`}
          >
            {signal.signal}
          </span>
          <span className="text-sm font-semibold text-white">
            {signal.symbol}
          </span>
        </div>
        <SignalIcon className={`w-4 h-4 ${signalColor.split(" ")[0]}`} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div>
          <span className="text-gray-500">Confidence</span>
          <p className="text-white font-medium">{signal.confidence.toFixed(1)}%</p>
        </div>
        <div>
          <span className="text-gray-500">R:R</span>
          <p className="text-white font-medium">{signal.riskReward}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>Entry: ${signal.entryPrice.toLocaleString()}</span>
        <ArrowRight className="w-3 h-3" />
        <span className="text-green-400">TP: ${signal.takeProfit.toLocaleString()}</span>
        <ArrowRight className="w-3 h-3" />
        <span className="text-red-400">SL: ${signal.stopLoss.toLocaleString()}</span>
      </div>

      {signal.reasons.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700/50">
          <p className="text-xs text-gray-500">
            {signal.reasons[0]}
          </p>
        </div>
      )}
    </div>
  );
}
