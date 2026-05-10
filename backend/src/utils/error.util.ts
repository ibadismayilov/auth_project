export const createAppError = (message: string, statusCode: number): IAppError => {
  const error = new Error(message) as IAppError;
  error.statusCode = statusCode;
  error.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
  error.isOperational = true;

  return error;
};
