import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(1, "name.required"),
  email: z.email("email.invalid"),
  password: z.string().min(8, "password.min"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;
