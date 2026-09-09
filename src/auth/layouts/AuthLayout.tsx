import { Link, Outlet, useLocation } from "react-router";
import { ArrowLeft } from "lucide-react";
import { SITE_INFO } from "@/constants/site";
import { Seo } from "@/shared/components/Seo";
import logo from "@/assets/logo_2-removebg-preview.png";

// Estas pantallas están fuera del layout público, así que no las alcanza el
// componente que pone los títulos y quedaban con la pestaña en blanco. No van en
// paginas.json a propósito: ese archivo lo lee el prerenderizado, y estas
// páginas no tienen por qué generarse ni indexarse (robots.txt ya las bloquea).
const TITULOS: Record<string, string> = {
  "/acceder": "Acceder",
  "/recuperar-clave": "Recuperar contraseña",
  "/activate": "Activar cuenta",
  "/reset-password": "Cambiar contraseña",
};

export const AuthLayout = () => {
  const { pathname } = useLocation();

  // dvh y no vh: `vh` mide la ventana SIN plegar la barra del navegador, así
  // que en el celular deja una franja de más abajo del contenido. Mismo
  // criterio que en LandingLayout.
  return (
    <div className="min-h-dvh bg-navy-900 flex flex-col items-center justify-center px-4 py-12 font-body">
      <Seo
        titulo={TITULOS[pathname] ?? "Acceso"}
        descripcion="Acceso al panel de administración de Petrogas S.A."
      />
      <Link to="/" className="mb-8">
        <img
          src={logo}
          alt={SITE_INFO.name}
          className="h-20 w-auto brightness-0 invert"
        />
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <Outlet />
      </div>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 text-navy-300 text-sm hover:text-sky-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al sitio
      </Link>
    </div>
  );
};
