import { Router } from "express";
import { userController } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", userController.getAll);
userRouter.get("/:id", userController.getById);
userRouter.put("/:id", userController.update);

export default userRouter;