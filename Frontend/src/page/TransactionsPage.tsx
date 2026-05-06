import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle, Trash2, Pencil, Search, TrendingUp, TrendingDown, DollarSign, Wallet,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import api from "../utils/api";
import DashboardLayout from "../components/DashboardLayout";

interface Transaction {
  id: string;
  date: string;
  type: string;
  stockCode?: string;
  amount: number;
  notes?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  TAKE_PROFIT: { label: "Take Profit", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: TrendingUp },
  CUT_LOSS: { label: "Cut Loss", color: "text-red-400", bg: "bg-red-500/10", icon: TrendingDown },
  DIVIDEND: { label: "Dividen", color: "text-blue-400", bg: "bg-blue-500/10", icon: DollarSign },
  OTHER: { label: "Lainnya", color: "text-amber-400", bg: "bg-amber-500/10", icon: Wallet },
};

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAll = () => {
    setLoading(true);
    api.get("/transactions")
      .then((res) => setTransactions(res.data.data))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    setDeleting(id);
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Gagal menghapus transaksi.");
    } finally {
      setDeleting(null);
    }
  };

  // Filter
  const filtered = transactions.filter((tx) => {
    const matchType = filterType === "ALL" || tx.type === filterType;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (tx.stockCode ?? "").toLowerCase().includes(q) ||
      (tx.notes ?? "").toLowerCase().includes(q);
    const txDate = tx.date.slice(0, 10);
    const matchFrom = !dateFrom || txDate >= dateFrom;
    const matchTo = !dateTo || txDate <= dateTo;
    return matchType && matchSearch && matchFrom && matchTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Running total: computed over ALL transactions sorted by date asc
  const runningTotalMap = new Map<string, number>();
  let running = 0;
  const sortedAll = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  for (const tx of sortedAll) {
    if (tx.type === "TAKE_PROFIT" || tx.type === "DIVIDEND") {
      running += tx.amount;
    } else {
      running -= tx.amount;
    }
    runningTotalMap.set(tx.id, running);
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Semua Transaksi</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{filtered.length} transaksi ditemukan</p>
        </div>
        <Link
          to="/transactions/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Input Transaksi
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-4">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Cari kode saham, catatan..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Date range */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="flex-1 min-w-0 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
            <span className="text-gray-400 dark:text-gray-500 text-sm shrink-0">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="flex-1 min-w-0 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-400 dark:hover:text-red-400 transition-colors shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
          {["ALL", "TAKE_PROFIT", "CUT_LOSS", "DIVIDEND", "OTHER"].map((type) => (
            <button
              key={type}
              onClick={() => { setFilterType(type); setPage(1); }}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === type
                  ? "bg-emerald-500 text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {type === "ALL" ? "Semua" : TYPE_CONFIG[type]?.label ?? type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-colors">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
            <p className="mb-2">Tidak ada transaksi ditemukan.</p>
            {transactions.length === 0 && (
              <Link to="/transactions/new" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300">
                + Tambah transaksi pertama
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-800">
              {paginated.map((tx) => {
                const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.OTHER;
                const Icon = cfg.icon;
                const total = runningTotalMap.get(tx.id) ?? 0;
                return (
                  <div key={tx.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                        {tx.stockCode && (
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{tx.stockCode}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link
                          to={`/transactions/${tx.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deleting === tx.id}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.date)}</span>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${cfg.color}`}>
                          {tx.type === "CUT_LOSS" || tx.type === "OTHER" ? "-" : "+"}{formatIDR(tx.amount)}
                        </div>
                        <div className={`text-xs font-medium ${total >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                          Total: {formatIDR(total)}
                        </div>
                      </div>
                    </div>
                    {tx.notes && (
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 truncate">{tx.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Jenis</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Saham</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Aset</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Catatan</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tx) => {
                    const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.OTHER;
                    const Icon = cfg.icon;
                    return (
                      <tr key={tx.id} className="border-b border-gray-200/70 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(tx.date)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {tx.stockCode ? (
                            <span className="font-semibold text-gray-900 dark:text-white">{tx.stockCode}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">—</span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${cfg.color}`}>
                          {tx.type === "CUT_LOSS" || tx.type === "OTHER" ? "-" : "+"}{formatIDR(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {(() => {
                            const total = runningTotalMap.get(tx.id) ?? 0;
                            return (
                              <span className={total >= 0 ? "font-semibold text-emerald-600 dark:text-emerald-400" : "font-semibold text-red-500 dark:text-red-400"}>
                                {formatIDR(total)}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-gray-400 dark:text-gray-500 max-w-[160px] truncate">
                          {tx.notes || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <Link
                              to={`/transactions/${tx.id}/edit`}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              disabled={deleting === tx.id}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                <span className="text-xs text-gray-500">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
