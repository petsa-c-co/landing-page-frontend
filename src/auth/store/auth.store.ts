import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  isAuthRejection,
  setOnForbidden,
  setOnSessionExpired,
} from "@/api/petrogasApi"
import {
  getCurrentUserAction,
  loginAction,
  logoutAction,
} from "../actions/auth.actions"
import type { AuthUser, UserRole } from "../interfaces/user.interface"
import type { LoginFormValues } from "../schemas/login.schema"

type AuthStatus = "checking" | "authenticated" | "not-authenticated"

// Verificación de sesión en curso, compartida por todos los que la pidan a la
// vez (ver checkAuthStatus).
let pendingCheck: Promise<boolean> | null = null

interface AuthState {
  status: AuthStatus
  user: AuthUser | null

  login: (credentials: LoginFormValues) => Promise<AuthUser>
  logout: () => Promise<void>
  checkAuthStatus: () => Promise<boolean>
  hasRole: (...roles: UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: "not-authenticated",
      user: null,

      login: async (credentials) => {
        set({ status: "checking" })
        try {
          // El login devuelve la proyección pública; los roles se piden aparte.
          await loginAction(credentials)
          const user = await getCurrentUserAction()
          set({ status: "authenticated", user })
          return user
        } catch (error) {
          set({ status: "not-authenticated", user: null })
          throw error
        }
      },

      logout: async () => {
        try {
          await logoutAction()
        } finally {
          // Aunque falle la llamada, localmente se cierra la sesión.
          set({ status: "not-authenticated", user: null })
        }
      },

      checkAuthStatus: async () => {
        const currentUser = get().user
        // Sin usuario guardado no hay sesión que revalidar: se evita pegarle
        // al backend en cada visita anónima a la landing.
        if (!currentUser) {
          set({ status: "not-authenticated", user: null })
          return false
        }

        // Al navegar dentro del panel montan varios ProtectedRoute a la vez (el
        // de /admin y el de la ruta hija), y cada uno pedía su propio /auth/me.
        // Como ese endpoint comparte con login y refresh un cupo de 10 por
        // minuto, duplicar la llamada acercaba el 429 sin ningún beneficio: se
        // comparte una sola verificación en curso.
        pendingCheck ??= (async () => {
          set({ status: "checking" })
          try {
            // Si el accessToken venció, el interceptor renueva y reintenta.
            const user = await getCurrentUserAction()
            set({ status: "authenticated", user })
            return true
          } catch (error) {
            // Solo se cierra la sesión si el backend la RECHAZÓ. Ante un 429,
            // un 5xx o un corte de red no hay evidencia de que la sesión sea
            // inválida: se conserva el usuario que ya teníamos. Recargar muchas
            // veces seguidas agota el cupo del rate limit, y con el catch ciego
            // eso terminaba echando a alguien con la sesión perfectamente sana.
            if (!isAuthRejection(error)) {
              set({ status: "authenticated" })
              return true
            }
            set({ status: "not-authenticated", user: null })
            return false
          } finally {
            pendingCheck = null
          }
        })()

        return pendingCheck
      },

      hasRole: (...roles) => {
        const user = get().user
        if (!user) return false
        return roles.some((role) => user.roles.includes(role))
      },
    }),
    {
      name: "petrogas-auth",
      // Las cookies son HttpOnly, así que la única forma de recordar quién
      // inició sesión es persistir estos datos. No hay token acá.
      partialize: (state) => ({ user: state.user }),
    },
  ),
)

// Si el refresh falla, el interceptor avisa y se limpia la sesión local.
setOnSessionExpired(() => {
  useAuthStore.setState({ status: "not-authenticated", user: null })
})

// Un 403 significa que los permisos ya no son los que el panel tiene pintados
// (un admin cambió los roles en caliente). Se releen sin tocar `status`, para
// no meter un spinner de pantalla completa en medio de la navegación.
setOnForbidden(() => {
  void getCurrentUserAction()
    .then((user) => useAuthStore.setState({ user }))
    .catch(() => undefined)
})
