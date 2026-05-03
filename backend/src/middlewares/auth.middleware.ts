import { catchAsync } from "../utils/catch.async";
import { createAppError } from "../utils/error.util";
import { verifyAccessToken } from "../utils/jwt.util";
import { prisma } from "../lib/prisma";

export const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createAppError("Unauthorized", 401));
  }

  const token = authHeader.split(" ")[1];

  let verify;

  try {
    verify = verifyAccessToken(token);
  } catch {
    return next(createAppError("Invalid or expired token", 401));
  }

  const current_user = await prisma.user.findUnique({
    where: { id: verify.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  if (!current_user)
    return next(
      createAppError("The user with this token no longer exists.", 401),
    );

  req.user = current_user;

  next();
});
