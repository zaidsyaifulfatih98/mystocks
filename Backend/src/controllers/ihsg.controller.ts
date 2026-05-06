import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ihsgService, type IHSGPeriod } from "../services/ihsg.service";

const VALID_PERIODS: IHSGPeriod[] = ["1wk", "1mo", "6mo", "1y", "5y"];

export const ihsgController = {
  async getHistorical(req: AuthRequest, res: Response) {
    try {
      const period = (req.query.period as string) || "1mo";
      if (!VALID_PERIODS.includes(period as IHSGPeriod)) {
        res.status(400).json({ message: "Period tidak valid. Gunakan: 1wk, 1mo, 6mo, 1y, 5y" });
        return;
      }
      const data = await ihsgService.getHistorical(period as IHSGPeriod);
      res.json({ data });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Gagal mengambil data historis IHSG" });
    }
  },

  async getQuote(req: AuthRequest, res: Response) {
    try {
      const data = await ihsgService.getQuote();
      res.json({ data });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Gagal mengambil data quote IHSG" });
    }
  },
};
