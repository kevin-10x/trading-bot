import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Signal,
  Wallet,
  History,
  Settings,
  CreditCard,
  Bot,
  TrendingUp,
  Plug,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/signals", label: "Signals", icon: Signal },
  { path: "/mt5", label: "MT5 Bridge", icon: Plug },
  { path: "/portfolio", label: "Portfolio", icon: Wallet },
  { path: "/backtest", label: "Backtest", icon: History },
  { path: "/subscription", label: "Subscription", icon: CreditCard },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Trading
            </h1>
            <p className="text-xs text-gray-500">Bot Platform</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <TrendingUp className="w-4 h-4 ml-auto text-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Trial Badge */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4">
          <p className="text-sm font-semibold text-purple-300">Trial Active</p>
          <p className="text-xs text-gray-400 mt-1">30 days remaining</p>
          <Link
            to="/subscription"
            className="mt-3 block text-xs text-center bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-md transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>
      </div>
    </aside>
  );
}
