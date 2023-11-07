import { Request, Response } from "express";
import HttpStatusCode from "../../common/HttpStatusCode";
import { UserService } from "../../lib/user_api_helpers";
import { issueJWT, validatePassword } from "../../lib/utils";
import { UserProfile } from "../../common/types";
import { VerificationMail } from "../../lib/email/verificationMail";
import db from "../../lib/db";
import jwt from "jsonwebtoken";

const registerByEmail = async (request: Request, response: Response) => {
  try {
    if (!request.body || Object.keys(request.body).length === 0) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Request body is missing.",
      });
      return;
    }

    const { name, email, password, role } = request.body;

    if (!name || !email || !password || !role) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Name, email, password, and role are required.",
      });
      return;
    }

    // check no extra properties
    const allowedProperties = ["name", "email", "password", "role"];
    const requestProperties = Object.keys(request.body);

    const hasExtraProperties = requestProperties.some(
      (property) => !allowedProperties.includes(property)
    );

    if (hasExtraProperties) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Invalid properties.",
      });
      return;
    }

    // generate verification token for email verification
    const secretKey = process.env.EMAIL_VERIFICATION_SECRET || "secret";

    const verificationToken = jwt.sign(
      { email: request.body.email },
      secretKey
    );

    const userData = {
      ...request.body,
      verificationToken: verificationToken,
    };

    const res = await UserService.createUser(userData);

    if (res.status !== HttpStatusCode.CREATED) {
      const data = await res.json();
      response.status(res.status).json({
        error: data.error,
        message: data.message,
      });
      return;
    }

    const user = await res.json();

    const mail = new VerificationMail(user.email, verificationToken);
    await mail.send();

    response.status(HttpStatusCode.CREATED).json({
      success: true,
      userId: user.id,
    });
  } catch (error) {
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "User service is down.",
    });
  }
};

const logInByEmail = async (request: Request, response: Response) => {
  try {
    if (!request.body || Object.keys(request.body).length === 0) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Request body is missing.",
      });
      return;
    }

    const { email, password } = request.body;

    if (!email || !password) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Email and password are required.",
      });
      return;
    }

    // check no extra properties
    const allowedProperties = ["email", "password"];
    const requestProperties = Object.keys(request.body);

    const hasExtraProperties = requestProperties.some(
      (property) => !allowedProperties.includes(property)
    );

    if (hasExtraProperties) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Invalid properties.",
      });
      return;
    }

    const user = await db.user.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        isVerified: true,
        role: true,
        gender: true,
        bio: true,
        image: true,
        createdOn: true,
        updatedOn: true,
        preferences: {
          select: {
            languages: true,
            topics: true,
            difficulties: true,
          },
        },
      },
    });

    if (!user) {
      response.status(HttpStatusCode.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: `The user credentials are incorrect.`,
      });
      return;
    }

    // check if user is verified
    if (!user.isVerified) {
      response.status(HttpStatusCode.FORBIDDEN).json({
        error: "FORBIDDEN",
        message: `User is not verified.`,
      });
      return;
    }

    // if user exists, check if password is correct
    if (!(await validatePassword(password, user.password!))) {
      response.status(HttpStatusCode.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: `The user credentials are incorrect.`,
      });
      return;
    }

    // if user exists, check if password is correct
    if (!(await validatePassword(password, user.password!))) {
      response.status(HttpStatusCode.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: `The user credentials are incorrect.`,
      });
      return;
    }

    //user exists + pw is correct + user is verified -> attach cookie and return user
    const tokenObject = issueJWT(user.id);

    //remove password from user object
    let { password: _, ...userWithoutPassword } = user;

    userWithoutPassword = userWithoutPassword as UserProfile;

    response
      .cookie("jwt", tokenObject, { httpOnly: true, secure: false })
      .status(HttpStatusCode.OK)
      .json({
        success: true,
        user: userWithoutPassword,
      });
  } catch (error) {
    console.log(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "Internal server error",
    });
  }
};

const logOut = async (_: Request, response: Response) => {
  response.clearCookie("jwt");
  response.status(HttpStatusCode.OK).json({
    success: true,
  });
};

export { registerByEmail, logInByEmail, logOut };
