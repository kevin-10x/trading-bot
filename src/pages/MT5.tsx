import { trpc } from "../providers/trpc";

export default function MT5() {
  const signalsQuery = trpc.mt5.signals.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const infoQuery = trpc.mt5.info.useQuery();
  const clearMutation = trpc.mt5.clear.useMutation({
    onSuccess: () => signalsQuery.refetch(),
  });

  const signals = signalsQuery.data ?? [];

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">MT5 Integration</h1>
        <p className="text-gray-400 mt-1">
          Receive signals from MetaTrader 5 Expert Advisors
        </p>
      </div>

      {/* Setup Guide */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Setup Guide</h2>
        <ol className="space-y-3">
          <SetupStep number={1}>
            Set{" "}
            <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-sm">
              MT5_WEBHOOK_SECRET=your-secret
            </code>{" "}
            in your{" "}
            <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-sm">
              .env
            </code>{" "}
            file
          </SetupStep>
          <SetupStep number={2}>
            Your webhook URL is{" "}
            <code className="bg-gray-800 text-green-300 px-1.5 py-0.5 rounded text-sm">
              https://yourdomain.com/api/mt5/webhook
            </code>
          </SetupStep>
          <SetupStep number={3}>
            Copy the EA template from{" "}
            <code className="bg-gray-800 text-yellow-300 px-1.5 py-0.5 rounded text-sm">
              MT5_EA.mq5
            </code>{" "}
            in the project root
          </SetupStep>
          <SetupStep number={4}>
            In the EA, set the{" "}
            <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-sm">
              WebhookURL
            </code>{" "}
            and{" "}
            <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-sm">
              WebhookSecret
            </code>{" "}
            inputs to match your configuration
          </SetupStep>
        </ol>
      </div>

      {/* Webhook info card */}
      {infoQuery.data && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Webhook Endpoint
          </h2>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex gap-3">
              <span className="text-gray-500 w-20 shrink-0">URL</span>
              <span className="text-green-400">{infoQuery.data.webhookUrl}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-500 w-20 shrink-0">Method</span>
              <span className="text-blue-400">{infoQuery.data.method}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-500 w-20 shrink-0">Header</span>
              <span className="text-yellow-300">
                X-MT5-Secret: &lt;your MT5_WEBHOOK_SECRET&gt;
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-3 font-sans">
              {infoQuery.data.note}
            </p>
          </div>
        </div>
      )}

      {/* Received Signals */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Received Signals{" "}
            {signals.length > 0 && (
              <span className="text-sm text-gray-400 font-normal ml-2">
                ({signals.length})
              </span>
            )}
          </h2>
          <button
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending || signals.length === 0}
            className="px-4 py-2 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {clearMutation.isPending ? "Clearing..." : "Clear History"}
          </button>
        </div>

        {signalsQuery.isLoading ? (
          <div className="text-center py-10 text-gray-500">
            Loading signals...
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No signals received yet. Configure your MT5 EA to start sending
            signals.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="pb-3 pr-4 font-medium">Time</th>
                  <th className="pb-3 pr-4 font-medium">Symbol</th>
                  <th className="pb-3 pr-4 font-medium">Action</th>
                  <th className="pb-3 pr-4 font-medium">Price</th>
                  <th className="pb-3 pr-4 font-medium">SL</th>
                  <th className="pb-3 pr-4 font-medium">TP</th>
                  <th className="pb-3 pr-4 font-medium">Volume</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {signals.map((item) => (
                  <tr key={item.id} className="text-gray-300 hover:bg-gray-800/20">
                    <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(item.received).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-white">
                      {item.signal.symbol}
                    </td>
                    <td className="py-3 pr-4">
                      <ActionBadge action={item.signal.action} />
                    </td>
                    <td className="py-3 pr-4 font-mono">
                      {item.signal.price.toFixed(5)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-red-400">
                      {item.signal.stopLoss.toFixed(5)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-green-400">
                      {item.signal.takeProfit.toFixed(5)}
                    </td>
                    <td className="py-3 pr-4 font-mono">
                      {item.signal.volume}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={item.status} reason={item.reason} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function SetupStep({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 text-xs font-bold flex items-center justify-center">
        {number}
      </span>
      <span className="text-gray-300 text-sm leading-6">{children}</span>
    </li>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    BUY: "bg-green-500/20 text-green-400 border-green-500/40",
    SELL: "bg-red-500/20 text-red-400 border-red-500/40",
    CLOSE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    MODIFY: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  };
  const cls =
    styles[action] ?? "bg-gray-500/20 text-gray-400 border-gray-500/40";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {action}
    </span>
  );
}

function StatusBadge({
  status,
  reason,
}: {
  status: string;
  reason?: string;
}) {
  const isProcessed = status === "processed";
  return (
    <span
      title={reason}
      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
        isProcessed
          ? "bg-green-500/20 text-green-400 border-green-500/40"
          : "bg-red-500/20 text-red-400 border-red-500/40"
      }`}
    >
      {isProcessed ? "Processed" : "Rejected"}
    </span>
  );
}
