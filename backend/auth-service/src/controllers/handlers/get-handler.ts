import { Request, Response } from "express";
import HttpStatusCode from "../../common/HttpStatusCode";
import db from "../../lib/db";
import { validatePasswordResetToken } from "../../lib/utils";

async function getHealth(_: Request, response: Response) {
  try {
    const result = await db.$queryRaw`SELECT 1`;

    if (!result) {
      throw new Error("No database connection from the server");
    }

    response.status(HttpStatusCode.OK).json({ message: "Healthy" });
  } catch (error) {
    console.log(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "No database connection from the server",
    });
  }
}

const verifyResetPasswordLinkValidity = async (
  request: Request,
  response: Response
) => {
  const userId = request.params.id;

  const token = request.params.token;

  const result = await validatePasswordResetToken(token, userId);

  if (!result) {
    response.status(HttpStatusCode.FORBIDDEN).json({
      error: "FORBIDDEN",
      message: "This reset password link is invalid.",
    });
    return;
  }

  response.status(HttpStatusCode.OK).json({
    success: true,
  });
};

export { getHealth, verifyResetPasswordLinkValidity };
