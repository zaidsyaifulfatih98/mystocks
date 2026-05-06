import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";

type SummaryRow = { date?: string; week?: string; month?: string; year?: string; type: string; total: number };

type Granularity = "daily" | "weekly" | "monthly" | "yearly";

const TYPE_COLORS: Record<string, string> = {
  TAKE_PROFIT: "#10b981",
  CUT_LOSS: "#ef4444",
  DIVIDEND: "#3b82f6",
  OTHER: "#f59e0b",
};

const TYPE_LABELS: Record<string, string> = {
  TAKE_PROFIT: "Take Profit",
  CUT_LOSS: "Cut Loss",
  DIVIDEND: "Dividen",
  OTHER: "Lainnya",
};

function transformData(rows: SummaryRow[], granularity: Granularity) {
  const keyMap: Record<Granularity, string> = {
    daily: "date",
    weekly: "week",
    monthly: "month",
    yearly: "year",
  };
  const key = keyMap[granularity];
  const groups: Record<string, Record<string, number>> = {};

  for (const row of rows) {
    const label = (row as any)[key] as string;
    if (!groups[label]) groups[label] = {};
    groups[label][row.type] = Number(row.total);
  }

  return Object.entries(groups).map(([label, values]) => ({
    label,
    ...values,
  }));
}

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

const GRAN_LABELS: Record<Granularity, string> = {
  daily: "Harian (30 hari)",
  weekly: "Mingguan (12 minggu)",
  monthly: "Bulanan (12 bulan)",
  yearly: "Tahunan",
};

export default function ChartSection() {
  const [granularity, setGranularity] = useState<Granularity>("monthly");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setLoading(true);
    api.get(`/transactions/summary/${granularity}`)
      .then((res) => setData(transformData(res.data.data, granularity)))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [granularity]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="font-semibold text-gray-900 dark:text-white">Grafik Cash Flow</h3>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(["daily", "weekly", "monthly", "yearly"] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                granularity === g
                  ? "bg-emerald-500 text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {g === "daily" ? "Harian" : g === "weekly" ? "Mingguan" : g === "monthly" ? "Bulanan" : "Tahunan"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
          Belum ada data untuk periode ini
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
            <XAxis dataKey="label" tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`} tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#111827" : "#ffffff",
                border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                borderRadius: "8px",
              }}
              labelStyle={{ color: isDark ? "#f3f4f6" : "#111827" }}
              formatter={(value: number, name: string) => [formatIDR(value), TYPE_LABELS[name] || name]}
            />
            <Legend formatter={(name) => TYPE_LABELS[name] || name} wrapperStyle={{ fontSize: "12px", color: isDark ? "#9ca3af" : "#6b7280" }} />
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <Bar key={type} dataKey={type} name={type} fill={color} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">{GRAN_LABELS[granularity]}</p>
    </div>
  );
}
