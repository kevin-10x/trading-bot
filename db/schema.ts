import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  float,
  int,
  json,
  boolean,
  bigint,
  index,
} from "drizzle-orm/mysql-core";

// Users table (extends default auth users)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Market prices table - stores OHLCV candlestick data
export const marketPrices = mysqlTable(
  "market_prices",
  {
    id: serial("id").primaryKey(),
    symbol: varchar("symbol", { length: 30 }).notNull(),
    timeframe: varchar("timeframe", { length: 10 }).notNull(), // 1m, 5m, 1h, 4h, 1d
    open: float("open").notNull(),
    high: float("high").notNull(),
    low: float("low").notNull(),
    close: float("close").notNull(),
    volume: float("volume").notNull(),
    timestamp: timestamp("timestamp").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_symbol_timeframe_timestamp").on(
      table.symbol,
      table.timeframe,
      table.timestamp
    ),
  ]
);

export type MarketPrice = typeof marketPrices.$inferSelect;

// Technical indicators table
export const technicalIndicators = mysqlTable(
  "technical_indicators",
  {
    id: serial("id").primaryKey(),
    symbol: varchar("symbol", { length: 30 }).notNull(),
    timeframe: varchar("timeframe", { length: 10 }).notNull(),
    rsi14: float("rsi14"),
    macd: float("macd"),
    macdSignal: float("macd_signal"),
    macdHistogram: float("macd_histogram"),
    ema20: float("ema20"),
    ema50: float("ema50"),
    sma20: float("sma20"),
    sma50: float("sma50"),
    bbUpper: float("bb_upper"),
    bbMiddle: float("bb_middle"),
    bbLower: float("bb_lower"),
    atr14: float("atr14"),
    vwap: float("vwap"),
    trend: varchar("trend", { length: 20 }), // bullish, bearish, neutral
    support: float("support"),
    resistance: float("resistance"),
    timestamp: timestamp("timestamp").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_indicators_symbol_timeframe").on(
      table.symbol,
      table.timeframe,
      table.timestamp
    ),
  ]
);

export type TechnicalIndicator = typeof technicalIndicators.$inferSelect;

// AI trading signals table
export const tradingSignals = mysqlTable(
  "trading_signals",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }),
    symbol: varchar("symbol", { length: 30 }).notNull(),
    signal: mysqlEnum("signal", ["BUY", "SELL", "HOLD"]).notNull(),
    confidence: float("confidence").notNull(), // 0-100
    entryPrice: float("entry_price"),
    takeProfit: float("take_profit"),
    stopLoss: float("stop_loss"),
    riskReward: varchar("risk_reward", { length: 20 }),
    reason: json("reason").$type<string[]>(), // Array of reasons
    technicalScore: float("technical_score"),
    aiScore: float("ai_score"),
    sentimentScore: float("sentiment_score"),
    riskScore: float("risk_score"),
    timeframe: varchar("timeframe", { length: 10 }).notNull(),
    status: mysqlEnum("status", ["active", "expired", "triggered", "cancelled"])
      .default("active")
      .notNull(),
    triggeredAt: timestamp("triggered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_signals_user_symbol").on(table.userId, table.symbol),
    index("idx_signals_created").on(table.createdAt),
  ]
);

export type TradingSignal = typeof tradingSignals.$inferSelect;

// Paper trades table
export const paperTrades = mysqlTable(
  "paper_trades",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }),
    signalId: bigint("signal_id", { mode: "number", unsigned: true }),
    symbol: varchar("symbol", { length: 30 }).notNull(),
    type: mysqlEnum("type", ["BUY", "SELL"]).notNull(),
    entryPrice: float("entry_price").notNull(),
    exitPrice: float("exit_price"),
    quantity: float("quantity").notNull(),
    profit: float("profit"),
    profitPercent: float("profit_percent"),
    status: mysqlEnum("status", ["open", "closed", "cancelled"])
      .default("open")
      .notNull(),
    openedAt: timestamp("opened_at").defaultNow().notNull(),
    closedAt: timestamp("closed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_trades_user").on(table.userId),
    index("idx_trades_symbol").on(table.symbol),
  ]
);

export type PaperTrade = typeof paperTrades.$inferSelect;

// Notifications table
export const notifications = mysqlTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }),
    symbol: varchar("symbol", { length: 30 }).notNull(),
    signal: varchar("signal", { length: 10 }).notNull(),
    confidence: float("confidence"),
    channel: mysqlEnum("channel", ["email", "telegram", "both"]).notNull(),
    status: mysqlEnum("status", ["sent", "failed", "pending"])
      .default("pending")
      .notNull(),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_notifications_user").on(table.userId),
    index("idx_notifications_created").on(table.createdAt),
  ]
);

export type Notification = typeof notifications.$inferSelect;

// Subscriptions table (freemium model)
export const subscriptions = mysqlTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  plan: mysqlEnum("plan", ["free", "starter", "professional", "enterprise"])
    .default("free")
    .notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "trial"])
    .default("trial")
    .notNull(),
  trialEndsAt: timestamp("trial_ends_at"), // 1 month free trial
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Subscription = typeof subscriptions.$inferSelect;

// Backtest results table
export const backtestResults = mysqlTable(
  "backtest_results",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }),
    name: varchar("name", { length: 255 }).notNull(),
    symbol: varchar("symbol", { length: 30 }).notNull(),
    strategy: varchar("strategy", { length: 50 }).notNull(),
    timeframe: varchar("timeframe", { length: 10 }).notNull(),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    initialBalance: float("initial_balance").notNull(),
    finalBalance: float("final_balance").notNull(),
    totalReturn: float("total_return"),
    totalTrades: int("total_trades"),
    winningTrades: int("winning_trades"),
    losingTrades: int("losing_trades"),
    winRate: float("win_rate"),
    maxDrawdown: float("max_drawdown"),
    sharpeRatio: float("sharpe_ratio"),
    profitFactor: float("profit_factor"),
    avgTradeProfit: float("avg_trade_profit"),
    parameters: json("parameters").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_backtest_user").on(table.userId),
  ]
);

export type BacktestResult = typeof backtestResults.$inferSelect;

// User settings table
export const userSettings = mysqlTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  emailAlerts: boolean("email_alerts").default(true),
  telegramAlerts: boolean("telegram_alerts").default(false),
  telegramChatId: varchar("telegram_chat_id", { length: 255 }),
  minConfidence: float("min_confidence").default(80),
  riskPerTrade: float("risk_per_trade").default(2), // percentage
  maxDailyLoss: float("max_daily_loss").default(5), // percentage
  preferredSymbols: json("preferred_symbols").$type<string[]>(),
  darkMode: boolean("dark_mode").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type UserSettings = typeof userSettings.$inferSelect;

// AI model performance tracking
export const aiModelPerformance = mysqlTable(
  "ai_model_performance",
  {
    id: serial("id").primaryKey(),
    modelName: varchar("model_name", { length: 100 }).notNull(),
    symbol: varchar("symbol", { length: 30 }).notNull(),
    accuracy: float("accuracy"),
    precision: float("precision_val"),
    recall: float("recall"),
    f1Score: float("f1_score"),
    totalPredictions: int("total_predictions"),
    correctPredictions: int("correct_predictions"),
    trainedAt: timestamp("trained_at"),
    evaluatedAt: timestamp("evaluated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_model_perf_symbol").on(table.symbol, table.modelName),
  ]
);

export type AiModelPerformance = typeof aiModelPerformance.$inferSelect;
