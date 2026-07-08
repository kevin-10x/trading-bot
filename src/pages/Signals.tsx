import { useState } from "react";
import { trpc } from "@/providers/trpc";
import SignalCard from "@/components/SignalCard";
import { Signal, RefreshCw, Filter } from "lucide-react";

export default function Signals() {
  const [selectedMarket, setSelectedMarket] = useState<
    "crypto" | "forex" | "stocks" | "commodities"
  >("crypto");
  const [minConfidence, setMinConfidence] = useState(80);

  const signalsQuery = trpc.signals.scan.useQuery(
    { market: selectedMarket, minConfidence },
    { refetchInterval: 30000 }
  );

  const aiQuery = trpc.ai.featureImportance.useQuery();

  const signals = signalsQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Signal className="w-8 h-8 text-blue-400" />
            Trading Signals
          </h1>
          <p className="text-gray-400 mt-1">
            AI-generated signals with technical analysis
          </p>
        </div>
        <button
          onClick={() => signalsQuery.refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-[#111827] rounded-xl border border-gray-800 p-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <div className="flex gap-2">
          {(["crypto", "forex", "stocks", "commodities"] as const).map(
            (market) => (
              <button
                key={market}
                onClick={() => setSelectedMarket(market)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  selectedMarket === market
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {market}
              </button>
            )
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-gray-400">Min Confidence:</span>
          <input
            type="range"
            min="50"
            max="95"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseInt(e.target.value))}
            className="w-32 accent-blue-500"
          />
          <span className="text-sm text-white font-medium">
            {minConfidence}%
          </span>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {signals.map((signal, index) => (
          <SignalCard key={index} signal={signal} />
        ))}
        {signals.length === 0 && (
          <div className="col-span-full text-center py-12 bg-[#111827] rounded-xl border border-gray-800">
            <Signal className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              No high-confidence signals found for {selectedMarket}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Try lowering the confidence threshold or selecting a different
              market
            </p>
          </div>
        )}
      </div>

      {/* Feature Importance */}
      {aiQuery.data && (
        <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            AI Feature Importance
          </h3>
          <div className="space-y-3">
            {aiQuery.data.map((feature) => (
              <div key={feature.feature}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">
                    {feature.feature}
                  </span>
                  <span className="text-sm text-gray-400">
                    {(feature.importance * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${feature.importance * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
