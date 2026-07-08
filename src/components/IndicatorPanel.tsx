import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Shield,
} from "lucide-react";

interface IndicatorPanelProps {
  indicators: {
    rsi14: number | null;
    macd: number | null;
    macdSignal: number | null;
    macdHistogram: number | null;
    ema20: number | null;
    ema50: number | null;
    sma20: number | null;
    sma50: number | null;
    bbUpper: number | null;
    bbMiddle: number | null;
    bbLower: number | null;
    atr14: number | null;
    vwap: number | null;
    trend: "bullish" | "bearish" | "neutral";
    support: number | null;
    resistance: number | null;
  };
}

export default function IndicatorPanel({ indicators }: IndicatorPanelProps) {
  const trendColor =
    indicators.trend === "bullish"
      ? "text-green-400 bg-green-400/10"
      : indicators.trend === "bearish"
      ? "text-red-400 bg-red-400/10"
      : "text-yellow-400 bg-yellow-400/10";

  return (
    <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-400" />
        Technical Indicators
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Trend */}
        <IndicatorCard
          label="Trend"
          value={indicators.trend.toUpperCase()}
          icon={
            indicators.trend === "bullish" ? (
              <TrendingUp className="w-4 h-4" />
            ) : indicators.trend === "bearish" ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )
          }
          color={trendColor}
        />

        {/* RSI */}
        <IndicatorCard
          label="RSI (14)"
          value={indicators.rsi14?.toFixed(2) || "N/A"}
          icon={<Activity className="w-4 h-4" />}
          color={getRSIColor(indicators.rsi14)}
        />

        {/* MACD */}
        <IndicatorCard
          label="MACD"
          value={indicators.macd?.toFixed(4) || "N/A"}
          icon={<BarChart3 className="w-4 h-4" />}
          color={
            indicators.macd && indicators.macd > 0
              ? "text-green-400 bg-green-400/10"
              : "text-red-400 bg-red-400/10"
          }
        />

        {/* MACD Histogram */}
        <IndicatorCard
          label="MACD Hist"
          value={indicators.macdHistogram?.toFixed(4) || "N/A"}
          icon={<BarChart3 className="w-4 h-4" />}
          color={
            indicators.macdHistogram && indicators.macdHistogram > 0
              ? "text-green-400 bg-green-400/10"
              : "text-red-400 bg-red-400/10"
          }
        />

        {/* EMA 20 */}
        <IndicatorCard
          label="EMA 20"
          value={indicators.ema20?.toFixed(2) || "N/A"}
          icon={<TrendingUp className="w-4 h-4" />}
          color="text-blue-400 bg-blue-400/10"
        />

        {/* EMA 50 */}
        <IndicatorCard
          label="EMA 50"
          value={indicators.ema50?.toFixed(2) || "N/A"}
          icon={<TrendingUp className="w-4 h-4" />}
          color="text-purple-400 bg-purple-400/10"
        />

        {/* ATR */}
        <IndicatorCard
          label="ATR (14)"
          value={indicators.atr14?.toFixed(2) || "N/A"}
          icon={<Shield className="w-4 h-4" />}
          color="text-orange-400 bg-orange-400/10"
        />

        {/* VWAP */}
        <IndicatorCard
          label="VWAP"
          value={indicators.vwap?.toFixed(2) || "N/A"}
          icon={<Target className="w-4 h-4" />}
          color="text-cyan-400 bg-cyan-400/10"
        />
      </div>

      {/* Support & Resistance */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-green-400/5 border border-green-400/20 rounded-lg p-3">
          <p className="text-xs text-green-400 mb-1">Support</p>
          <p className="text-lg font-bold text-white">
            {indicators.support?.toFixed(2) || "N/A"}
          </p>
        </div>
        <div className="bg-red-400/5 border border-red-400/20 rounded-lg p-3">
          <p className="text-xs text-red-400 mb-1">Resistance</p>
          <p className="text-lg font-bold text-white">
            {indicators.resistance?.toFixed(2) || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

function IndicatorCard({
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
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className={`text-sm font-bold ${color.split(" ")[0]}`}>{value}</p>
    </div>
  );
}

function getRSIColor(rsi: number | null): string {
  if (rsi === null) return "text-gray-400 bg-gray-400/10";
  if (rsi < 30) return "text-green-400 bg-green-400/10";
  if (rsi > 70) return "text-red-400 bg-red-400/10";
  return "text-yellow-400 bg-yellow-400/10";
}
