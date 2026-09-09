import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { ExternalLink, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/auth/store/auth.store";
import { useThemeStore } from "../store/theme.store";
import { ADMIN_MENU } from "../constants/menu";
import { Seo } from "@/shared/components/Seo";
import { NoPanelAccess } from "../components/NoPanelAccess";
import { ROLE_SHORT, hasPanelAccess } from "@/auth/constants/roles";
import { useUnreadMessagesCount } from "@/contact/hooks/useUnreadMessages";
import isotipo from "@/assets/isotipo.svg";

export const AdminLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggle);

  // El contador del menú. Se pide solo si el rol ve la sección: el endpoint es
  // de admin y a un usuario de rrhh le daría 403 en cada carga del panel.
  // Va antes del early return de abajo porque los hooks no pueden quedar
  // condicionados.
  const { data: mensajesSinLeer } = useUnreadMessagesCount(
    user?.roles.includes("admin") ?? false,
  );

  // El tema se aplica al <html> solo mientras el panel está montado, y se
  // limpia al salir: así el sitio público queda siempre en claro, aunque la
  // preferencia guardada sea oscura.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    return () => root.classList.remove("dark");
  }, [theme]);

  // Acá el scroll vive en el <main>, no en la ventana, así que el
  // ScrollRestoration del router no lo alcanza: al cambiar de pantalla se
  // vuelve arriba a mano.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    void navigate("/acceder");
  };

  // Sin ningún módulo asignado no se dibuja el panel: sidebar vacío y
  // dashboard sin datos se leerían como una pantalla rota. Va acá y no en una
  // ruta suelta para que cubra cualquier /admin/* de una.
  if (!hasPanelAccess(user?.roles)) return <NoPanelAccess />

  // Cada grupo se oculta entero si el rol no ve ninguna de sus entradas.
  const visibleGroups = ADMIN_MENU.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.roles.some((role) => user?.roles.includes(role)),
    ),
  })).filter((group) => group.items.length > 0);

  // El nombre de la sección sale del propio menú, así no hay una segunda lista
  // de títulos que mantener al día. Se elige la coincidencia más larga para que
  // /admin/servicios/nuevo no se quede con el título de /admin.
  const seccion = visibleGroups
    .flatMap((group) => group.items)
    .filter((item) => pathname === item.to || pathname.startsWith(item.to + "/"))
    .sort((a, b) => b.to.length - a.to.length)[0];

  return (
    // Altura fija del viewport: el panel no scrollea entero; cada página maneja
    // su propio scroll interno (ver ListShell) para que solo la tabla se mueva.
    <div className="h-dvh overflow-hidden bg-gray-50 dark:bg-navy-950 font-body">
      {/* El panel también necesita título: sin esto la pestaña queda en blanco,
          y con varias abiertas no se distingue una sección de otra. No se indexa
          (robots.txt lo bloquea), pero la pestaña la ve quien trabaja acá. */}
      <Seo
        titulo={seccion ? `${seccion.label} · Panel` : "Panel"}
        descripcion="Panel de administración de Petrogas S.A."
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 flex flex-col transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Solo el isotipo, no el lockup completo. El logo de la marca apila
            tres pisos —la H con el timón, "Petrogas S.A" y la bajada— y en el
            ancho de un sidebar la bajada quedaba en unos 3px: ilegible por
            tamaño, no por resolución. Acá alcanza con la marca: el título de
            la pestaña y el encabezado ya dicen de qué panel se trata.
            Va sobre placa blanca porque la barra azul del isotipo tiene poco
            contraste contra el navy del sidebar; es el mismo recurso que usa
            el pie del sitio.
            El SVG es un trazado del archivo oficial —no un dibujo a mano—:
            se separó por colores y se siguió el borde real de los píxeles, así
            que conserva la geometría, incluida la asimetría de la H. */}
        <div className="h-20 shrink-0 flex items-center justify-between px-5 border-b border-navy-800">
          <Link to="/admin" className="rounded-lg bg-white p-2">
            <img src={isotipo} alt="Petrogas S.A" className="h-12 w-auto" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-navy-300"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* El menú tiene que entrar sin scroll: el sidebar es de altura fija
            y una barra ahí adentro se lee como interfaz rota. El overflow
            queda de red para pantallas muy bajas. Si el menú vuelve a crecer,
            medir de nuevo: cada entrada suma 34px y cada grupo nuevo, 31px más
            su separación.
            Medido: con las 10 entradas de siempre el sidebar pide 638px, y con
            la de Registro de cambios encendida, 672px (80 de cabecera, 494 de
            menú y 98 del pie). Entra cómodo de 1080p para arriba; por debajo
            de ~672px de viewport aparece la barra, que es el respaldo. */}
        <nav className="flex-1 min-h-0 overflow-y-auto py-2 px-3 space-y-3">
          {visibleGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-1 text-navy-400 text-[10px] font-heading uppercase tracking-wider">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon, badge }) => {
                  const sinLeer =
                    badge === "mensajesSinLeer" ? mensajesSinLeer : undefined;
                  return (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={to === "/admin"}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition",
                            isActive
                              ? "bg-sky-500 text-white"
                              : "text-navy-200 hover:bg-navy-800 hover:text-white",
                          )
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {label}
                        {/* Solo si hay algo sin leer: un "0" permanente es
                            ruido y enseña a ignorar el contador. */}
                        {sinLeer !== undefined && sinLeer > 0 && (
                          <span
                            aria-label={`${sinLeer} sin leer`}
                            className="ml-auto shrink-0 rounded-full bg-petrogas-red-500 text-white text-[10px] leading-none px-1.5 py-1 tabular-nums"
                          >
                            {sinLeer > 99 ? "99+" : sinLeer}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-navy-800 p-3">
          <p className="text-white text-sm truncate leading-tight">
            {user?.name} {user?.surname}
          </p>
          {/* Los slugs crudos ("rrhh", "user") no le dicen nada a quien usa el
              panel: se muestran las etiquetas. */}
          <p className="text-navy-400 text-[11px] truncate mb-2">
            {user?.roles.map((role) => ROLE_SHORT[role]).join(" · ")}
          </p>
          {/* El tema pasó a ícono en esta fila: como botón de ancho completo
              se comía 38px de alto, y son los que le faltaban al menú para
              entrar sin scroll. */}
          <div className="flex gap-2">
            {/* <a> y no <Link>: va en una pestaña nueva, así el panel queda
                abierto donde estabas. React Router navegaría en la misma. */}
            <a
              href="/"
              target="_blank"
              rel="noopener"
              title="Abrir el sitio en una pestaña nueva"
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-navy-700 text-navy-200 text-[11px] font-heading uppercase tracking-wide hover:bg-navy-800 transition"
            >
              <ExternalLink className="w-3 h-3" />
              Sitio
            </a>
            <button
              onClick={() => void handleLogout()}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-navy-700 text-navy-200 text-[11px] font-heading uppercase tracking-wide hover:bg-navy-800 transition"
            >
              <LogOut className="w-3 h-3" />
              Salir
            </button>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
              aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
              className="px-2 py-1.5 rounded-lg border border-navy-700 text-navy-200 hover:bg-navy-800 transition"
            >
              {theme === "dark" ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-navy-950/60 lg:hidden"
        />
      )}

      <div className="lg:pl-64 h-full flex flex-col">
        <header className="h-16 shrink-0 bg-white dark:bg-navy-900 border-b border-gray-200 dark:border-navy-800 flex items-center px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-navy-700 dark:text-navy-200"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
        {/* Scroll por defecto (formularios, dashboard). Las páginas de listado
            usan h-full + ListShell para scrollear solo su tabla. */}
        <main
          ref={mainRef}
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
