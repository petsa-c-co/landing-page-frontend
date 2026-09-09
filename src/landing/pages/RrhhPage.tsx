import { PageHero } from "../components/PageHero";
import { SITE_IMAGE_SLOTS } from "@/site-settings/interfaces/site-images.interface"
import { CTASection } from "../components/CTASection";

export const RrhhPage = () => {
  return (
    <>
      <PageHero
        eyebrow="Sumate al equipo"
        title="Recursos Humanos"
        slot={SITE_IMAGE_SLOTS.bannerRrhh}
      />

      <section className="py-16 bg-white">
        <div className="max-w-5xl page-container">
          <p className="text-gray-600 leading-relaxed mb-4">
            Petrogas S.A cuenta con un Departamento de R.R.H.H. donde se
            coordinan las acciones necesarias para propiciar el bienestar
            social, el desarrollo de los trabajadores y la contribución al
            crecimiento del personal en sus competencias.
          </p>
          <p className="text-gray-600 leading-relaxed">
            La visión de R.R.H.H. es continuar en el permanente crecimiento, a
            través de la capacitación y motivación de nuestra gente, para
            mantenernos como empresa líder en el mercado.
          </p>
        </div>
      </section>

      {/* Arriba el aire lo pone la sección anterior, que ya trae py-16; abajo
          hay que ponerlo acá, porque lo que sigue es la banda oscura del CTA y
          las tarjetas quedarían pegadas al corte de color. */}
      <section className="bg-white pb-16">
        <div className="max-w-7xl page-container grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-xl ring-1 ring-gray-100 p-8">
            {/* El mismo hilo azul→rojo que firma el pie: ata la sección a la
                identidad del sitio. Antes había un ícono decorativo por
                tarjeta —una lupa para "buscamos" y unas chispitas para
                "ofrecemos"— que no aportaban nada al contenido. */}
            <div
              aria-hidden="true"
              className="h-[3px] w-12 rounded-full bg-gradient-to-r from-sky-500 to-petrogas-red-500 mb-5"
            />
            <h3 className="font-heading uppercase font-semibold text-navy-800 text-xl mb-3">
              ¿Qué buscamos?
            </h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              Personal con las competencias necesarias para desarrollarse en el
              rubro Gas &amp; Petróleo.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Buscamos liderar un proceso estratégico para proveer los mejores
              recursos y lograr óptimos resultados.
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl ring-1 ring-gray-100 p-8">
            <div
              aria-hidden="true"
              className="h-[3px] w-12 rounded-full bg-gradient-to-r from-sky-500 to-petrogas-red-500 mb-5"
            />
            <h3 className="font-heading uppercase font-semibold text-navy-800 text-xl mb-3">
              ¿Qué ofrecemos?
            </h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              Ser integrante de un equipo de trabajo diverso, dinámico y
              creativo, en un ámbito de desarrollo y crecimiento continuo, donde
              cada generación hace su aporte.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Contamos con formación corporativa junto a alianzas académicas de
              prestigio nacional e internacional, fortaleciendo el nivel
              individual y colectivo en Management, Operaciones y Mantenimiento
              de Gas y Petróleo.
            </p>
          </div>
        </div>
      </section>

      {/* Sin formulario de postulación no se puede prometer "Postularme": el
          botón lleva a la página donde va a estar el enlace a la plataforma. */}
      <CTASection
        title="Trabajá con Nosotros"
        description="Conocé cómo sumarte a nuestro equipo de trabajo."
        buttonLabel="Ver más"
        to="/trabaja-con-nosotros"
      />
    </>
  );
};
