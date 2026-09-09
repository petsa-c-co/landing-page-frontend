import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { ClientsSection } from "../components/ClientsSection";
import { AccentBar } from "../components/AccentBar";
import { HeroSecuencia } from "../components/HeroSecuencia";
import { useServices } from "@/services/hooks/useServices";
import { useNews } from "@/news/hooks/useNews";
import { imagenDeTarjeta } from "@/services/constants/default-images";
import { formatDate } from "@/lib/format-date";
import { Backdrop } from "@/components/custom/Backdrop";
import { cn } from "@/lib/utils";
import { useSiteImage } from "@/site-settings/hooks/useSiteImages";
import {
  SITE_IMAGE_DEFAULTS,
  SITE_IMAGE_SLOTS,
} from "@/site-settings/interfaces/site-images.interface";

export const HomePage = () => {
  const {
    data: services,
    isPending: servicesPending,
    isError: servicesError,
    refetch: refetchServices,
  } = useServices();
  const isServicesCarousel = (services?.length ?? 0) >= 3;
  // El teaser del index muestra las 3 notas más recientes. No usa `featured`:
  // esa marca ahora identifica UNA sola nota, la que encabeza Novedades y
  // Prensa, y con una sola el bloque de tres quedaría vacío a medias.
  const { data: news } = useNews({ limit: 3 });
  const latestNews = news?.data ?? [];
  // Sin foto cargada en el panel, el hero rota la secuencia de fotos propias.
  // Con una cargada, manda esa sola: quien la subió eligió esa imagen.
  const heroDelPanel = useSiteImage(SITE_IMAGE_SLOTS.homeHero);
  const empresaBackground = useSiteImage(
    SITE_IMAGE_SLOTS.homeEmpresa,
    SITE_IMAGE_DEFAULTS[SITE_IMAGE_SLOTS.homeEmpresa],
  );

  return (
    <>
      <HeroSecuencia imagenDelPanel={heroDelPanel} />

      <section className="py-16 bg-white">
        <div className="max-w-7xl page-container">
          <p className="font-heading uppercase tracking-[.2em] text-sky-500 text-sm mb-2 text-center">
            Nuestros servicios
          </p>
          <h2 className="font-heading uppercase font-semibold text-navy-800 text-[2rem] md:text-[2.5rem] text-center mb-5">
            Soluciones integrales para la industria
          </h2>
          <AccentBar className="mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto text-center mb-12">
            Petrogas S.A mantiene altos estándares de Calidad, Seguridad y Medio
            Ambiente para satisfacer la Operación y Mantenimiento en el proceso
            de tratamiento de Gas, Operación de Yacimientos de Petróleo, así
            como en el mantenimiento e integridad de las instalaciones.
          </p>

          {servicesPending && <SectionLoader />}
          {servicesError && (
            <SectionError onRetry={() => void refetchServices()} />
          )}

          {services && (
            <div
              className={cn(
                "flex gap-8",
                isServicesCarousel
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
                    isServicesCarousel
                      ? "shrink-0 snap-start w-[82%] sm:w-[47%]"
                      : "w-full",
                  )}
                >
                  <Backdrop
                    image={imagenDeTarjeta(service)}
                    seed={`petrogas-${service.slug}`}
                    width={800}
                    height={500}
                    overlay="linear-gradient(rgba(20,31,71,.35),rgba(20,31,71,.55))"
                    className="h-48"
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
        </div>
      </section>

      <ClientsSection />

      <section className="py-16 bg-white">
        <div className="max-w-7xl page-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Foto real de las oficinas: no lleva velo navy encima como los
              placeholders, la toma nocturna ya tiene su propio contraste. */}
          <div
            className="rounded-xl overflow-hidden shadow-lg h-80 lg:h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${empresaBackground}')` }}
            role="img"
            aria-label="Oficinas de Petrogas S.A en Cutral-Có"
          />
          <div>
            <p className="font-heading uppercase tracking-[.2em] text-sky-500 text-sm mb-2">
              Nuestra empresa
            </p>
            <h2 className="font-heading uppercase font-semibold text-navy-800 text-[2rem] md:text-[2.5rem] mb-4">
              Petrogas S.A
            </h2>
            <AccentBar className="mb-6" />
            <p className="text-gray-600 mb-4 leading-relaxed">
              Al privatizarse la empresa YPF, trabajadores desvinculados de la
              misma crean su propio emprendimiento. De esta forma surge Petrogas
              S.A., en la ciudad de Cutral-Có, en diciembre del año 1992.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              La experiencia e iniciativa de 42 ex empleados permitieron el
              crecimiento permanente y sostenido en el tiempo, para ser hoy una
              empresa líder en el rubro, y la más importante de la cuenca
              Neuquina.
            </p>
            <Button asChild variant="navy">
              <Link to="/nosotros">Conocé más</Link>
            </Button>
          </div>
        </div>
      </section>

      {latestNews.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl page-container">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
              <div>
                <p className="font-heading uppercase tracking-[.2em] text-sky-500 text-sm mb-2">
                  Mantenete informado
                </p>
                <h2 className="font-heading uppercase font-semibold text-navy-800 text-[2rem] md:text-[2.5rem]">
                  Novedades y Prensa
                </h2>
                <AccentBar className="mt-4" />
              </div>
              <Link
                to="/novedades-y-prensa"
                className="text-sky-500 font-heading uppercase tracking-wide text-sm"
              >
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestNews.map((post) => (
                <Link
                  key={post.id}
                  to={`/novedades-y-prensa/${post.slug}`}
                  className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition ring-1 ring-gray-100"
                >
                  <Backdrop
                    image={post.coverImage}
                    seed={`petrogas-${post.slug}`}
                    width={700}
                    height={450}
                    className="h-40"
                  />
                  <div className="p-5">
                    <Badge
                      variant={post.category === "prensa" ? "amber" : "sky"}
                    >
                      {post.category === "prensa" ? "Prensa" : "Novedades"}
                    </Badge>
                    <h3 className="font-heading font-semibold text-navy-800 mb-1 mt-2 group-hover:text-sky-500 transition">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-xs">
                      {formatDate(post.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl page-container flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="font-heading uppercase font-semibold text-white text-[1.75rem] md:text-[2.125rem] mb-2">
              ¿Querés formar parte de nuestro equipo?
            </h2>
            <p className="text-navy-300">
              Sumate a un equipo diverso, dinámico y en crecimiento continuo.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/trabaja-con-nosotros">Trabajá con nosotros</Link>
          </Button>
        </div>
      </section>
    </>
  );
};
