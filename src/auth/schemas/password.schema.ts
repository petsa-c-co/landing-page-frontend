import { z } from "zod"

// Espeja exactamente la validación del backend (ActivateAccountDto /
// ResetPasswordDto): el set de símbolos permitido es acotado, así que un
// guion o un espacio serían rechazados por el servidor.
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(64, "La contraseña no puede tener más de 64 caracteres")
  .regex(
    PASSWORD_PATTERN,
    "Debe incluir mayúscula, minúscula, número y un símbolo (@ $ ! % * ? & #)",
  )

// El token de los correos es un hex opaco de 64 caracteres.
export const tokenSchema = z
  .string()
  .regex(/^[a-f0-9]{64}$/, "El enlace no es válido o está incompleto")
