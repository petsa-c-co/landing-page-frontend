import type { UserRole } from "../interfaces/user.interface"

// `user` NO se muestra como "Usuario": es un rol deliberado que identifica una
// cuenta activa sin permisos sobre ningún módulo. Sirve para dos cosas: es el
// rol por defecto cuando se invita a alguien sin asignarle uno, y es la forma
// de quitarle a alguien el acceso al panel sin darlo de baja. Nombrarlo
// "Usuario" haría pensar que puede entrar.
export const ROLE_SHORT: Record<UserRole, string> = {
  admin: "Administrador",
  rrhh: "RRHH",
  auditor: "Auditor",
  user: "Sin acceso al panel",
}

// Con la aclaración de qué alcanza cada uno, para el selector del alta.
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador — acceso total",
  rrhh: "RRHH — novedades y prensa",
  auditor: "Auditor — certificaciones y marca del pie",
  user: "Sin acceso al panel",
}

// Roles que habilitan al menos un módulo. Quien no tenga ninguno ve la pantalla
// de "sin permisos" en vez del panel vacío.
export const PANEL_ROLES: UserRole[] = ["admin", "rrhh", "auditor"]

export const hasPanelAccess = (roles: UserRole[] | undefined): boolean =>
  roles?.some((role) => PANEL_ROLES.includes(role)) ?? false
