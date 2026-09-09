import { useEffect, type PropsWithChildren } from "react"
import { Link, Navigate, useLocation } from "react-router"
import { ShieldAlert } from "lucide-react"
import { useAuthStore } from "@/auth/store/auth.store"
import type { UserRole } from "@/auth/interfaces/user.interface"
import { Button } from "@/components/ui/button"
import { SectionLoader } from "@/components/custom/QueryStates"

interface RoleRouteProps extends PropsWithChildren {
  // Roles que pueden entrar. Vacío = cualquier sesión activa.
  roles?: UserRole[]
}

export const ProtectedRoute = ({ roles = [], children }: RoleRouteProps) => {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus)

  // Al entrar directo por URL (sin pasar por la landing) todavía no se
  // revalidó la sesión guardada.
  useEffect(() => {
    if (status === "not-authenticated" && user) {
      void checkAuthStatus()
    }
  }, [status, user, checkAuthStatus])

  if (status === "checking") return <SectionLoader className="py-32" />

  if (!user) {
    // Se recuerda a dónde quería ir para volver después del login.
    return <Navigate to="/acceder" state={{ from: location.pathname }} replace />
  }

  // Antes esto redirigía a /admin sin decir nada: quien escribía la URL a mano
  // aparecía en otra pantalla sin entender por qué. Ahora se explica.
  if (roles.length > 0 && !roles.some((role) => user.roles.includes(role))) {
    return <NoAccessNotice />
  }

  return children
}

export const NoAccessNotice = () => (
  <div className="max-w-md mx-auto py-20 text-center">
    <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-5">
      <ShieldAlert className="w-7 h-7 text-amber-600" />
    </div>
    <h1 className="font-heading uppercase font-semibold text-navy-800 dark:text-white text-xl mb-2">
      No tenés acceso a esta sección
    </h1>
    <p className="text-gray-500 dark:text-navy-300 text-sm mb-6">
      Tu cuenta no tiene el permiso necesario. Si creés que es un error,
      pedile a un administrador que revise tu rol.
    </p>
    <Button asChild variant="outline" className="rounded-lg">
      <Link to="/admin">Volver al inicio del panel</Link>
    </Button>
  </div>
)

// Evita que alguien con sesión abierta vuelva a la pantalla de login.
export const NotAuthenticatedRoute = ({ children }: PropsWithChildren) => {
  const user = useAuthStore((state) => state.user)
  if (user) return <Navigate to="/admin" replace />
  return children
}
