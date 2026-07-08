import axios from "axios";

// Market data types
export interface OHLCV {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Supported symbols across different markets
export const SUPPORTED_SYMBOLS = {
  crypto: [
    "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT",
    "XRPUSDT", "DOTUSDT", "DOGEUSDT", "AVAXUSDT", "LINKUSDT"
  ],
  forex: [
    "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD",
    "USDCHF", "NZDUSD", "EURGBP", "EURJPY", "GBPJPY"
  ],
  stocks: [
    "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA",
    "META", "NVDA", "NFLX", "AMD", "INTC"
  ],
  commodities: [
    "GOLD", "SILVER", "OIL", "NATGAS", "COPPER"
  ]
};

// Binance API for crypto
export async function fetchBinanceCandles(
  symbol: string,
  interval: string = "1h",
  limit: number = 100
): Promise<OHLCV[]> {
  try {
    const response = await axios.get(
      `https://api.binance.com/api/v3/klines`,
      {
        params: {
          symbol: symbol.toUpperCase(),
          interval,
          limit,
        },
      }
    );

    return response.data.map((candle: number[]) => ({
      timestamp: new Date(candle[0]),
      open: parseFloat(candle[1].toString()),
      high: parseFloat(candle[2].toString()),
      low: parseFloat(candle[3].toString()),
      close: parseFloat(candle[4].toString()),
      volume: parseFloat(candle[5].toString()),
    }));
  } catch (error) {
    console.error(`Error fetching Binance data for ${symbol}:`, error);
    // Return mock data if API fails
    return generateMockData(symbol, limit);
  }
}

// Fetch real-time price from Binance
export async function fetchBinancePrice(symbol: string): Promise<number> {
  try {
    const response = await axios.get(
      `https://api.binance.com/api/v3/ticker/price`,
      {
        params: { symbol: symbol.toUpperCase() },
      }
    );
    return parseFloat(response.data.price);
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return getMockPrice(symbol);
  }
}

// Yahoo Finance for stocks (using a free proxy approach)
export async function fetchYahooFinanceData(
  symbol: string,
  _period: string = "1y",
  interval: string = "1d"
): Promise<OHLCV[]> {
  try {
    // Using Yahoo Finance v8 API (unofficial but widely used)
    const period1 = Math.floor(
      Date.now() / 1000 - 365 * 24 * 60 * 60
    );
    const period2 = Math.floor(Date.now() / 1000);

    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        params: {
          period1,
          period2,
          interval,
          events: "history",
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    const result = response.data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];

    return timestamps.map((ts: number, i: number) => ({
      timestamp: new Date(ts * 1000),
      open: quotes.open[i] || 0,
      high: quotes.high[i] || 0,
      low: quotes.low[i] || 0,
      close: quotes.close[i] || 0,
      volume: quotes.volume[i] || 0,
    }));
  } catch (error) {
    console.error(`Error fetching Yahoo data for ${symbol}:`, error);
    return generateMockData(symbol, 100);
  }
}

// Alpha Vantage for forex (free tier available)
export async function fetchForexData(
  fromSymbol: string,
  toSymbol: string,
  interval: string = "1h"
): Promise<OHLCV[]> {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || "demo";
    const function_name =
      interval === "1d" ? "FX_DAILY" : "FX_INTRADAY";

    const response = await axios.get(
      `https://www.alphavantage.co/query`,
      {
        params: {
          function: function_name,
          from_symbol: fromSymbol,
          to_symbol: toSymbol,
          interval,
          apikey: apiKey,
        },
      }
    );

    const timeSeriesKey = Object.keys(response.data).find((k) =>
      k.includes("Time Series")
    );
    if (!timeSeriesKey) return generateMockData(`${fromSymbol}${toSymbol}`, 100);

    const timeSeries = response.data[timeSeriesKey];
    return Object.entries(timeSeries)
      .map(([timestamp, data]: [string, any]) => ({
        timestamp: new Date(timestamp),
        open: parseFloat(data["1. open"] || 0),
        high: parseFloat(data["2. high"] || 0),
        low: parseFloat(data["3. low"] || 0),
        close: parseFloat(data["4. close"] || 0),
        volume: parseFloat(data["5. volume"] || 0),
      }))
      .reverse();
  } catch (error) {
    console.error(`Error fetching forex data:`, error);
    return generateMockData(`${fromSymbol}${toSymbol}`, 100);
  }
}

// Mock data generators for development/fallback
function generateMockData(symbol: string, count: number): OHLCV[] {
  const data: OHLCV[] = [];
  let price = getMockPrice(symbol);
  const now = Date.now();

  for (let i = count; i > 0; i--) {
    const volatility = price * 0.002;
    const change = (Math.random() - 0.48) * volatility;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 1000000 + 500000;

    data.push({
      timestamp: new Date(now - i * 3600000),
      open,
      high,
      low,
      close,
      volume,
    });

    price = close;
  }

  return data;
}

function getMockPrice(symbol: string): number {
  const mockPrices: Record<string, number> = {
    BTCUSDT: 108450,
    ETHUSDT: 3650,
    BNBUSDT: 720,
    SOLUSDT: 185,
    ADAUSDT: 0.52,
    XRPUSDT: 0.65,
    DOTUSDT: 8.5,
    DOGEUSDT: 0.18,
    AVAXUSDT: 42,
    LINKUSDT: 18.5,
    EURUSD: 1.085,
    GBPUSD: 1.27,
    USDJPY: 148.5,
    AUDUSD: 0.655,
    USDCAD: 1.35,
    USDCHF: 0.87,
    NZDUSD: 0.615,
    EURGBP: 0.855,
    EURJPY: 161.2,
    GBPJPY: 188.5,
    AAPL: 195,
    GOOGL: 175,
    MSFT: 425,
    AMZN: 185,
    TSLA: 250,
    META: 505,
    NVDA: 875,
    NFLX: 630,
    AMD: 180,
    INTC: 43,
    GOLD: 2350,
    SILVER: 28.5,
    OIL: 78.5,
    NATGAS: 2.85,
    COPPER: 4.35,
  };

  return mockPrices[symbol.toUpperCase()] || 100;
}

// Main data fetcher that routes to the appropriate source
export async function fetchMarketData(
  symbol: string,
  market: "crypto" | "forex" | "stocks" | "commodities" = "crypto",
  timeframe: string = "1h",
  limit: number = 100
): Promise<OHLCV[]> {
  switch (market) {
    case "crypto":
      return fetchBinanceCandles(symbol, timeframe, limit);
    case "forex": {
      const [from, to] = [symbol.slice(0, 3), symbol.slice(3)];
      return fetchForexData(from, to, timeframe);
    }
    case "stocks":
      return fetchYahooFinanceData(symbol, "1y", timeframe);
    case "commodities":
      // Use Yahoo Finance for commodities (they have commodity ETFs/futures)
      const commoditySymbols: Record<string, string> = {
        GOLD: "GC=F",
        SILVER: "SI=F",
        OIL: "CL=F",
        NATGAS: "NG=F",
        COPPER: "HG=F",
      };
      return fetchYahooFinanceData(
        commoditySymbols[symbol] || symbol,
        "1y",
        timeframe
      );
    default:
      return generateMockData(symbol, limit);
  }
}

// Get current price for a symbol
export async function getCurrentPrice(
  symbol: string,
  market: "crypto" | "forex" | "stocks" | "commodities" = "crypto"
): Promise<{ price: number; change24h: number; volume24h: number }> {
  if (market === "crypto") {
    try {
      const response = await axios.get(
        `https://api.binance.com/api/v3/ticker/24hr`,
        { params: { symbol: symbol.toUpperCase() } }
      );
      return {
        price: parseFloat(response.data.lastPrice),
        change24h: parseFloat(response.data.priceChangePercent),
        volume24h: parseFloat(response.data.volume),
      };
    } catch {
      return {
        price: getMockPrice(symbol),
        change24h: (Math.random() - 0.45) * 5,
        volume24h: Math.random() * 1000000,
      };
    }
  }

  return {
    price: getMockPrice(symbol),
    change24h: (Math.random() - 0.45) * 5,
    volume24h: Math.random() * 1000000,
  };
}
