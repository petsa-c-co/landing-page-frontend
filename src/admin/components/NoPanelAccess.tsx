import { Link, useNavigate } from "react-router"
import { ExternalLink, LockKeyhole, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/auth/store/auth.store"
import logo from "@/assets/logo_2-removebg-preview.png"

// Cuenta activa pero sin ningún módulo asignado (rol `user`). Se muestra en
// lugar del panel: con el sidebar vacío y un dashboard sin datos, la persona no
// entendería si está roto o si le falta un permiso.
export const NoPanelAccess = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const handleLogout = async () => {
    await logout()
    void navigate("/acceder")
  }

  return (
    <div className="min-h-dvh bg-navy-900 flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-md text-center">
        <img
          src={logo}
          alt="Petrogas S.A"
          className="h-12 w-auto mx-auto mb-8 brightness-0 invert"
        />

        <div className="bg-white rounded-2xl p-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-5">
            <LockKeyhole className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="font-heading uppercase font-semibold text-navy-800 text-xl mb-2">
            Tu cuenta no tiene permisos asignados
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Contactá a un administrador.
          </p>

          {user && (
            <p className="text-gray-400 text-xs mb-6 truncate">
              Sesión iniciada como {user.email}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline" className="flex-1 rounded-lg">
              <Link to="/">
                <ExternalLink className="w-4 h-4" />
                Ir al sitio
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleLogout()}
              className="flex-1 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
