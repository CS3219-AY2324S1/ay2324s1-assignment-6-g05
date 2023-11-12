import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserProfile } from "../common/types";
import db from "./db";

const validatePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

const getJWTSecret = (): string => {
  return process.env.JWT_SECRET || "secret";
};

const getServiceSecret = (): string => {
  return process.env.SERVICE_SECRET || "secret";
};

const issueJWT = (userId: string) => {
  const payload = {
    sub: userId,
    iat: Date.now(),
  };

  const signedToken = jwt.sign(payload, getJWTSecret());

  return signedToken;
};

const validatePasswordResetToken = async (
  token: string,
  userId: string
): Promise<boolean> => {
  const secretKey = process.env.EMAIL_RESET_SECRET!;

  //jwt.verify will throw an error if the token is invalid (does not simply return false)
  try {
    const decoded = jwt.verify(token, secretKey) as { email: string };

    const user = await db.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        email: true,
        passwordResetToken: true,
      },
    });

    // 3 steps to verify if the token is valid:
    // 1. check if user id in the request exists in the database
    // 2. check if the decoded email in the token is the same as the user email in the database
    // 3. check if the decoded token in the token is the same as the user token in the database
    if (
      !user ||
      decoded.email !== user.email ||
      token !== user.passwordResetToken
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const validateVerificationToken = async (
  token: string,
  userId: string
): Promise<boolean> => {
  const secretKey = process.env.EMAIL_VERIFICATION_SECRET!;

  //jwt.verify will throw an error if the token is invalid (does not simply return false)
  try {
    const decoded = jwt.verify(token, secretKey) as { email: string };

    const user = await db.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        email: true,
        verificationToken: true,
      },
    });

    // 2 steps to verify if the token is valid:
    // 1. check if the decoded email in the token is the same as the user email in the database
    // 2. check if the decoded token in the token is the same as the user token in the database
    if (
      !user ||
      decoded.email !== user.email ||
      token !== user.verificationToken
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export {
  validatePassword,
  getJWTSecret,
  getServiceSecret,
  issueJWT,
  validatePasswordResetToken,
  validateVerificationToken,
};
