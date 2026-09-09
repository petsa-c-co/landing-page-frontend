import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Ingresá un correo válido"),
  // El largo mínimo lo valida el backend al comparar; acá solo exigimos que
  // no esté vacío para no filtrar la política de contraseñas.
  password: z.string().min(1, "Ingresá tu contraseña"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
