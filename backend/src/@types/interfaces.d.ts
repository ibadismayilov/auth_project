import { Role } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { CreateEmailResponse } from "resend";

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
    role?: Role;
  }

  interface IEmailResponse {
    success: boolean;
    data?: CreateEmailResponse["data"];
    error?: CreateEmailResponse["error"];
  }

  interface IEmailFormat {
    userEmail: string;
    subject: string;
    htmlContent: string;
  }
  
  interface IVerifyInput {
    email: string,
    code: string
  }
}

export {};
