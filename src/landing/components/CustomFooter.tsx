import { Link } from "react-router";
import { SITE_INFO } from "@/constants/site";
import { revisionMostrada } from "@/site-settings/utils/revision";
import { useServices } from "@/services/hooks/useServices";
import { useSiteSettings } from "@/site-settings/hooks/useSiteSettings";
import { CertificationBand } from "@/components/custom/CertificationBand";
import { useHayNovedades } from "@/news/hooks/useNews";

export const CustomFooter = () => {
  const { data: services } = useServices();
  const { data: siteSettings } = useSiteSettings();
  const certificationMark = siteSettings?.certificationMarkImage;
  const hayNovedades = useHayNovedades();
  const revision = revisionMostrada(siteSettings);

  return (
    <footer className="bg-navy-900 text-navy-100">
      {/* Firma de marca: hilo azul→rojo (los dos colores del logo). */}
      <div
        aria-hidden="true"
        className="h-[3px] w-full bg-gradient-to-r from-sky-500 to-petrogas-red-500"
      />
      {/* Los enlaces a la izquierda y la identificación de la empresa a la
          derecha, en la misma fila. La última columna se mide por su contenido
          (`auto`); entre 1024 y 1279px las dos placas se apilan dentro de ella
          para no comerle el ancho a las columnas de enlaces. En pantallas
          medianas baja a dos columnas y el bloque de logos ocupa la fila
          entera. */}
      <div className="max-w-7xl page-container py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-10">
        <div>
          <h4 className="font-heading uppercase text-sm tracking-wide text-white mb-4">
            Contacto
          </h4>
          <ul className="space-y-2 text-sm text-navy-300">
            <li>{SITE_INFO.address}</li>
            <li>{SITE_INFO.phones}</li>
            <li>{SITE_INFO.email}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading uppercase text-sm tracking-wide text-white mb-4">
            Servicios
          </h4>
          <ul className="space-y-2 text-sm text-navy-300">
            {services?.map((service) => (
              <li key={service.id}>
                <Link
                  to={`/servicios/${service.slug}`}
                  className="hover:text-sky-400"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-heading uppercase text-sm tracking-wide text-white mb-4">
            Empresa
          </h4>
          <ul className="space-y-2 text-sm text-navy-300">
            <li>
              <Link to="/nosotros" className="hover:text-sky-400">
                Nosotros
              </Link>
            </li>
            <li>
              <Link to="/certificaciones" className="hover:text-sky-400">
                Certificaciones
              </Link>
            </li>
            <li>
              <Link to="/rrhh" className="hover:text-sky-400">
                R.R.H.H.
              </Link>
            </li>
            {/* Va acá y no en Servicios: es una acción de RRHH, no algo que la
                empresa le preste a un cliente. */}
            <li>
              <Link to="/trabaja-con-nosotros" className="hover:text-sky-400">
                Trabajá con Nosotros
              </Link>
            </li>
            {/* Mismo criterio que el menú de arriba: no se ofrece la sección
                mientras esté vacía. */}
            {hayNovedades !== false && (
              <li>
                <Link to="/novedades-y-prensa" className="hover:text-sky-400">
                  Novedades y Prensa
                </Link>
              </li>
            )}
          </ul>
        </div>

        <CertificationBand
          markImage={certificationMark}
          scopeText={siteSettings?.certificationScopeText}
          className="md:col-span-2 lg:col-span-1"
        />
      </div>
      <div className="border-t border-navy-800">
        <div className="max-w-7xl page-container py-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-navy-400">
          <p>© Copyright 2022 - 2026 | Petrogas S.A | All Rights Reserved</p>
          <div className="flex items-center gap-4">
            <Link to="/privacidad" className="hover:text-sky-400">
              Aviso de Privacidad
            </Link>
            {/* Puede tardar hasta 5 minutos en reflejar un cambio: el
                endpoint se sirve con max-age=300. Es esperado. */}
            <span className="tabular-nums">
              Rev. {revision.numero} · {revision.fecha}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
