class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}

class UnauthorisedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorisedError";
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export const PeerPrepErrors = {
  BadRequestError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  UnauthorisedError,
  ForbiddenError,
};
