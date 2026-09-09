import { PageHero } from "../components/PageHero";
import { SITE_IMAGE_SLOTS } from "@/site-settings/interfaces/site-images.interface"
import { CTASection } from "../components/CTASection";

// Sin ícono a propósito. Compromiso, Servir, Responsabilidad y Pertenencia son
// los conceptos más abstractos del sitio y no tienen iconografía natural:
// cualquier ícono termina siendo un juego de palabras o relleno, que es lo que
// hace que una sección se lea como generada. En su lugar va el hilo azul→rojo,
// el mismo que firma el pie. En Certificaciones sí hay íconos porque ahí hay
// referentes reales (calidad, ambiente, seguridad laboral).
const VALUES = [
  {
    title: "Compromiso",
    description:
      "Se fundamenta en la confianza mutua que nos permite construir relaciones duraderas, en un marco de comunicación constructiva y cordialidad.",
  },
  {
    title: "Servir",
    description:
      "Nuestro espíritu de mejora continua nos permite sobrepasar los requerimientos de la industria, acompañando la satisfacción de nuestros clientes.",
  },
  {
    title: "Responsabilidad",
    description:
      "Siempre que nos comprometemos con algo o alguien, sabemos que contamos con las habilidades y recursos necesarios para responder a ese compromiso.",
  },
  {
    title: "Pertenencia",
    description:
      "Estamos comprometidos afectivamente con nuestra empresa, y con las localidades de la región.",
  },
];

const PRINCIPLES = [
  "Consideramos la calidad como una serie de procesos interrelacionados, revisables y mejorables. Aspiramos, como objetivo de largo plazo, brindar a nuestros clientes los resultados planificados sin fallas ni defectos.",
  "La seguridad es un valor esencial para la organización; por ello tenemos como objetivo a largo plazo tener una tasa de cero accidentes.",
  "Establecer, revisar y mejorar procesos de prevención tendientes a eliminar los riesgos de seguridad personal, vial, de procesos e instalaciones.",
  "Nos preocupamos y ocupamos de la salud laboral de nuestro personal, comprometiéndonos a establecer medidas de prevención para mantener buenas condiciones sanitarias de trabajo.",
  "Asumimos la responsabilidad que nos compete en la protección y cuidado del medio ambiente en que realizamos nuestras tareas, efectuando un manejo adecuado y sustentable de los recursos ambientales.",
];

const COMMITMENTS = [
  "Establecer relaciones exitosas y de largo plazo con nuestros clientes, superando sus expectativas.",
  "Cumplir con las normas legales, reglamentarias y requisitos de la industria o terceras partes involucradas.",
  "Alentar prácticas de mejora continua como parte esencial de la seguridad de los procesos.",
  "Liderazgo y responsabilidad en toda la organización.",
  "Mantener una comunicación abierta con todos los involucrados.",
  "Minimizar riesgos y aprovechar oportunidades.",
  "Proveer recursos y capacitación para asegurar el cumplimiento de esta política.",
  "Comprometernos con la sociedad, y en especial, con las comunidades de Cutral-Có y Plaza Huincul.",
];

export const NosotrosPage = () => {
  return (
    <>
      <PageHero
        eyebrow="Nuestra empresa"
        title="Nosotros"
        slot={SITE_IMAGE_SLOTS.bannerNosotros}
      />

      <section className="py-16 bg-white">
        <div className="max-w-5xl page-container">
          <h2 className="font-heading uppercase font-semibold text-navy-800 text-[2rem] md:text-[2.5rem] mb-6">
            Petrogas S.A
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Al privatizarse la empresa YPF, trabajadores desvinculados de la
            misma crean su propio emprendimiento. De esta forma surge Petrogas
            S.A, en la ciudad de Cutral-Có, en diciembre del año 1992.
          </p>
          <p className="text-gray-600 leading-relaxed">
            La experiencia e iniciativa de 42 ex empleados permitieron el
            crecimiento permanente y sostenido en el tiempo, para ser hoy una
            empresa líder en el rubro, y la más importante de la cuenca
            Neuquina.
          </p>
        </div>
      </section>

      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl page-container grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-navy-800/60 ring-1 ring-navy-700 rounded-xl p-8">
            <p className="font-heading uppercase tracking-wide text-sky-400 text-sm mb-3">
              Misión
            </p>
            <p className="text-white text-lg leading-relaxed">
              Ser Líderes en prestaciones de Servicios en la Industria,
              garantizando Calidad, Confianza y Seguridad.
            </p>
          </div>
          <div className="bg-navy-800/60 ring-1 ring-navy-700 rounded-xl p-8">
            <p className="font-heading uppercase tracking-wide text-sky-400 text-sm mb-3">
              Visión
            </p>
            <p className="text-white text-lg leading-relaxed">
              Mantenerse como una Empresa Líder en la Prestación de Servicios.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl page-container">
          <p className="font-heading uppercase tracking-[.2em] text-sky-500 text-sm mb-2 text-center">
            Lo que nos define
          </p>
          <h2 className="font-heading uppercase font-semibold text-navy-800 text-[2rem] md:text-[2.5rem] text-center mb-12">
            Nuestros valores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ title, description }) => (
              <div
                key={title}
                className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6"
              >
                <div
                  aria-hidden="true"
                  className="h-[3px] w-10 rounded-full bg-gradient-to-r from-sky-500 to-petrogas-red-500 mb-4"
                />
                <h3 className="font-heading uppercase font-semibold text-navy-800 mb-2">
                  {title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl page-container">
          <p className="font-heading uppercase tracking-[.2em] text-sky-500 text-sm mb-2">
            Cómo trabajamos
          </p>
          <h2 className="font-heading uppercase font-semibold text-navy-800 text-[2rem] md:text-[2.5rem] mb-6">
            Políticas aplicadas
          </h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            PETROGAS S.A es una empresa Neuquina, cuyo objetivo es brindar
            servicios de Operación y Mantenimiento en instalaciones de plantas
            industriales en yacimientos petroleros y gasíferos. Para alcanzar
            estos objetivos, PETROGAS S.A ha considerado los siguientes
            principios:
          </p>
          <ul className="space-y-4 mb-10">
            {PRINCIPLES.map((principle) => (
              <li key={principle} className="flex gap-3">
                <span className="text-sky-500 font-bold">•</span>
                <span className="text-gray-600">{principle}</span>
              </li>
            ))}
          </ul>

          <h3 className="font-heading uppercase font-semibold text-navy-800 text-xl mb-5">
            Nuestro compromiso
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {COMMITMENTS.map((commitment) => (
              <li key={commitment} className="flex gap-3 text-gray-600 text-sm">
                <span className="text-sky-500 font-bold">•</span>
                {commitment}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection
        title="Conocé nuestros servicios"
        description="Operación, mantenimiento, transporte y well testing para toda la cuenca Neuquina."
        buttonLabel="Ver servicios"
        to="/servicios"
      />
    </>
  );
};
