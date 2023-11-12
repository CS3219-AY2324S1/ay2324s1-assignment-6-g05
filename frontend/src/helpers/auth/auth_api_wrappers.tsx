import HttpStatusCode from "@/types/HttpStatusCode";
import { getLogger } from "@/helpers/logger";
import { HTTP_METHODS, DOMAIN } from "@/types/enums";
import { throwAndLogError } from "@/utils/errorUtils";
import api from "../endpoint";
import { PeerPrepErrors } from "@/types/PeerPrepErrors";
import User from "@/types/user";

const logger = getLogger("auth_api_wrappers");

const domain = DOMAIN.AUTH;
const scope = [DOMAIN.AUTH];

const logInByEmail = async (
  email: string,
  password: string,
  cache: RequestCache = "default"
): Promise<User | undefined> => {
  // call POST /auth/api/loginByEmail from auth domain
  const response = await api({
    method: HTTP_METHODS.POST,
    domain: domain,
    path: "loginByEmail",
    body: { email, password },
    tags: scope,
    cache: cache,
  });

  if (response.status === HttpStatusCode.OK) {
    const user = (await response.data.user) as User;

    return user;
  }

  return throwAndLogError(
    "logInByEmail",
    response.message,
    getError(response.status)
  );
};

const registerByEmail = async (user: User, cache: RequestCache = "default") => {
  // call POST /auth/api/registerbyEmail from auth domain
  const response = await api({
    method: HTTP_METHODS.POST,
    domain: domain,
    path: "registerByEmail",
    body: user,
    tags: scope,
    cache: cache,
  });

  // successful response should return 201 and userid
  if (response.status === HttpStatusCode.CREATED) {
    const res = response.data as { id: string; message: string };
    return res;
  }

  return throwAndLogError(
    "registerByEmail",
    response.message,
    getError(response.status)
  );
};

const validateUser = async (jwt: string = "", cache: RequestCache = "no-cache") => {
  // call POST /auth/api/validate from auth domain
  const response = await api({
    method: HTTP_METHODS.POST,
    header: {
      Cookie: `jwt=${jwt}`,
    },
    domain: domain,
    path: "validate",
    tags: scope,
    cache: cache,
  });

  if (response.status === HttpStatusCode.OK) {
    const user = response.data as User;
    return user;
  }

  return throwAndLogError(
    "validateUser",
    "User is not authenticated",
    getError(response.status)
  );
};

const logOut = async () => {
  // call POST /auth/api/logout from auth domain, which will also handle the routing
  const response = await api({
    method: HTTP_METHODS.POST,
    domain: domain,
    path: "logout",
    tags: scope,
    deleteJWTCookie: true,
  });
  return response;
};

const verifyEmail = async (email: string, token: string) => {
  // call PUT /auth/api/verifyEmail/:email/:token from auth domain
  const response = await api({
    method: HTTP_METHODS.PUT,
    domain: domain,
    path: `verifyEmail/${email}/${token}`,
    tags: scope,
  });

  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "verifyEmail",
    response.message,
    getError(response.status)
  );
};

const resendVerificationEmail = async (email: string) => {
  // call PUT /auth/api/resendVerificationEmail/:email from auth domain
  const response = await api({
    method: HTTP_METHODS.PUT,
    domain: domain,
    path: `resendVerificationEmail/${email}`,
    tags: scope,
  });

  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "resendVerificationEmail",
    response.message,
    getError(response.status)
  );
};

const sendPasswordResetEmail = async (email: string) => {
  // call PUT /auth/api/sendPasswordResetEmail from auth domain
  const response = await api({
    method: HTTP_METHODS.PUT,
    domain: domain,
    path: `sendPasswordResetEmail/${email}`,
    tags: scope,
  });
  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "sendPasswordResetEmail",
    response.message,
    getError(response.status)
  );
};

const verifyPasswordResetLinkValidity = async (id: string, token: string) => {
  // call GET /auth/api/verifyResetPasswordLinkValidity/:id from auth domain
  const response = await api({
    method: HTTP_METHODS.GET,
    domain: domain,
    path: `verifyResetPasswordLinkValidity/${id}/${token}`,
    tags: scope,
  });

  if (response.status === HttpStatusCode.OK) {
    return true;
  }

  return throwAndLogError(
    "verifyPasswordResetLinkValidity",
    response.message,
    getError(response.status)
  );
};
const changePassword = async ({
  id,
  token,
  oldPassword,
  hashedNewPassword,
}: {
  id: string;
  token?: string;
  oldPassword?: string;
  hashedNewPassword: string;
}) => {
  // call PUT /auth/api/changePassword/:id from auth domain
  const response = await api({
    method: HTTP_METHODS.PUT,
    domain: domain,
    path: `changePassword/${id}`,
    body: {
      ...(token !== undefined && { token }),
      ...(oldPassword !== undefined && { oldPassword: oldPassword }),
      hashedNewPassword,
    },
    tags: scope,
  });

  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "sendPasswordResetEmail",
    response.message,
    getError(response.status)
  );
};

function getError(status: HttpStatusCode) {
  switch (status) {
    case HttpStatusCode.BAD_REQUEST:
      return PeerPrepErrors.BadRequestError;
    case HttpStatusCode.NOT_FOUND:
      return PeerPrepErrors.NotFoundError;
    case HttpStatusCode.CONFLICT:
      return PeerPrepErrors.ConflictError;
    case HttpStatusCode.UNAUTHORIZED:
      return PeerPrepErrors.UnauthorisedError;
    case HttpStatusCode.FORBIDDEN:
      return PeerPrepErrors.ForbiddenError;
    default:
      return PeerPrepErrors.InternalServerError;
  }
}

export const AuthService = {
  logInByEmail,
  registerByEmail,
  validateUser,
  logOut,
  verifyEmail,
  resendVerificationEmail,
  sendPasswordResetEmail,
  verifyPasswordResetLinkValidity,
  changePassword,
};
