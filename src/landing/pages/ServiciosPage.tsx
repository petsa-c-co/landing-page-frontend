import { Link } from "react-router";
import { PageHero } from "../components/PageHero";
import { SITE_IMAGE_SLOTS } from "@/site-settings/interfaces/site-images.interface";
import { imagenDeTarjeta } from "@/services/constants/default-images";
import { CTASection } from "../components/CTASection";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { useServices } from "@/services/hooks/useServices";
import { Backdrop } from "@/components/custom/Backdrop";
import { cn } from "@/lib/utils";

export const ServiciosPage = () => {
  const { data: services, isPending, isError, refetch } = useServices();
  // Con 3+ servicios, en mobile pasa a carousel deslizable; en desktop, grid.
  const isCarousel = (services?.length ?? 0) >= 3;

  return (
    <>
      <PageHero
        eyebrow="Lo que hacemos"
        title="Nuestros Servicios"
        slot={SITE_IMAGE_SLOTS.bannerServicios}
      />

      <section className="py-16 bg-white">
        <div className="max-w-4xl page-container text-center mb-14">
          <p className="text-gray-600 leading-relaxed">
            Petrogas S.A mantiene altos estándares de Calidad, Seguridad y Medio
            Ambiente, para satisfacer la Operación y Mantenimiento en el proceso
            de tratamiento de Gas, Operación de Yacimientos de Petróleo, así
            como en el mantenimiento e integridad de las instalaciones. Para
            ello desarrolla las capacidades de su personal, principal recurso
            para la satisfacción de nuestros clientes.
          </p>
        </div>

        {isPending && <SectionLoader />}
        {isError && <SectionError onRetry={() => void refetch()} />}

        {services && (
          <div
            className={cn(
              "max-w-7xl page-container flex gap-8",
              isCarousel
                ? "overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible md:flex-wrap md:justify-center"
                : "flex-col md:flex-row md:flex-wrap md:justify-center",
            )}
          >
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/servicios/${service.slug}`}
                className={cn(
                  "group block rounded-xl overflow-hidden shadow-md hover:shadow-xl transition ring-1 ring-gray-100 md:w-[calc(33.333%_-_1.34rem)]",
                  isCarousel
                    ? "shrink-0 snap-start w-[82%] sm:w-[47%]"
                    : "w-full",
                )}
              >
                <Backdrop
                  image={imagenDeTarjeta(service)}
                  seed={`petrogas-${service.slug}`}
                  width={800}
                  height={550}
                  overlay="linear-gradient(rgba(20,31,71,.35),rgba(20,31,71,.6))"
                  className="h-56"
                />
                <div className="p-6">
                  <h3 className="font-heading uppercase font-semibold text-navy-800 text-lg mb-2 group-hover:text-sky-500 transition">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {service.shortDescription}
                  </p>
                  <span className="text-sky-500 text-sm font-heading uppercase tracking-wide">
                    Ver más →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <CTASection
        title="¿Necesitás una solución a medida?"
        description="Contactanos y coordinamos una propuesta según tu operación."
        buttonLabel="Contactanos"
        to="/contacto"
      />
    </>
  );
};
