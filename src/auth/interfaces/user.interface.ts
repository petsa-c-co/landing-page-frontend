export type UserRole = "user" | "admin" | "rrhh" | "auditor"

// Lo calcula el backend; no se deduce de isActive.
//   pendiente   → invitado, nunca aceptó (todavía no tiene contraseña)
//   activo      → tiene acceso al panel
//   desactivado → lo tuvo y un admin se lo quitó
export type UserStatus = "pendiente" | "activo" | "desactivado"

// Proyección pública que devuelve POST /auth/login. Nunca incluye contraseña,
// roles ni flags de estado.
export interface PublicUser {
  id: string
  email: string
  name: string
  surname: string
}

// Entidad completa que devuelve GET /auth/me con la sesión activa. Es la única
// forma de conocer los roles: el login no los expone y las cookies son HttpOnly.
export interface AuthUser extends PublicUser {
  roles: UserRole[]
  status: UserStatus
  isActive: boolean
  isEmailVerified: boolean
}
