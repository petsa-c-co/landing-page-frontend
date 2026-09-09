import { createBrowserRouter, Navigate } from "react-router";
import { LandingLayout } from "@/landing/layout/LandingLayout";
import { HomePage } from "@/landing/pages/HomePage";
import { NosotrosPage } from "@/landing/pages/NosotrosPage";
import { ServiciosPage } from "@/landing/pages/ServiciosPage";
import { ServiceDetailPage } from "@/landing/pages/ServiceDetailPage";
import { CertificacionesPage } from "@/landing/pages/CertificacionesPage";
import { RrhhPage } from "@/landing/pages/RrhhPage";
import { NovedadesPrensaPage } from "@/landing/pages/NovedadesPrensaPage";
import { NewsDetailPage } from "@/landing/pages/NewsDetailPage";
import { ContactoPage } from "@/landing/pages/ContactoPage";
import { TrabajaConNosotrosPage } from "@/landing/pages/TrabajaConNosotrosPage";
import { PrivacidadPage } from "@/landing/pages/PrivacidadPage";
import { AuthLayout } from "@/auth/layouts/AuthLayout";
import { LoginPage } from "@/auth/pages/LoginPage";
import { ActivatePage } from "@/auth/pages/ActivatePage";
import { ResetPasswordPage } from "@/auth/pages/ResetPasswordPage";
import { ForgotPasswordPage } from "@/auth/pages/ForgotPasswordPage";
import { NotFoundPage } from "@/shared/pages/NotFoundPage";
import { RouteErrorPage } from "@/shared/pages/RouteErrorPage";
import {
  LazyAdminLayout,
  LazyCertificacionesAdminPage,
  LazyClientesPage,
  LazyDashboardPage,
  LazyLinkedInPage,
  LazyMensajesPage,
  LazyNovedadFormPage,
  LazyNovedadesPage,
  LazyRegistroDeCambiosPage,
  LazyServicioFormPage,
  LazyServiciosAdminPage,
  LazySitioPage,
  LazyTitulosPage,
  LazyUsuariosPage,
} from "./lazyAdmin";
import { AdminHome } from "@/admin/components/AdminHome";
import { NotaRenombrada } from "./NotaRenombrada";
import {
  NotAuthenticatedRoute,
  ProtectedRoute,
} from "./routes/ProtectedRoutes";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <LandingLayout />,
    // Va en la raíz y no en cada hija para que también cubra los errores del
    // layout. Reemplaza el layout entero, así que RouteErrorPage trae su
    // propia salida en vez de contar con el menú.
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "nosotros", element: <NosotrosPage /> },
      { path: "servicios", element: <ServiciosPage /> },
      { path: "servicios/:slug", element: <ServiceDetailPage /> },
      { path: "certificaciones", element: <CertificacionesPage /> },
      { path: "rrhh", element: <RrhhPage /> },
      { path: "trabaja-con-nosotros", element: <TrabajaConNosotrosPage /> },
      { path: "novedades-y-prensa", element: <NovedadesPrensaPage /> },
      { path: "novedades-y-prensa/:slug", element: <NewsDetailPage /> },
      { path: "contacto", element: <ContactoPage /> },
      // No va en el menú principal: se llega desde el pie.
      { path: "privacidad", element: <PrivacidadPage /> },
      // Rutas del sitio viejo, conservadas solo para no romper enlaces.
      {
        path: "novedades",
        element: <Navigate to="/novedades-y-prensa" replace />,
      },
      { path: "novedades/:slug", element: <NotaRenombrada /> },
      {
        path: "prensa",
        element: <Navigate to="/novedades-y-prensa" replace />,
      },
      { path: "prensa/:slug", element: <NotaRenombrada /> },
    ],
  },
  // Rutas de sesión. /activate y /reset-password son las que reciben los
  // enlaces de los correos del backend: no se pueden renombrar.
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/acceder",
        element: (
          <NotAuthenticatedRoute>
            <LoginPage />
          </NotAuthenticatedRoute>
        ),
      },
      { path: "/recuperar-clave", element: <ForgotPasswordPage /> },
      { path: "/activate", element: <ActivatePage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },
  // Panel de administración. El wrapper solo exige sesión: cualquier rol entra
  // al Inicio. El acceso real se decide ruta por ruta — ocultar la entrada del
  // menú no alcanza, porque la URL se puede escribir a mano.
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <LazyAdminLayout />
      </ProtectedRoute>
    ),
    // Su propia variante: la salida tiene que devolver al panel, no a la
    // landing pública, que es sacar a alguien de donde estaba trabajando.
    errorElement: <RouteErrorPage area="panel" />,
    children: [
      {
        index: true,
        element: (
          <AdminHome>
            <LazyDashboardPage />
          </AdminHome>
        ),
      },
      // Novedades y curaduría: admin y rrhh
      {
        path: "novedades",
        element: (
          <ProtectedRoute roles={["admin", "rrhh"]}>
            <LazyNovedadesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "novedades/nueva",
        element: (
          <ProtectedRoute roles={["admin", "rrhh"]}>
            <LazyNovedadFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "novedades/:id",
        element: (
          <ProtectedRoute roles={["admin", "rrhh"]}>
            <LazyNovedadFormPage />
          </ProtectedRoute>
        ),
      },
      // Bandeja de curaduría: ruta propia para no chocar con novedades/:id.
      {
        path: "linkedin",
        element: (
          <ProtectedRoute roles={["admin", "rrhh"]}>
            <LazyLinkedInPage />
          </ProtectedRoute>
        ),
      },
      // RRHH: a diferencia del resto del catálogo, el rol rrhh sí lo gestiona.
      // Quedó solo el catálogo de títulos; las postulaciones y los puestos
      // pasaron a Gestión Petrogas y sus rutas acá responden 404.
      {
        path: "titulos",
        element: (
          <ProtectedRoute roles={["admin", "rrhh"]}>
            <LazyTitulosPage />
          </ProtectedRoute>
        ),
      },
      // Contenido y administración: solo admin
      {
        path: "servicios",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <LazyServiciosAdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "servicios/nuevo",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <LazyServicioFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "servicios/:id",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <LazyServicioFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "certificaciones",
        element: (
          <ProtectedRoute roles={["admin", "auditor"]}>
            <LazyCertificacionesAdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "clientes",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <LazyClientesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "mensajes",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <LazyMensajesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "usuarios",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <LazyUsuariosPage />
          </ProtectedRoute>
        ),
      },
      // La ruta existe aunque la entrada del menú esté apagada: así se puede
      // revisar la pantalla entrando por URL antes de que el backend responda.
      {
        path: "registro-de-cambios",
        element: (
          <ProtectedRoute roles={["admin", "auditor"]}>
            <LazyRegistroDeCambiosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "sitio",
        element: (
          <ProtectedRoute roles={["admin", "auditor"]}>
            <LazySitioPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
