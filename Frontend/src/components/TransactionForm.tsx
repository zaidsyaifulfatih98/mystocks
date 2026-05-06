import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X } from "lucide-react";
import api from "../utils/api";

const TYPES = [
  { value: "TAKE_PROFIT", label: "Take Profit", color: "text-emerald-400" },
  { value: "CUT_LOSS", label: "Cut Loss", color: "text-red-400" },
  { value: "DIVIDEND", label: "Dividen", color: "text-blue-400" },
  { value: "OTHER", label: "Lainnya", color: "text-amber-400" },
];

interface FormState {
  date: string;
  type: string;
  stockCode: string;
  amount: string;
  notes: string;
}

const DEFAULT_FORM: FormState = {
  date: new Date().toISOString().split("T")[0],
  type: "TAKE_PROFIT",
  stockCode: "",
  amount: "",
  notes: "",
};

interface TransactionFormProps {
  editId?: string;
}

export default function TransactionForm({ editId }: TransactionFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editId) return;
    setFetchLoading(true);
    api.get(`/transactions/${editId}`)
      .then((res) => {
        const d = res.data.data;
        setForm({
          date: d.date.split("T")[0],
          type: d.type,
          stockCode: d.stockCode ?? "",
          amount: String(d.amount),
          notes: d.notes ?? "",
        });
      })
      .catch(() => setError("Gagal memuat data transaksi."))
      .finally(() => setFetchLoading(false));
  }, [editId]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      date: form.date,
      type: form.type,
      stockCode: form.stockCode || undefined,
      amount: parseFloat(form.amount),
      notes: form.notes || undefined,
    };

    try {
      if (editId) {
        await api.put(`/transactions/${editId}`, payload);
      } else {
        await api.post("/transactions", payload);
      }
      navigate("/transactions");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menyimpan transaksi.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Row: Date + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tanggal *</label>
          <input type="date" value={form.date} onChange={set("date")} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Jenis Transaksi *</label>
          <select value={form.type} onChange={set("type")} required className={inputClass}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Code */}
      <div>
        <label className={labelClass}>Kode Saham</label>
        <input
          type="text"
          value={form.stockCode}
          onChange={(e) => setForm((p) => ({ ...p, stockCode: e.target.value.toUpperCase() }))}
          placeholder="BBCA, TLKM, BBRI..."
          maxLength={10}
          className={inputClass}
        />
      </div>

      {/* Amount */}
      <div>
        <label className={labelClass}>Jumlah (IDR) *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-medium">Rp</span>
          <input
            type="number"
            value={form.amount}
            onChange={set("amount")}
            required
            min={0}
            step="any"
            placeholder="0"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Catatan</label>
        <textarea
          value={form.notes}
          onChange={set("notes")}
          rows={3}
          placeholder="Catatan opsional..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          {loading ? "Menyimpan..." : editId ? "Perbarui" : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/transactions")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm transition-colors"
        >
          <X className="w-4 h-4" />
          Batal
        </button>
      </div>
    </form>
  );
}
