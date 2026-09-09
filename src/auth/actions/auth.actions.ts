import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"
import type { AuthUser, PublicUser } from "../interfaces/user.interface"
import type { LoginFormValues } from "../schemas/login.schema"

// El backend responde con Set-Cookie (accessToken y refreshToken HttpOnly):
// el token nunca queda accesible desde JavaScript.
export const loginAction = async (
  credentials: LoginFormValues,
): Promise<PublicUser> => {
  const { data } = await petrogasApi.post<ApiEnvelope<PublicUser>>(
    "/auth/login",
    credentials,
  )
  return unwrap(data)
}

export const logoutAction = async (): Promise<void> => {
  await petrogasApi.post("/auth/logout")
}

// Única fuente de los roles del usuario: el login solo devuelve la proyección
// pública y las cookies son HttpOnly, así que el token no se puede leer desde
// JS. También sirve para rehidratar la sesión al recargar la página.
//
// Responde 401 si la sesión venció o si un admin desactivó la cuenta: los
// cambios de rol y las bajas aplican al instante, sin re-login.
export const getCurrentUserAction = async (): Promise<AuthUser> => {
  const { data } = await petrogasApi.get<ApiEnvelope<AuthUser>>("/auth/me")
  return unwrap(data)
}

// Activación de una cuenta invitada: el usuario define nombre, apellido y
// contraseña con el token que le llegó por correo.
export const activateAccountAction = async (payload: {
  token: string
  name: string
  surname: string
  password: string
}): Promise<void> => {
  await petrogasApi.post("/auth/activate", payload)
}

// Respuesta siempre idéntica exista o no el email (anti-enumeración).
export const forgotPasswordAction = async (email: string): Promise<string> => {
  const { data } = await petrogasApi.post<ApiEnvelope<null>>(
    "/auth/forgot-password",
    { email },
  )
  return data.message
}

export const resetPasswordAction = async (payload: {
  token: string
  newPassword: string
}): Promise<void> => {
  await petrogasApi.post("/auth/reset-password", payload)
}
