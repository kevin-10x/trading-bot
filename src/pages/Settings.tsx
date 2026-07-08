import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Mail,
  MessageSquare,
  Bell,
  Shield,
  Download,
  Save,
  Smartphone,
} from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [minConfidence, setMinConfidence] = useState(80);
  const [riskPerTrade, setRiskPerTrade] = useState(2);
  const [maxDailyLoss, setMaxDailyLoss] = useState(5);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(false);

  const testEmail = trpc.notifications.testEmail.useQuery(
    { email },
    { enabled: false }
  );
  const testTelegram = trpc.notifications.testTelegram.useQuery(
    { chatId: telegramChatId },
    { enabled: false }
  );

  const handleSave = () => {
    // In production, save to database
    alert("Settings saved!");
  };

  const handleExportData = () => {
    // Export portfolio and signal data as JSON
    const exportData = {
      exportedAt: new Date().toISOString(),
      settings: {
        email,
        telegramChatId,
        minConfidence,
        riskPerTrade,
        maxDailyLoss,
        emailAlerts,
        telegramAlerts,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trading-settings-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-400" />
          Settings
        </h1>
        <p className="text-gray-400 mt-1">
          Configure your trading preferences and notifications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Notification Settings
          </h3>

          <div className="space-y-4">
            {/* Email */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Email Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => testEmail.refetch()}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Send test email
              </button>
            </div>

            {/* Telegram */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">
                    Telegram Alerts
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telegramAlerts}
                    onChange={(e) => setTelegramAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
              <input
                type="text"
                placeholder="Telegram Chat ID"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Start a chat with @BotFather to create a bot and get your Chat
                ID
              </p>
              <button
                onClick={() => testTelegram.refetch()}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Send test message
              </button>
            </div>
          </div>
        </div>

        {/* Trading Settings */}
        <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Trading Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Minimum Confidence: {minConfidence}%
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>50%</span>
                <span>95%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Risk Per Trade: {riskPerTrade}%
              </label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.5%</span>
                <span>10%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Max Daily Loss: {maxDailyLoss}%
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1%</span>
                <span>20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-400" />
          Data Export
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Download your settings, portfolio data, and trading history
        </p>
        <div className="flex gap-3">
          <Button
            onClick={handleExportData}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
          <Button
            onClick={() => {
              // Export portfolio
              const data = {
                portfolio: trpc.trades.portfolio.useQuery({ userId: "default" })
                  .data,
                exportedAt: new Date().toISOString(),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `portfolio-${new Date().toISOString().split("T")[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Export Portfolio
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-500 px-8"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
