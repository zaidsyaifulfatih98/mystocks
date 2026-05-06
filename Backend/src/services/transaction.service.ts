import prisma from "../configs/prisma-client.config";

export type TransactionType = "TAKE_PROFIT" | "CUT_LOSS" | "DIVIDEND" | "OTHER";

export type CreateTransactionInput = {
  date: string;
  type: TransactionType;
  stockCode?: string;
  amount: number;
  notes?: string;
};

export const transactionService = {
  async getAll(userId: string) {
    return await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
  },

  async getById(id: string, userId: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!tx) throw new Error("Transaction not found");
    return tx;
  },

  async create(userId: string, data: CreateTransactionInput) {
    return await prisma.transaction.create({
      data: {
        date: new Date(data.date),
        type: data.type,
        stockCode: data.stockCode,
        amount: data.amount,
        notes: data.notes,
        userId,
      },
    });
  },

  async update(id: string, userId: string, data: Partial<CreateTransactionInput>) {
    const tx = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!tx) throw new Error("Transaction not found");
    return await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.stockCode !== undefined ? { stockCode: data.stockCode } : {}),
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });
  },

  async delete(id: string, userId: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!tx) throw new Error("Transaction not found");
    return await prisma.transaction.delete({ where: { id } });
  },

  async getSummaryDaily(userId: string) {
    const rows = await prisma.$queryRaw<
      { date: string; type: string; total: number }[]
    >`
      SELECT
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        type,
        SUM(amount) as total
      FROM "Transaction"
      WHERE "userId" = ${userId}
        AND date >= NOW() - INTERVAL '30 days'
      GROUP BY date, type
      ORDER BY date ASC
    `;
    return rows;
  },

  async getSummaryWeekly(userId: string) {
    const rows = await prisma.$queryRaw<
      { week: string; type: string; total: number }[]
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('week', date), 'YYYY-MM-DD') as week,
        type,
        SUM(amount) as total
      FROM "Transaction"
      WHERE "userId" = ${userId}
        AND date >= NOW() - INTERVAL '12 weeks'
      GROUP BY week, type
      ORDER BY week ASC
    `;
    return rows;
  },

  async getSummaryMonthly(userId: string) {
    const rows = await prisma.$queryRaw<
      { month: string; type: string; total: number }[]
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') as month,
        type,
        SUM(amount) as total
      FROM "Transaction"
      WHERE "userId" = ${userId}
        AND date >= NOW() - INTERVAL '12 months'
      GROUP BY month, type
      ORDER BY month ASC
    `;
    return rows;
  },

  async getSummaryYearly(userId: string) {
    const rows = await prisma.$queryRaw<
      { year: string; type: string; total: number }[]
    >`
      SELECT
        EXTRACT(YEAR FROM date)::text as year,
        type,
        SUM(amount) as total
      FROM "Transaction"
      WHERE "userId" = ${userId}
      GROUP BY year, type
      ORDER BY year ASC
    `;
    return rows;
  },

  async getDashboardStats(userId: string) {
    const [totalProfit, totalLoss, totalDividend, totalOther, recent] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: "TAKE_PROFIT" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "CUT_LOSS" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "DIVIDEND" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "OTHER" },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ]);

    return {
      totalProfit: totalProfit._sum.amount ?? 0,
      totalLoss: totalLoss._sum.amount ?? 0,
      totalDividend: totalDividend._sum.amount ?? 0,
      totalOther: totalOther._sum.amount ?? 0,
      netCashFlow:
        (totalProfit._sum.amount ?? 0) +
        (totalDividend._sum.amount ?? 0) -
        (totalLoss._sum.amount ?? 0) -
        (totalOther._sum.amount ?? 0),
      recentTransactions: recent,
    };
  },
};
