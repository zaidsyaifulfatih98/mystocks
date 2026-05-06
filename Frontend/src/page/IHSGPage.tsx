import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import api from "../utils/api";
import DashboardLayout from "../components/DashboardLayout";
import { useTheme } from "../context/ThemeContext";

interface HistoricalPoint {
  date: string;
  close: number | null;
}

interface Quote {
  price: number | null;
  change: number | null;
  changePercent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  volume: number | null;
}

type Period = "1wk" | "1mo" | "6mo" | "1y" | "5y";

const PERIODS: { value: Period; label: string }[] = [
  { value: "1wk", label: "1M" },
  { value: "1mo", label: "1B" },
  { value: "6mo", label: "6B" },
  { value: "1y", label: "1T" },
  { value: "5y", label: "5T" },
];

function formatIdx(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
}

function formatVolume(v: number | null) {
  if (v === null) return "—";
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  return v.toLocaleString("id-ID");
}

function formatDateLabel(dateStr: string, period: Period) {
  const d = new Date(dateStr);
  if (period === "5y" || period === "1y") {
    return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
  }
  if (period === "6mo") {
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatTooltipDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

export default function IHSGPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [period, setPeriod] = useState<Period>("1mo");
  const [historical, setHistorical] = useState<HistoricalPoint[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [histLoading, setHistLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [histError, setHistError] = useState("");

  const fetchHistorical = (p: Period) => {
    setHistLoading(true);
    setHistError("");
    api.get(`/ihsg/historical?period=${p}`)
      .then((res) => setHistorical(res.data.data))
      .catch((e) => setHistError(e?.response?.data?.message || "Gagal memuat data historis IHSG"))
      .finally(() => setHistLoading(false));
  };

  const fetchQuote = () => {
    setQuoteLoading(true);
    api.get("/ihsg/quote")
      .then((res) => setQuote(res.data.data))
      .catch(() => {})
      .finally(() => setQuoteLoading(false));
  };

  useEffect(() => {
    fetchQuote();
    fetchHistorical(period);
  }, []);

  useEffect(() => {
    fetchHistorical(period);
  }, [period]);

  const isPositive = (quote?.change ?? 0) >= 0;
  const validPoints = historical.filter((h) => h.close !== null);
  const firstClose = validPoints[0]?.close ?? 0;
  const lastClose = validPoints[validPoints.length - 1]?.close ?? 0;
  const chartPositive = lastClose >= firstClose;
  const strokeColor = chartPositive ? "#10b981" : "#ef4444";

  const chartData = validPoints.map((h) => ({
    rawDate: h.date,
    label: formatDateLabel(h.date, period),
    close: h.close,
  }));

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IHSG</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Indeks Harga Saham Gabungan · ^JKSE
          </p>
        </div>
        <button
          onClick={() => { fetchQuote(); fetchHistorical(period); }}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Quote card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-6 transition-colors">
        {quoteLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="w-6 h-6 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : quote ? (
          <div className="flex flex-wrap items-start gap-6">
            {/* Price + change */}
            <div className="min-w-[160px]">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Harga Terakhir</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
                {formatIdx(quote.price)}
              </p>
              <div className={`flex items-center gap-1.5 mt-1.5 text-sm font-semibold ${
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
              }`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? "+" : ""}{formatIdx(quote.change)}
                {" "}({isPositive ? "+" : ""}{(quote.changePercent ?? 0).toFixed(2)}%)
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3 flex-1 pt-1">
              {[
                { label: "Open", value: formatIdx(quote.open) },
                { label: "High", value: formatIdx(quote.high) },
                { label: "Low", value: formatIdx(quote.low) },
                { label: "Prev. Close", value: formatIdx(quote.previousClose) },
                { label: "Volume", value: formatVolume(quote.volume) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 tabular-nums">{value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Data quote tidak tersedia</p>
        )}
      </div>

      {/* Chart card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-white">Grafik Harga IHSG</h3>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {PERIODS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === value
                    ? "bg-emerald-500 text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {histLoading ? (
          <div className="h-72 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : histError ? (
          <div className="h-72 flex items-center justify-center text-red-400 dark:text-red-400 text-sm">
            {histError}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            Tidak ada data untuk periode ini
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="ihsgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
              <XAxis
                dataKey="label"
                tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatIdx(v)}
                width={72}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#111827" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                labelFormatter={(_, payload) => {
                  if (payload && payload[0]) {
                    return formatTooltipDate(payload[0].payload.rawDate);
                  }
                  return "";
                }}
                labelStyle={{ color: isDark ? "#f3f4f6" : "#111827", fontWeight: 600, marginBottom: 4 }}
                formatter={(value: number) => [formatIdx(value), "IHSG"]}
                itemStyle={{ color: strokeColor }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={strokeColor}
                strokeWidth={2}
                fill="url(#ihsgGrad)"
                dot={false}
                activeDot={{ r: 5, fill: strokeColor, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardLayout>
  );
}
