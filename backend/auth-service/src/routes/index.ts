import { Router } from "express";
import {
  getHealth,
  verifyResetPasswordLinkValidity,
} from "../controllers/handlers/get-handler";
import {
  logInByEmail,
  registerByEmail,
  logOut,
} from "../controllers/handlers/post-handler";
import {
  verifyUserEmail,
  sendPasswordResetEmail,
  changePassword,
  resendVerificationEmail,
} from "../controllers/handlers/put-handler";
import passport from "passport";
import HttpStatusCode from "../common/HttpStatusCode";
import { Role, UserProfile } from "../common/types";

const router: Router = Router();

router.route("/health").get(getHealth);

router.route("/registerByEmail").post(registerByEmail);

router.route("/loginByEmail").post(logInByEmail);

router
  .route("/validate")
  .post(passport.authenticate("jwt", { session: false }), (req, res, next) => {
    // If user db is down, req.user will be an empty object
    if (req.user && Object.keys(req.user).length === 0) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        error: "INTERNAL SERVER ERROR",
        message: "User database is down.",
      });
      return;
    }
    res.status(HttpStatusCode.OK).json(req.user);
  });

router
  .route("/validateAdmin")
  .post(passport.authenticate("jwt", { session: false }), (req, res, next) => {
    // If user service is down, req.user will be an empty object
    if (req.user && Object.keys(req.user).length === 0) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        error: "INTERNAL SERVER ERROR",
        message: "User database is down.",
      });
      return;
    }

    const user = req.user as UserProfile;
    if (user.role !== Role.ADMIN) {
      res.status(HttpStatusCode.FORBIDDEN).json({
        error: "Forbidden",
        message: "You are not authorized to access this resource.",
      });
      return;
    }

    res.status(HttpStatusCode.OK).json(req.user);
  });

router.route("/logout").post(logOut);

router.route("/verifyEmail/:email/:token").put(verifyUserEmail);

router.route("/resendVerificationEmail/:email").put(resendVerificationEmail);

router.route("/sendPasswordResetEmail/:email").put(sendPasswordResetEmail);

router
  .route("/verifyResetPasswordLinkValidity/:id/:token")
  .get(verifyResetPasswordLinkValidity);

router.route("/changePassword/:id").put(changePassword);

export default router;
