import { FileText } from "lucide-react";
import { PageHero } from "../components/PageHero";
import { SITE_IMAGE_SLOTS } from "@/site-settings/interfaces/site-images.interface";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { SafeImage } from "@/components/custom/SafeImage";
import { useCertifications } from "@/certifications/hooks/useCertifications";
import { iconoDeCertificacion } from "@/certifications/constants/norm-icons";

export const CertificacionesPage = () => {
  const {
    data: certifications,
    isPending,
    isError,
    refetch,
  } = useCertifications();

  // La destacada (hoy ISO 39001) va en la banda de abajo; el resto, en la grilla.
  const featured = certifications?.filter((c) => c.isFeatured) ?? [];
  const regular = certifications?.filter((c) => !c.isFeatured) ?? [];

  return (
    <>
      <PageHero
        eyebrow="Calidad garantizada"
        title="Certificaciones"
        slot={SITE_IMAGE_SLOTS.bannerCertificaciones}
      />

      <section className="py-16 bg-white">
        <div className="max-w-5xl page-container text-center">
          <p className="text-gray-600 leading-relaxed mb-4">
            Actualmente poseemos un Sistema de Gestión Integrado de Calidad,
            Medio Ambiente, Seguridad y Salud Ocupacional y Seguridad Vial,
            certificado bajo las normas ISO 9001:2015, ISO 14001:2015 e ISO
            45001:2018.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Somos la primera compañía con Personal y Flota propia al servicio de
            los yacimientos más importantes de la cuenca Neuquina.
          </p>
        </div>
      </section>

      <section className="pb-20 bg-white">
        {isPending && <SectionLoader />}
        {isError && <SectionError onRetry={() => void refetch()} />}

        {regular.length > 0 && (
          <div className="max-w-7xl page-container grid grid-cols-1 md:grid-cols-3 gap-8">
            {regular.map((cert) => {
              // Un ícono por norma. Antes iban las tres con el mismo escudo y
              // el ícono no distinguía nada; el logo de ISO no es una opción
              // porque sus reglas de uso no permiten que lo exhiba la empresa
              // certificada (sí la marca del certificador, que va en el pie).
              const Icono = iconoDeCertificacion(cert.title, cert.subtitle);
              return (
                <div
                  key={cert.id}
                  className="bg-gray-50 rounded-xl ring-1 ring-gray-100 p-8 text-center hover:shadow-lg transition"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-navy-600 flex items-center justify-center mb-6 overflow-hidden">
                    <SafeImage
                      src={cert.logoImage}
                      alt={cert.title}
                      className="w-full h-full object-cover"
                      fallback={
                        <Icono
                          className="w-9 h-9 text-white"
                          strokeWidth={1.5}
                        />
                      }
                    />
                  </div>
                  <p className="font-heading uppercase text-sky-500 text-sm tracking-wide mb-1">
                    {cert.subtitle}
                  </p>
                  <h3 className="font-heading uppercase font-bold text-navy-800 text-2xl mb-3">
                    {cert.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{cert.description}</p>
                  {cert.certificatePdf && (
                    <a
                      href={cert.certificatePdf}
                      target="_blank"
                      rel="noopener"
                      className="mt-4 inline-flex items-center gap-2 text-sky-500 font-heading uppercase tracking-wide text-sm hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Ver certificado
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {featured.map((cert) => (
        <section key={cert.id} className="py-14 bg-navy-800">
          <div className="max-w-5xl page-container text-center">
            <p className="font-heading uppercase tracking-wide text-sky-400 text-sm mb-2">
              Además
            </p>
            <h2 className="font-heading uppercase font-semibold text-white text-[1.75rem] md:text-[2.125rem] mb-3">
              {cert.subtitle} {cert.title}
            </h2>
            <p className="text-navy-200 max-w-2xl mx-auto">
              {cert.description}
            </p>
            {cert.certificatePdf && (
              <a
                href={cert.certificatePdf}
                target="_blank"
                rel="noopener"
                className="mt-5 inline-flex items-center gap-2 text-sky-400 font-heading uppercase tracking-wide text-sm hover:underline"
              >
                <FileText className="w-4 h-4" />
                Ver certificado
              </a>
            )}
          </div>
        </section>
      ))}
    </>
  );
};
