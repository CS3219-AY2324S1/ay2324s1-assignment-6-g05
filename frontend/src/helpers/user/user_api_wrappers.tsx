import api from "@/helpers/endpoint";
import { getLogger } from "@/helpers/logger";
import { HTTP_METHODS, DOMAIN } from "@/types/enums";
import User from "../../types/user";
import HttpStatusCode from "@/types/HttpStatusCode";
import { getError, throwAndLogError } from "@/utils/errorUtils";
import Preference from "@/types/preference";

const logger = getLogger("user_api_wrappers");

const domain = DOMAIN.USER;
const scope = [DOMAIN.USER];
const resourceUser = "users";

const getUserByEmail = async (
  email: string,
  cache: RequestCache = "no-cache"
): Promise<User | undefined> => {
  const response = await api({
    method: HTTP_METHODS.GET,
    domain: domain,
    path: `${resourceUser}/email?email=${email}`,
    tags: scope,
    cache: cache,
  });

  if (response.status === HttpStatusCode.OK) {
    const user = response.data as User;
    return user;
  }

  return throwAndLogError(
    "getUserByEmail",
    response.message,
    getError(response.status)
  );
};

const getUserById = async (
  id: string,
  cache: RequestCache = "no-cache"
): Promise<User> => {
  // call GET /api/users/:id from user domain
  const response = await api({
    method: HTTP_METHODS.GET,
    domain: domain,
    path: `${resourceUser}/${id}`,
    tags: scope,
    cache: cache,
  });

  // successful response should return 200 with the user data
  if (response.status === HttpStatusCode.OK) {
    const user = response.data as User;
    return user;
  }

  return throwAndLogError(
    "getUserById",
    response.message,
    getError(response.status)
  );
};

const createUser = async (user: User, cache: RequestCache = "no-cache") => {
  // call POST /api/users from user domain
  const response = await api({
    method: HTTP_METHODS.POST,
    domain: domain,
    path: resourceUser,
    tags: scope,
    body: user,
    cache: cache,
  });

  // successful response should return 201 and userid
  if (response.status === HttpStatusCode.CREATED) {
    // res contains { id: string, message: "User created"}
    const res = response.data as { id: string; message: string };
    return res;
  }

  return throwAndLogError(
    "createUser",
    response.message,
    getError(response.status)
  );
};

const updateUser = async (id: string, user: User) => {
  // call PUT /api/users/:id from user domain
  const response = await api({
    method: HTTP_METHODS.PUT,
    domain: domain,
    path: `${resourceUser}/${id}`,
    body: user,
    tags: scope,
  });

  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "updateUser",
    response.message,
    getError(response.status)
  );
};

const deleteUser = async (id: string) => {
  // call DELETE /api/users/:id from user domain
  const response = await api({
    method: HTTP_METHODS.DELETE,
    domain: domain,
    path: `${resourceUser}/${id}`,
    tags: scope,
  });

  // successful response should return 204
  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "deleteUser",
    response.message,
    getError(response.status)
  );
};

const getUserPreferenceById = async (id: string) => {
  // call GET /api/users/:id/preferences from user domain
  const response = await api({
    method: HTTP_METHODS.GET,
    domain: domain,
    path: `${resourceUser}/${id}/preferences`,
    tags: scope,
  });

  // successful response should return 200 with the user preference data
  if (response.status === HttpStatusCode.OK) {
    const userPreference = response.data as Preference;
    return userPreference;
  }

  return throwAndLogError(
    "getUserPreferenceById",
    response.message,
    getError(response.status)
  );
};

const updateUserPreference = async (
  id: string,
  userPreference: Preference,
  cache: RequestCache = "no-cache"
) => {
  // call PUT /api/users/:id/preferences from user domain
  const response = await api({
    method: HTTP_METHODS.PUT,
    domain: domain,
    path: `${resourceUser}/${id}/preferences`,
    body: userPreference,
    tags: scope,
    cache: cache,
  });

  // successful response should return 204
  if (response.status === HttpStatusCode.NO_CONTENT) {
    // revalidateTag(DOMAIN.USER);
    return true;
  }

  return throwAndLogError(
    "updateUserPreference",
    response.message,
    getError(response.status)
  );
};

export const UserService = {
  //async endpoint functions
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getUserPreferenceById,
  updateUserPreference,
};
