import { petrogasApi, unwrap, unwrapPaginated } from "@/api/petrogasApi"
import type { ApiEnvelope, Paginated } from "@/api/types"
import type {
  AuthUser,
  UserRole,
  UserStatus,
} from "../interfaces/user.interface"

export interface InviteUserPayload {
  email: string
  roles?: UserRole[]
}

export interface UsersQueryParams {
  page?: number
  limit?: number
  // Busca en nombre, apellido y email. Ignora mayúsculas y acentos: "perez"
  // encuentra "Pérez", así que no hace falta normalizar de este lado.
  search?: string
  role?: UserRole
  status?: UserStatus
}

// Crea una cuenta PENDIENTE y dispara el correo con el enlace de activación.
export const inviteUserAction = async (
  payload: InviteUserPayload,
): Promise<AuthUser> => {
  const { data } = await petrogasApi.post<ApiEnvelope<AuthUser>>(
    "/auth/users",
    payload,
  )
  return unwrap(data)
}

export const getUsersAction = async (
  params: UsersQueryParams = {},
): Promise<Paginated<AuthUser>> => {
  const { data } = await petrogasApi.get<ApiEnvelope<AuthUser[]>>("/users", {
    params,
  })
  return unwrapPaginated(data)
}

// Revoca los tokens previos y manda una invitación nueva. Solo aplica a
// cuentas pendientes.
export const resendActivationAction = async (id: string): Promise<void> => {
  await petrogasApi.post(`/auth/users/${id}/resend-activation`)
}

// Solo sobre invitaciones PENDIENTES; sobre una cuenta activa o desactivada el
// backend responde 409, porque esas se dan de baja con deactivate, que es
// reversible. Sirve para cuando se invitó a una dirección mal escrita: al
// eliminarla, ese email queda libre para volver a invitarlo bien.
export const deleteUserAction = async (id: string): Promise<void> => {
  await petrogasApi.delete(`/users/${id}`)
}

// Corta el acceso al instante: la sesión abierta de esa persona deja de
// funcionar en el siguiente request.
export const deactivateUserAction = async (id: string): Promise<void> => {
  await petrogasApi.post(`/users/${id}/deactivate`)
}

// Solo sobre cuentas desactivadas. Sobre una pendiente el backend responde 409:
// ahí lo que corresponde es reenviar la invitación.
export const reactivateUserAction = async (id: string): Promise<void> => {
  await petrogasApi.post(`/users/${id}/reactivate`)
}

// REEMPLAZA el conjunto completo de roles, no es parcial: hay que mandar
// siempre el arreglo entero y con al menos un rol. También aplica al instante.
export const updateUserRolesAction = async (
  id: string,
  roles: UserRole[],
): Promise<AuthUser> => {
  const { data } = await petrogasApi.patch<ApiEnvelope<AuthUser>>(
    `/users/${id}/roles`,
    { roles },
  )
  return unwrap(data)
}
