export interface AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
}

export const createAppError = (
  message: string,
  statusCode: number,
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
  error.isOperational = true;

  return error;
};
