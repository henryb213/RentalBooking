import { z } from "zod";
import { userProfileSchema, userAddressSchema } from "./user";

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const SignInValidation = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be 8+ characters"),
  code: z.optional(z.string()),
});

export const SignUpValidation = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be 8+ characters"),
  profile: userProfileSchema.optional(),
  address: userAddressSchema.optional(),
});
