/* -------------------------------------------------------------------------- */
/*                   Helpers to call User Service endpoints                   */
/* -------------------------------------------------------------------------- */

import { UserProfile } from "../common/types";
import { getServiceSecret } from "./utils";
import dotenv from "dotenv";

dotenv.config();

const getUserServiceEndpoint = (): string => {
  return process.env.USER_GATEWAY || `http://localhost:5005`;
};

const createUser = async (user: UserProfile) => {
  console.debug(
    `[createUser] fetch ${getUserServiceEndpoint()}/user/api/users/`
  );
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/`, {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });

  return res;
};

const updateVerificationToken = async (
  id: string,
  verificationToken: string
) => {
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({ verificationToken: verificationToken }),
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  console.debug(
    `[updatePasswordResetToken][${
      res.status
    }] fetch ${getUserServiceEndpoint()}/user/api/users/${id}`
  );
  return res;
};

const updateVerification = async (id: string) => {
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
    body: JSON.stringify({ verificationToken: "", isVerified: true }),
  });

  console.debug(
    `[updateVerification][${
      res.status
    }] fetch ${getUserServiceEndpoint()}/user/api/users/${id}`
  );
  return res;
};

const updatePasswordResetToken = async (
  id: string,
  passwordResetToken: string
) => {
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({ passwordResetToken: passwordResetToken }),
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  console.debug(
    `[updatePasswordResetToken][${
      res.status
    }] fetch ${getUserServiceEndpoint()}/user/api/users/${id}`
  );
  return res;
};

const updatePassword = async (id: string, updateBody: {}) => {
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(updateBody),
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  console.debug(
    `[updatePassword][${
      res.status
    }] fetch ${getUserServiceEndpoint()}/user/api/users/${id}`
  );
  return res;
};

export const UserService = {
  createUser,
  getUserServiceEndpoint,
  updateVerification,
  updateVerificationToken,
  updatePasswordResetToken,
  updatePassword,
};
