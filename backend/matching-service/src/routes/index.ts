import { Router } from "express";
import {
  getHealth, getStatus,
} from "../controllers";

const router: Router = Router();

router.route("/health").get(getHealth);

router.route("/status").get(getStatus);

export default router;
