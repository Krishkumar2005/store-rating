import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password must not exceed 16 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character"
  );

export const registerSchema = z.object({
  name: z
    .string()
    .min(20, "Name must be at least 20 characters")
    .max(60, "Name must not exceed 60 characters"),
  email: z.string().email("Please enter a valid email address"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(400, "Address must not exceed 400 characters"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createUserSchema = z.object({
  name: z
    .string()
    .min(20, "Name must be at least 20 characters")
    .max(60, "Name must not exceed 60 characters"),
  email: z.string().email("Please enter a valid email address"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(400, "Address must not exceed 400 characters"),
  password: passwordSchema,
  role: z.enum(["ADMIN", "USER", "STORE_OWNER"]),
});

export const createStoreSchema = z.object({
  name: z
    .string()
    .min(20, "Store name must be at least 20 characters")
    .max(60, "Store name must not exceed 60 characters"),
  email: z.string().email("Please enter a valid email"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(400, "Address must not exceed 400 characters"),
  ownerId: z.string().min(1, "Please select an owner"),
});
