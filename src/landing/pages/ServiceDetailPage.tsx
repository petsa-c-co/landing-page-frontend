import { Link, useParams } from "react-router";
import { PageHero, ServiceBreadcrumb } from "../components/PageHero";
import { CTASection } from "../components/CTASection";
import { ServiceItemsList } from "../components/ServiceItemsList";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { Button } from "@/components/ui/button";
import { useServiceBySlug } from "@/services/hooks/useServices";
import { Backdrop } from "@/components/custom/Backdrop";
import { imagenDeDetalle } from "@/services/constants/default-images";
import { Seo } from "@/shared/components/Seo";

export const ServiceDetailPage = () => {
  const { slug = "" } = useParams();
  const { data: service, isPending, isError, refetch } = useServiceBySlug(slug);

  // Las salidas tempranas también ponen título. Sin esto, mientras carga o si el
  // servicio no existe la pestaña queda en blanco y Google ve una página sin
  // título: el <Seo> de más abajo nunca llega a renderizarse en esos casos.
  if (isPending)
    return (
      <>
        <Seo titulo="Servicios" descripcion="Cargando el servicio." />
        <SectionLoader className="py-32" />
      </>
    );

  if (isError || !service) {
    return (
      <div className="py-24 text-center px-4">
        <Seo
          titulo="Servicio no encontrado"
          descripcion="El servicio que buscabas cambió de dirección o ya no está disponible."
        />
        <h1 className="font-heading uppercase font-semibold text-navy-800 text-2xl mb-3">
          No encontramos este servicio
        </h1>
        <SectionError
          message="Puede que haya cambiado de dirección o ya no esté disponible."
          onRetry={() => void refetch()}
          className="py-6"
        />
        <Button asChild variant="navy">
          <Link to="/servicios">Ver todos los servicios</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* El título sale del nombre del servicio, no de un texto fijo: es lo que
          hace que cada servicio compita por su propia búsqueda en Google. */}
      <Seo
        titulo={service.title}
        descripcion={service.shortDescription}
        imagen={service.cardImage ?? undefined}
      />
      <PageHero
        eyebrow={<ServiceBreadcrumb label={service.title} />}
        title={service.title}
        image={service.bannerImage}
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl page-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              {service.longDescription}
            </p>
            <ServiceItemsList
              items={service.items}
              layout={service.itemsLayout}
            />
          </div>
          <Backdrop
            image={imagenDeDetalle(service)}
            seed={`petrogas-${service.slug}-detail`}
            width={900}
            height={700}
            className="rounded-xl overflow-hidden shadow-lg h-80 lg:h-full"
          />
        </div>
      </section>

      <CTASection
        title="¿Querés más información?"
        description="Escribinos y coordinamos una reunión con nuestro equipo técnico."
        buttonLabel="Contactanos"
        to="/contacto"
      />
    </>
  );
};
