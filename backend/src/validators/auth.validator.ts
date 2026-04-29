import z from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Please enter a valid email!").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be minimum 8 characters!")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[0-9]/, "Password must contain at least one digit."),
    username: z
      .string()
      .min(2, "Username is short")
      .max(30, "Username is too long")
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Please enter a valid email!").trim().toLowerCase(),
    password: z.string().min(1, "Password is required"),
  }),
});
