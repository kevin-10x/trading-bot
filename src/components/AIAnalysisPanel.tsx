import { Brain, TrendingUp, AlertTriangle, CheckCircle, BarChart3, MessageSquare, Shield } from "lucide-react";

interface AIAnalysisPanelProps {
  prediction: {
    signal: "BUY" | "SELL" | "HOLD";
    confidence: number;
    probability: {
      buy: number;
      sell: number;
      hold: number;
    };
    technicalScore: number;
    aiScore: number;
    sentimentScore: number;
    riskScore: number;
    reasons: string[];
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    riskReward: string;
    llmAnalysis?: {
      reasoning: string;
      riskNotes: string[];
      marketRegime: string;
      keyLevels: { type: "support" | "resistance"; price: number }[];
    } | null;
  };
  symbol: string;
}

export default function AIAnalysisPanel({
  prediction,
  symbol,
}: AIAnalysisPanelProps) {
  const signalColor =
    prediction.signal === "BUY"
      ? "green"
      : prediction.signal === "SELL"
      ? "red"
      : "yellow";

  const colorClasses = {
    green: {
      bg: "bg-green-400/10",
      border: "border-green-400/30",
      text: "text-green-400",
      bar: "bg-green-400",
    },
    red: {
      bg: "bg-red-400/10",
      border: "border-red-400/30",
      text: "text-red-400",
      bar: "bg-red-400",
    },
    yellow: {
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/30",
      text: "text-yellow-400",
      bar: "bg-yellow-400",
    },
  };

  const colors = colorClasses[signalColor];

  return (
    <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              AI Analysis - {symbol}
            </h3>
            <p className="text-sm text-gray-400">LLM-Enhanced Ensemble Model</p>
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-lg ${colors.bg} border ${colors.border}`}
        >
          <span className={`text-2xl font-bold ${colors.text}`}>
            {prediction.signal}
          </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Confidence</span>
          <span className={`text-lg font-bold ${colors.text}`}>
            {prediction.confidence.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
      </div>

      {/* Probabilities */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ProbabilityBar
          label="Buy"
          value={prediction.probability.buy}
          color="bg-green-400"
        />
        <ProbabilityBar
          label="Sell"
          value={prediction.probability.sell}
          color="bg-red-400"
        />
        <ProbabilityBar
          label="Hold"
          value={prediction.probability.hold}
          color="bg-yellow-400"
        />
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ScoreCard
          label="Technical"
          value={prediction.technicalScore}
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <ScoreCard
          label="AI Model"
          value={prediction.aiScore}
          icon={<Brain className="w-4 h-4" />}
        />
        <ScoreCard
          label="Sentiment"
          value={prediction.sentimentScore}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <ScoreCard
          label="Risk"
          value={prediction.riskScore}
          icon={<AlertTriangle className="w-4 h-4" />}
          invert
        />
      </div>

      {/* Trade Levels */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-white mb-3">
          Suggested Trade Levels
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400">Entry</p>
            <p className="text-lg font-bold text-white">
              ${prediction.entryPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-green-400">Take Profit</p>
            <p className="text-lg font-bold text-green-400">
              ${prediction.takeProfit.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-red-400">Stop Loss</p>
            <p className="text-lg font-bold text-red-400">
              ${prediction.stopLoss.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Risk/Reward Ratio:{" "}
            <span className="text-white font-semibold">
              {prediction.riskReward}
            </span>
          </p>
        </div>
      </div>

      {/* LLM Analysis */}
      {prediction.llmAnalysis && (
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">AI Market Insight</h4>
            <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
              Groq LLM
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-3">{prediction.llmAnalysis.reasoning}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
              Regime: <span className="text-white capitalize">{prediction.llmAnalysis.marketRegime}</span>
            </span>
            {prediction.llmAnalysis.keyLevels.map((level, i) => (
              <span key={i} className={`text-xs px-2 py-1 rounded ${
                level.type === "support"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}>
                {level.type === "support" ? "Support" : "Resistance"}: ${level.price.toLocaleString()}
              </span>
            ))}
          </div>
          {prediction.llmAnalysis.riskNotes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-purple-500/10">
              <div className="flex items-center gap-1 mb-1">
                <Shield className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-gray-400">Risk Factors</span>
              </div>
              <ul className="space-y-1">
                {prediction.llmAnalysis.riskNotes.map((note, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                    <span className="text-yellow-400 mt-0.5">-</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Reasons */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">
          Analysis Reasons
        </h4>
        <ul className="space-y-2">
          {prediction.reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProbabilityBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs text-white">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  icon,
  invert,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  invert?: boolean;
}) {
  const getColor = () => {
    if (invert) {
      if (value < 30) return "text-green-400";
      if (value < 60) return "text-yellow-400";
      return "text-red-400";
    }
    if (value > 70) return "text-green-400";
    if (value > 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-500">{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className={`text-lg font-bold ${getColor()}`}>{value.toFixed(0)}/100</p>
    </div>
  );
}
