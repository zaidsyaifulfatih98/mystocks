import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Wallet, RefreshCw, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import ChartSection from "../components/ChartSection";

interface DashboardStats {
  totalProfit: number;
  totalLoss: number;
  totalDividend: number;
  totalOther: number;
  netCashFlow: number;
  recentTransactions: RecentTx[];
}

interface RecentTx {
  id: string;
  date: string;
  type: string;
  stockCode?: string;
  stockName?: string;
  amount: number;
  notes?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  TAKE_PROFIT: { label: "Take Profit", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  CUT_LOSS: { label: "Cut Loss", color: "text-red-400", bg: "bg-red-500/10" },
  DIVIDEND: { label: "Dividen", color: "text-blue-400", bg: "bg-blue-500/10" },
  OTHER: { label: "Lainnya", color: "text-amber-400", bg: "bg-amber-500/10" },
};

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    api.get("/transactions/dashboard-stats")
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Selamat datang, {user?.name} 👋</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Net Cash Flow */}
            <div className={`lg:col-span-1 bg-white dark:bg-gray-900 border rounded-2xl p-4 transition-colors ${
              (stats?.netCashFlow ?? 0) >= 0 ? "border-emerald-500/30" : "border-red-500/30"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  (stats?.netCashFlow ?? 0) >= 0 ? "bg-emerald-500/15" : "bg-red-500/15"
                }`}>
                  <Wallet className={`w-4 h-4 ${(stats?.netCashFlow ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Net Cash Flow</span>
              </div>
              <p className={`text-xl font-bold ${(stats?.netCashFlow ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatIDR(stats?.netCashFlow ?? 0)}
              </p>
            </div>

            {/* Take Profit */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Take Profit</span>
              </div>
              <p className="text-xl font-bold text-emerald-400">{formatIDR(stats?.totalProfit ?? 0)}</p>
            </div>

            {/* Cut Loss */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cut Loss</span>
              </div>
              <p className="text-xl font-bold text-red-400">{formatIDR(stats?.totalLoss ?? 0)}</p>
            </div>

            {/* Dividend */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Dividen</span>
              </div>
              <p className="text-xl font-bold text-blue-400">{formatIDR(stats?.totalDividend ?? 0)}</p>
            </div>

            {/* Other */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Lainnya</span>
              </div>
              <p className="text-xl font-bold text-amber-400">{formatIDR(stats?.totalOther ?? 0)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-6">
            <ChartSection />
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Transaksi Terakhir</h3>
              <Link
                to="/transactions"
                className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300"
              >
                Lihat semua <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {(stats?.recentTransactions?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                <p>Belum ada transaksi.</p>
                <Link to="/transactions/new" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 mt-2 inline-block">
                  + Tambah transaksi pertama
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.recentTransactions.map((tx) => {
                  const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.OTHER;
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {tx.stockCode ? `${tx.stockCode}${tx.stockName ? ` — ${tx.stockName}` : ""}` : "—"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-semibold ${cfg.color}`}>
                        {tx.type === "CUT_LOSS" || tx.type === "OTHER" ? "-" : "+"}{formatIDR(tx.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
