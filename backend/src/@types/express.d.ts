import { User } from "@prisma/client";

type UserWithoutPassword = Omit<User, "password">;

declare global {
  namespace Express {
    interface Request {
      user?: UserWithoutPassword;
    }
  }
}
