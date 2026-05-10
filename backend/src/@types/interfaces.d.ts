import { Role } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

declare global {
  interface IAppError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
    errors?: any[];
  }

  interface IRegisterInput {
    username: string;
    email: string;
    password: string;
  }

  interface ILoginInput {
    email: string;
    password: string;
  }

  interface ITokenPayload extends JwtPayload {
    id: string;
    role?: Role
  }
}

export {};
