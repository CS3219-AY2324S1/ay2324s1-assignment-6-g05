import { getLogger } from "@/helpers/logger";
import HttpStatusCode from "@/types/HttpStatusCode";
import { PeerPrepErrors } from "@/types/PeerPrepErrors";

const logger = getLogger("exception");

export function throwAndLogError<T extends Error>(
  endpoint: string,
  message: string,
  type: new (message: string) => T
): never {
  logger.error(`[${endpoint}] ${message}`);
  throw new type(message);
}

export function getError(status: HttpStatusCode) {
  switch (status) {
    case HttpStatusCode.BAD_REQUEST:
      return PeerPrepErrors.BadRequestError;
    case HttpStatusCode.NOT_FOUND:
      return PeerPrepErrors.NotFoundError;
    case HttpStatusCode.CONFLICT:
      return PeerPrepErrors.ConflictError;
    default:
      return PeerPrepErrors.InternalServerError;
  }
}
