import { useState } from "react"
import { Link, NavLink } from "react-router"
import { ChevronDown, LayoutDashboard, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS, SITE_INFO } from "@/constants/site"
import { useServices } from "@/services/hooks/useServices"
import { useHayNovedades } from "@/news/hooks/useNews"
import { useAuthStore } from "@/auth/store/auth.store"
import { hasPanelAccess } from "@/auth/constants/roles"
import logo from "@/assets/logo_2-removebg-preview.png"

export const CustomHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const { data: services } = useServices()

  // "Novedades y Prensa" no se ofrece si no hay ninguna nota publicada. Se
  // deja mientras el dato carga (undefined): lo normal es que haya, y sacarlo
  // para reponerlo movería el menú en cada carga de página.
  const hayNovedades = useHayNovedades()
  const navItems = NAV_ITEMS.filter(
    (item) => !("soloConNovedades" in item) || hayNovedades !== false,
  )
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  // La lista de roles con acceso vive en un solo lugar (PANEL_ROLES): acá
  // estaba repetida a mano y se olvidó al agregar el rol auditor, que veía el
  // sitio público sin el botón para volver al panel.
  const canAccessPanel = hasPanelAccess(user?.roles)

  // "Nuestros Servicios" (el índice) siempre encabeza el submenú; abajo van
  // los servicios que devuelve el CMS.
  const serviceLinks = [
    { to: "/servicios", label: "Nuestros Servicios" },
    ...(services ?? []).map((service) => ({
      to: `/servicios/${service.slug}`,
      label: service.title,
    })),
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl page-container">
        <div className="flex items-center justify-between h-24 lg:h-28">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt={SITE_INFO.name} className="h-16 lg:h-24 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-7 font-heading uppercase text-sm tracking-wide">
            {navItems.map((item) =>
              "hasServicesMenu" in item ? (
                <div key={item.to} className="relative group">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-1 py-2 transition",
                        isActive
                          ? "text-sky-500 border-b-2 border-sky-500 pb-1"
                          : "text-navy-700 hover:text-sky-500"
                      )
                    }
                  >
                    {item.label}
                    <ChevronDown className="w-3 h-3 mt-0.5" />
                  </NavLink>
                  <div className="absolute left-0 top-full w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-white rounded-lg shadow-xl ring-1 ring-black/5 py-2 mt-1">
                      {serviceLinks.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end
                          className={({ isActive }) =>
                            cn(
                              "block px-5 py-3 normal-case font-body text-sm transition",
                              isActive
                                ? "bg-navy-50 text-sky-500"
                                : "text-navy-700 hover:bg-navy-50 hover:text-sky-500"
                            )
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      "transition",
                      isActive
                        ? "text-sky-500 border-b-2 border-sky-500 pb-1"
                        : "text-navy-700 hover:text-sky-500"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {/* El saludo va ANTES de los botones para que Panel y Salir
                    queden juntos como un bloque de acciones. */}
                <span className="text-navy-700 text-sm">
                  Hola, <strong className="font-semibold">{user.name}</strong>
                </span>
                {canAccessPanel && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-heading uppercase tracking-wide bg-sky-500 text-white rounded hover:bg-sky-600 transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Panel
                  </Link>
                )}
                <button
                  onClick={() => void logout()}
                  className="px-4 py-2 text-xs font-heading uppercase tracking-wide border border-navy-600 text-navy-600 rounded hover:bg-navy-600 hover:text-white transition"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/acceder"
                className="px-4 py-2 text-xs font-heading uppercase tracking-wide bg-sky-500 text-white rounded hover:bg-sky-600 transition"
              >
                Acceder
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden text-navy-700"
            aria-label="Abrir menú"
          >
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-1 font-heading uppercase text-sm">
            {navItems.map((item) =>
              "hasServicesMenu" in item ? (
                <div key={item.to}>
                  <button
                    onClick={() => setMobileServicesOpen((v) => !v)}
                    className="w-full flex justify-between items-center py-2 text-navy-700 uppercase"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        mobileServicesOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {mobileServicesOpen && (
                    <div className="pl-4 space-y-1 normal-case font-body text-sm text-navy-600 pb-2">
                      {serviceLinks.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            cn("block py-1", isActive && "text-sky-500")
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn("block py-2", isActive ? "text-sky-500" : "text-navy-700")
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
            <div className="pt-3 space-y-2">
              {user ? (
                <>
                  {canAccessPanel && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs bg-sky-500 text-white rounded"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      void logout()
                    }}
                    className="w-full text-center px-4 py-2 text-xs border border-navy-600 text-navy-600 rounded"
                  >
                    Salir ({user.name})
                  </button>
                </>
              ) : (
                <Link
                  to="/acceder"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-2 text-xs bg-sky-500 text-white rounded"
                >
                  Acceder
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
