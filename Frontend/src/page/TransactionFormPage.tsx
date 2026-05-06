import DashboardLayout from "../components/DashboardLayout";
import TransactionForm from "../components/TransactionForm";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function TransactionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/transactions" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? "Edit Transaksi" : "Input Transaksi"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {isEdit ? "Perbarui data transaksi saham" : "Catat take profit, cut loss, dividen, atau pengeluaran lain"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-colors">
          <TransactionForm editId={id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
