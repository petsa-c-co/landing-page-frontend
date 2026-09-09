import { z } from "zod"
import { passwordSchema } from "./password.schema"

export const activateAccountSchema = z
  .object({
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(25, "El nombre no puede tener más de 25 caracteres"),
    surname: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(25, "El apellido no puede tener más de 25 caracteres"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type ActivateAccountFormValues = z.infer<typeof activateAccountSchema>

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const forgotPasswordSchema = z.object({
  email: z.email("Ingresá un correo válido"),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
