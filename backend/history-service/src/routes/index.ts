import { Router } from "express";
import {
  deleteHistory,
  getHealth,
  getHistory,
  getQuestionCodeHistory,
  postHistory,
  updateQuestionCodeSubmission,
} from "../controllers";

const router: Router = Router();

router.route("/health").get(getHealth);

router.route("/history").get(getHistory);

router.route("/history").post(postHistory);

router
  .route("/history/user/:userId/question/:questionId")
  .delete(deleteHistory);

router
  .route("/history/user/:userId/question/:questionId/code")
  .get(getQuestionCodeHistory);

router
  .route("/history/user/:userId/question/:questionId/code")
  .put(updateQuestionCodeSubmission);

export default router;
