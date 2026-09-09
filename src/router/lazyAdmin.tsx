import { lazy, Suspense, type ComponentType } from "react"
import { SectionLoader } from "@/components/custom/QueryStates"

// El panel se baja recién cuando alguien entra a /admin. El sitio público no
// necesita nada de acá: ni el editor de recorte, ni el drag&drop, ni los
// diálogos: son megas que un visitante de la home nunca usa.
const lazyPage = (loader: () => Promise<{ default: ComponentType }>) => {
  const Component = lazy(loader)
  return () => (
    <Suspense fallback={<SectionLoader className="py-32" />}>
      <Component />
    </Suspense>
  )
}

const named = <T extends string>(
  loader: () => Promise<Record<T, ComponentType>>,
  key: T,
) => lazyPage(() => loader().then((module) => ({ default: module[key] })))

export const LazyAdminLayout = named(
  () => import("@/admin/layouts/AdminLayout"),
  "AdminLayout",
)
export const LazyDashboardPage = named(
  () => import("@/admin/pages/DashboardPage"),
  "DashboardPage",
)
export const LazyNovedadesPage = named(
  () => import("@/admin/pages/NovedadesPage"),
  "NovedadesPage",
)
export const LazyNovedadFormPage = named(
  () => import("@/admin/pages/NovedadFormPage"),
  "NovedadFormPage",
)
export const LazyLinkedInPage = named(
  () => import("@/admin/pages/LinkedInPage"),
  "LinkedInPage",
)
export const LazyServiciosAdminPage = named(
  () => import("@/admin/pages/ServiciosPage"),
  "ServiciosPage",
)
export const LazyServicioFormPage = named(
  () => import("@/admin/pages/ServicioFormPage"),
  "ServicioFormPage",
)
export const LazyCertificacionesAdminPage = named(
  () => import("@/admin/pages/CertificacionesAdminPage"),
  "CertificacionesAdminPage",
)
export const LazyClientesPage = named(
  () => import("@/admin/pages/ClientesPage"),
  "ClientesPage",
)
export const LazyMensajesPage = named(
  () => import("@/admin/pages/MensajesPage"),
  "MensajesPage",
)
export const LazyUsuariosPage = named(
  () => import("@/admin/pages/UsuariosPage"),
  "UsuariosPage",
)
export const LazySitioPage = named(
  () => import("@/admin/pages/SitioPage"),
  "SitioPage",
)
export const LazyTitulosPage = named(
  () => import("@/admin/pages/TitulosPage"),
  "TitulosPage",
)

export const LazyRegistroDeCambiosPage = named(
  () => import("@/admin/pages/RegistroDeCambiosPage"),
  "RegistroDeCambiosPage",
)
