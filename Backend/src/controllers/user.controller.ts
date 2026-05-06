import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";

const isCUID = (value: string) => /^c[a-z0-9]{24}$/.test(value);

export const userController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAll();
      res.status(200).json({
        success: true,
        message: "get all users successfully",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      if (!isCUID(id)) {
        res.status(400).json({ success: false, message: "invalid id" });
        return;
      }

      const user = await userService.getById(id);

      if (!user) {
        res.status(404).json({ success: false, message: "user not found" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "get user successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      if (!isCUID(id)) {
        res.status(400).json({ success: false, message: "invalid id" });
        return;
      }

      const user = await userService.update(id, req.body);

      res.status(200).json({
        success: true,
        message: "update user successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

};