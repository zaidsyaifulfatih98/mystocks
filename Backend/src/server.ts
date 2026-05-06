import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.router";
import transactionRouter from "./routers/transaction.router";
import ihsgRouter from "./routers/ihsg.router";
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/ihsg", ihsgRouter);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "MyStocks API is running" });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: err.message });
});

// Local dev
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;