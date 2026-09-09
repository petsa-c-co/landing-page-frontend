import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router"
import { Linkedin, Mail, Newspaper, Wrench } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { AdminPageHeader } from "../components/AdminUi"
import { useAuthStore } from "@/auth/store/auth.store"
import { getContactMessagesAction } from "@/contact/actions/admin.actions"
import { getNewsAdminAction } from "@/news/actions/admin.actions"
import { getLinkedInImportsAction } from "@/news/actions/linkedin.actions"
import { getServicesAdminAction } from "@/services/actions/admin.actions"

const StatCard = ({
  label,
  value,
  icon: Icon,
  to,
}: {
  label: string
  // undefined mientras carga: se muestra un guion en vez de un 0 que miente.
  value: number | undefined
  icon: LucideIcon
  to: string
}) => (
  <Link
    to={to}
    className="bg-white dark:bg-navy-900 rounded-xl ring-1 ring-gray-200 dark:ring-navy-800 p-5 hover:ring-sky-300 dark:hover:ring-sky-500 hover:shadow-sm transition"
  >
    <div className="flex items-center justify-between mb-3">
      <p className="font-heading uppercase text-xs tracking-wide text-gray-500 dark:text-navy-400">
        {label}
      </p>
      <Icon className="w-4 h-4 text-sky-500" />
    </div>
    <p className="font-heading font-bold text-navy-800 dark:text-white text-3xl">
      {value ?? "—"}
    </p>
  </Link>
)

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.roles.includes("admin") ?? false

  // Novedades y LinkedIn los alcanzan admin y rrhh, y son los únicos roles que
  // llegan hasta acá: quien no ve la entrada Inicio del menú es desviado antes
  // por AdminHome, así que estas dos queries van sin guard.
  // Se pide limit 1 de cada listado: solo interesa el total del meta.
  const { data: news } = useQuery({
    queryKey: ["admin", "news", { limit: 1 }],
    queryFn: () => getNewsAdminAction({ limit: 1 }),
  })

  // Sin status el backend devuelve los pendientes de curaduría.
  const { data: linkedin } = useQuery({
    queryKey: ["admin", "linkedin", "imports", { limit: 1 }],
    queryFn: () => getLinkedInImportsAction({ limit: 1 }),
  })

  // Mensajes y servicios son solo de admin: no se piden con rol rrhh para no
  // disparar un 403 en cada carga del panel.
  const { data: messages } = useQuery({
    queryKey: ["admin", "contact-messages", { status: "nueva", limit: 1 }],
    queryFn: () => getContactMessagesAction({ status: "nueva", limit: 1 }),
    enabled: isAdmin,
  })

  const { data: services } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: getServicesAdminAction,
    enabled: isAdmin,
  })

  return (
    <>
      <AdminPageHeader
        title={`Hola, ${user?.name ?? ""}`}
        description="Resumen de la actividad del sitio."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Notas publicadas"
          value={news?.meta.totalItems}
          icon={Newspaper}
          to="/admin/novedades"
        />
        <StatCard
          label="LinkedIn por revisar"
          value={linkedin?.meta.totalItems}
          icon={Linkedin}
          to="/admin/linkedin"
        />
        {isAdmin && (
          <>
            <StatCard
              label="Mensajes nuevos"
              value={messages?.meta.totalItems}
              icon={Mail}
              to="/admin/mensajes"
            />
            <StatCard
              label="Servicios"
              value={services?.length}
              icon={Wrench}
              to="/admin/servicios"
            />
          </>
        )}
      </div>
    </>
  )
}
