//+------------------------------------------------------------------+
//| AI Trading Bot - Webhook EA                                      |
//| Version  : 1.00                                                  |
//| Copyright: AI Trading Bot                                        |
//|                                                                  |
//| SETUP INSTRUCTIONS                                               |
//| ==================                                               |
//| 1. In MT5, open Tools > Options > Expert Advisors               |
//|    - Check "Allow WebRequest for listed URL"                     |
//|    - Add your webhook URL (e.g. https://yourdomain.com)          |
//| 2. Set MT5_WEBHOOK_SECRET in your app's .env file               |
//| 3. Compile this EA (F7) and attach it to a chart                 |
//| 4. Set WebhookURL and WebhookSecret EA inputs to match your app  |
//| 5. Signals will appear on the MT5 Bridge page of your app        |
//|                                                                  |
//| SIGNAL TYPES SENT                                                |
//| =================                                                |
//| BUY    - Entry buy signal with SL/TP                             |
//| SELL   - Entry sell signal with SL/TP                            |
//| CLOSE  - Position close signal                                   |
//| MODIFY - Position modify signal                                  |
//|                                                                  |
//| STRATEGY NOTE                                                    |
//| ==============                                                   |
//| The OnTick() below contains a simple EMA crossover example.      |
//| Replace it with your own strategy logic and call SignalBuy(),    |
//| SignalSell(), or SignalClose() at the appropriate moment.        |
//+------------------------------------------------------------------+
#property copyright "AI Trading Bot"
#property link      ""
#property version   "1.00"
#property strict

#include <Trade\Trade.mqh>

//--- EA Inputs
input string WebhookURL      = "https://yourdomain.com/api/mt5/webhook"; // Webhook URL
input string WebhookSecret   = "your-webhook-secret";   // Must match MT5_WEBHOOK_SECRET in .env
input int    MagicNumber     = 12345;                    // EA Magic Number (unique per EA instance)
input double LotSize         = 0.1;                      // Trade volume in lots
input int    StopLossPips    = 50;                       // Stop loss distance in pips
input int    TakeProfitPips  = 100;                      // Take profit distance in pips

//--- Example strategy inputs (EMA crossover)
input int    FastEMAPeriod   = 10;                       // Fast EMA period
input int    SlowEMAPeriod   = 20;                       // Slow EMA period

//--- Internal state
static bool  s_inPosition     = false;
static string s_posDirection  = "";
static int   s_fastHandle     = INVALID_HANDLE;
static int   s_slowHandle     = INVALID_HANDLE;

//+------------------------------------------------------------------+
//| Expert initialization                                             |
//+------------------------------------------------------------------+
int OnInit()
  {
   Print("AI Trading Bot Webhook EA initialized");
   Print("Webhook URL: ", WebhookURL);
   Print("Symbol: ", Symbol());
   Print("IMPORTANT: Add your webhook URL to MT5 Tools > Options > Expert Advisors > Allow WebRequest URLs");

   //--- Create indicator handles for the example strategy
   s_fastHandle = iMA(Symbol(), PERIOD_CURRENT, FastEMAPeriod, 0, MODE_EMA, PRICE_CLOSE);
   s_slowHandle = iMA(Symbol(), PERIOD_CURRENT, SlowEMAPeriod, 0, MODE_EMA, PRICE_CLOSE);

   if(s_fastHandle == INVALID_HANDLE || s_slowHandle == INVALID_HANDLE)
     {
      Print("Warning: Failed to create MA handles - check inputs");
     }

   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization                                           |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   if(s_fastHandle != INVALID_HANDLE) IndicatorRelease(s_fastHandle);
   if(s_slowHandle != INVALID_HANDLE) IndicatorRelease(s_slowHandle);
   Print("AI Trading Bot Webhook EA stopped. Reason: ", reason);
  }

//+------------------------------------------------------------------+
//| Send HTTP POST request to the webhook endpoint                    |
//+------------------------------------------------------------------+
bool SendWebhook(string action, double price, double sl, double tp, string comment)
  {
   //--- Build required headers
   string headers = "Content-Type: application/json\r\nX-MT5-Secret: " + WebhookSecret + "\r\n";

   //--- Build ISO-8601-like timestamp (MT5 does not produce a real ISO string natively)
   string timestamp = TimeToString(TimeCurrent(), TIME_DATE | TIME_MINUTES | TIME_SECONDS);
   StringReplace(timestamp, " ", "T"); // "2024.01.15 12:30:00" -> "2024.01.15T12:30:00"
   StringReplace(timestamp, ".", "-"); // "2024.01.15T..." -> "2024-01-15T..."
   timestamp += "Z";

   //--- Build JSON body
   string body = StringFormat(
                    "{\"symbol\":\"%s\",\"action\":\"%s\",\"price\":%.5f,"
                    "\"stopLoss\":%.5f,\"takeProfit\":%.5f,\"volume\":%.2f,"
                    "\"magic\":%d,\"comment\":\"%s\",\"timestamp\":\"%s\","
                    "\"accountId\":\"%d\"}",
                    Symbol(),
                    action,
                    price,
                    sl,
                    tp,
                    LotSize,
                    MagicNumber,
                    comment,
                    timestamp,
                    (long)AccountInfoInteger(ACCOUNT_LOGIN)
                 );

   //--- Convert string to byte array
   char post[];
   ArrayResize(post, StringToCharArray(body, post, 0, WHOLE_ARRAY, CP_UTF8) - 1);

   char    result[];
   string  responseHeaders;
   int     httpStatus = WebRequest(
                           "POST",
                           WebhookURL,
                           headers,
                           5000,       // timeout ms
                           post,
                           result,
                           responseHeaders
                        );

   if(httpStatus == -1)
     {
      int err = GetLastError();
      Print("Webhook ERROR (", err, "): Did you add ", WebhookURL,
            " to MT5 Tools > Options > Expert Advisors > Allow WebRequest URLs?");
      return(false);
     }

   string responseBody = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
   Print("Webhook sent: ", action, " for ", Symbol(),
         " | HTTP ", httpStatus, " | Response: ", responseBody);

   return(httpStatus == 200 || httpStatus == 201);
  }

//+------------------------------------------------------------------+
//| Helper: convert pip count to price distance                       |
//+------------------------------------------------------------------+
double PipsToPrice(int pips)
  {
   // For 5-digit brokers _Point = 0.00001; multiply by 10 to get a pip
   return pips * _Point * 10.0;
  }

//+------------------------------------------------------------------+
//| Signal helpers — call these from your own strategy logic         |
//+------------------------------------------------------------------+
void SignalBuy(string comment = "")
  {
   double price = SymbolInfoDouble(Symbol(), SYMBOL_ASK);
   double sl    = price - PipsToPrice(StopLossPips);
   double tp    = price + PipsToPrice(TakeProfitPips);
   if(comment == "") comment = "EMA crossover BUY";
   SendWebhook("BUY", price, sl, tp, comment);
  }

void SignalSell(string comment = "")
  {
   double price = SymbolInfoDouble(Symbol(), SYMBOL_BID);
   double sl    = price + PipsToPrice(StopLossPips);
   double tp    = price - PipsToPrice(TakeProfitPips);
   if(comment == "") comment = "EMA crossover SELL";
   SendWebhook("SELL", price, sl, tp, comment);
  }

void SignalClose(string comment = "")
  {
   double price = SymbolInfoDouble(Symbol(), SYMBOL_BID);
   if(comment == "") comment = "Close signal";
   SendWebhook("CLOSE", price, 0.0, 0.0, comment);
  }

//+------------------------------------------------------------------+
//| OnTick — example EMA crossover strategy                          |
//| Replace the contents of this function with your own logic.       |
//+------------------------------------------------------------------+
void OnTick()
  {
   //--- Only act on a new bar to avoid repeated signals
   static datetime s_lastBar = 0;
   datetime currentBar = iTime(Symbol(), PERIOD_CURRENT, 0);
   if(currentBar == s_lastBar) return;
   s_lastBar = currentBar;

   //--- Need valid handles
   if(s_fastHandle == INVALID_HANDLE || s_slowHandle == INVALID_HANDLE) return;

   //--- Read EMA values for the last two closed bars (index 1 and 2)
   double fastCurrent[1], fastPrev[1];
   double slowCurrent[1], slowPrev[1];

   if(CopyBuffer(s_fastHandle, 0, 1, 1, fastCurrent) <= 0) return;
   if(CopyBuffer(s_fastHandle, 0, 2, 1, fastPrev)    <= 0) return;
   if(CopyBuffer(s_slowHandle, 0, 1, 1, slowCurrent) <= 0) return;
   if(CopyBuffer(s_slowHandle, 0, 2, 1, slowPrev)    <= 0) return;

   bool wasBullish = fastPrev[0]    > slowPrev[0];
   bool isBullish  = fastCurrent[0] > slowCurrent[0];

   //--- Bullish crossover → BUY signal
   if(!wasBullish && isBullish && s_posDirection != "BUY")
     {
      if(s_inPosition) SignalClose("EMA crossover — closing SELL before BUY");
      SignalBuy();
      s_inPosition   = true;
      s_posDirection = "BUY";
     }
   //--- Bearish crossover → SELL signal
   else if(wasBullish && !isBullish && s_posDirection != "SELL")
     {
      if(s_inPosition) SignalClose("EMA crossover — closing BUY before SELL");
      SignalSell();
      s_inPosition   = true;
      s_posDirection = "SELL";
     }
  }
//+------------------------------------------------------------------+
