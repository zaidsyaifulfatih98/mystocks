import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();
const TICKER = "^JKSE";

export type IHSGPeriod = "1wk" | "1mo" | "6mo" | "1y" | "5y";

function getStartDate(period: IHSGPeriod): Date {
  const now = new Date();
  switch (period) {
    case "1wk": { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
    case "1mo": { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
    case "6mo": { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d; }
    case "1y":  { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
    case "5y":  { const d = new Date(now); d.setFullYear(d.getFullYear() - 5); return d; }
  }
}

export const ihsgService = {
  async getHistorical(period: IHSGPeriod = "1mo") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any[] = await yahooFinance.historical(TICKER, {
      period1: getStartDate(period),
      period2: new Date(),
      interval: period === "5y" ? "1wk" : "1d",
    }) as any;

    return result.map((item: any) => ({
      date: item.date.toISOString().split("T")[0],
      open: item.open ?? null,
      high: item.high ?? null,
      low: item.low ?? null,
      close: item.close ?? null,
      volume: item.volume ?? null,
    }));
  },

  async getQuote() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q: any = await yahooFinance.quote(TICKER) as any;
    return {
      price: q.regularMarketPrice ?? null,
      change: q.regularMarketChange ?? null,
      changePercent: q.regularMarketChangePercent ?? null,
      open: q.regularMarketOpen ?? null,
      high: q.regularMarketDayHigh ?? null,
      low: q.regularMarketDayLow ?? null,
      previousClose: q.regularMarketPreviousClose ?? null,
      volume: q.regularMarketVolume ?? null,
    };
  },
};
