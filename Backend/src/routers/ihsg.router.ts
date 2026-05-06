import { Router } from "express";
import { ihsgController } from "../controllers/ihsg.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/historical", ihsgController.getHistorical);
router.get("/quote", ihsgController.getQuote);

export default router;
