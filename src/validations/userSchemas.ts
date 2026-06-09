import { z } from "zod";

export const roleEnum = z.enum(["Admin", "User"]);
export const statusEnum = z.enum(["Active", "Inactive"]);

const passwordRule = z
  .string()
  .min(8, "8 caractères minimum")
  .regex(/[A-Z]/, "Au moins une majuscule")
  .regex(/[a-z]/, "Au moins une minuscule")
  .regex(/[0-9]/, "Au moins un chiffre");

export const createUserSchema = z
  .object({
    firstName: z.string().trim().min(1, "Prénom requis").max(60),
    lastName: z.string().trim().min(1, "Nom requis").max(60),
    username: z
      .string()
      .trim()
      .min(3, "3 caractères minimum")
      .max(40)
      .regex(/^[a-zA-Z0-9._-]+$/, "Caractères invalides"),
    email: z.string().trim().email("Email invalide").max(120),
    password: passwordRule,
    confirmPassword: z.string(),
    role: roleEnum,
    status: statusEnum,
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(60),
  lastName: z.string().trim().min(1, "Nom requis").max(60),
  username: z
    .string()
    .trim()
    .min(3, "3 caractères minimum")
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/, "Caractères invalides"),
  email: z.string().trim().email("Email invalide").max(120),
  role: roleEnum,
  status: statusEnum,
});

export type EditUserInput = z.infer<typeof editUserSchema>;

export const resetPasswordSchema = z.object({
  temporaryPassword: passwordRule.optional().or(z.literal("")),
  forceChange: z.boolean().default(true),
  sendEmail: z.boolean().default(false),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;