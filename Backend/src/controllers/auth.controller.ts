import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      const user = await authService.register({ name, email, password });

      res.status(201).json({
        success: true,
        message: "register successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      res.cookie("token", result.token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: process.env.NODE_ENV === "production",
      });

      res.status(200).json({
        success: true,
        message: "login successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie("token");
    res.json({ success: true, message: "logged out" });
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.userId!);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },
};