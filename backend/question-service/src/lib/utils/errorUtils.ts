import { ZodError } from "zod";

export function formatErrorMessage(error: ZodError<any>) {
  let errorMessage = JSON.parse(error.message)[0];
  if (errorMessage.message === "Required") {
    const paths = JSON.parse(error.message)[0].path;
    const errorField =
      paths.length > 1 ? paths[paths.length - 1] + " in " + paths[0] : paths[0];
    errorMessage = `${
      errorField[0].toUpperCase() + errorField.substr(1)
    } is required.`;
  } else if (errorMessage.minimum || errorMessage.maximum) {
    errorMessage = `Invalid ${errorMessage.path[0]}. ${errorMessage.message}`;
  }
  return Object.keys(errorMessage).includes("message")
    ? errorMessage.message
    : errorMessage;
}
