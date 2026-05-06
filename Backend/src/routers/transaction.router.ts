import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller";
import { authenticate } from "../middlewares/auth.middleware";

const transactionRouter = Router();

transactionRouter.use(authenticate);

transactionRouter.get("/", transactionController.getAll);
transactionRouter.get("/summary/daily", transactionController.getSummaryDaily);
transactionRouter.get("/summary/weekly", transactionController.getSummaryWeekly);
transactionRouter.get("/summary/monthly", transactionController.getSummaryMonthly);
transactionRouter.get("/summary/yearly", transactionController.getSummaryYearly);
transactionRouter.get("/dashboard-stats", transactionController.getDashboardStats);
transactionRouter.get("/:id", transactionController.getById);
transactionRouter.post("/", transactionController.create);
transactionRouter.put("/:id", transactionController.update);
transactionRouter.delete("/:id", transactionController.delete);

export default transactionRouter;
