import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { transactionService } from "../services/transaction.service";

export const transactionController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await transactionService.getAll(req.userId!);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await transactionService.getById(req.params.id as string, req.userId!);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await transactionService.create(req.userId!, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await transactionService.update(req.params.id as string, req.userId!, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await transactionService.delete(req.params.id as string, req.userId!);
      res.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  async getSummaryDaily(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await transactionService.getSummaryDaily(req.userId!);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getSummaryWeekly(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await transactionService.getSummaryWeekly(req.userId!);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getSummaryMonthly(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await transactionService.getSummaryMonthly(req.userId!);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getSummaryYearly(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await transactionService.getSummaryYearly(req.userId!);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await transactionService.getDashboardStats(req.userId!);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
