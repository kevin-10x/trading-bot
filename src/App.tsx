import { Routes, Route } from "react-router";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Signals from "./pages/Signals";
import Portfolio from "./pages/Portfolio";
import Backtest from "./pages/Backtest";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import MT5 from "./pages/MT5";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signals" element={<Signals />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/mt5" element={<MT5 />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SpeedInsights />
    </>
  );
}
