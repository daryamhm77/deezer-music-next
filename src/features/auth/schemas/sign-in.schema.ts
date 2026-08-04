import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("email.invalid"),
  password: z.string().min(8, "password.min"),
});

export type SignInValues = z.infer<typeof signInSchema>;
