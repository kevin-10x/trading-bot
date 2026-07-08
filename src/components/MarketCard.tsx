import { trpc } from "@/providers/trpc";

interface MarketCardProps {
  symbol: string;
  market: "crypto" | "forex" | "stocks" | "commodities";
  isActive: boolean;
  onClick: () => void;
}

export default function MarketCard({
  symbol,
  market,
  isActive,
  onClick,
}: MarketCardProps) {
  const priceQuery = trpc.market.price.useQuery({ symbol, market });
  const price = priceQuery.data;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
        isActive
          ? "bg-blue-600/20 border border-blue-600/40"
          : "bg-gray-800/50 border border-transparent hover:bg-gray-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isActive
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {symbol.slice(0, 2)}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white">{symbol}</p>
          <p className="text-xs text-gray-500 capitalize">{market}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">
          {price ? `$${price.price.toLocaleString()}` : "..."}
        </p>
        {price && (
          <p
            className={`text-xs ${
              price.change24h >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {price.change24h >= 0 ? "+" : ""}
            {price.change24h.toFixed(2)}%
          </p>
        )}
      </div>
    </button>
  );
}
