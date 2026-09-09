import { PageHero } from "../components/PageHero"
import { SITE_IMAGE_SLOTS } from "@/site-settings/interfaces/site-images.interface"
import { ApplicationForm } from "@/recruitment/components/ApplicationForm"

export const TrabajaConNosotrosPage = () => {
  return (
    <>
      <PageHero
        eyebrow="Sumate al equipo"
        title="Trabajá con nosotros"
        slot={SITE_IMAGE_SLOTS.bannerRrhh}
      />

      <section className="py-16 bg-white">
        <div className="max-w-3xl page-container">
          <p className="text-gray-600 leading-relaxed mb-4">
            En Petrogas S.A buscamos personas con las competencias necesarias
            para desarrollarse en el rubro Gas &amp; Petróleo, que quieran
            crecer dentro de un equipo diverso, dinámico y en formación
            permanente.
          </p>
          <p className="text-gray-600 leading-relaxed mb-10">
            Nuestro Departamento de Recursos Humanos acompaña el desarrollo de
            cada trabajador con capacitación continua y alianzas académicas de
            prestigio nacional e internacional.
          </p>

          <ApplicationForm />
        </div>
      </section>
    </>
  )
}
