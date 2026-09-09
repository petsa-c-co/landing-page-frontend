import { Link } from "react-router"
import { PageHero } from "../components/PageHero"
import { PRIVACIDAD_REVISION, SITE_INFO } from "@/constants/site"

/**
 * Aviso de privacidad.
 *
 * El contenido describe lo que el sitio realmente hace, verificado contra el
 * código: qué campos pide cada formulario, dónde termina cada dato y qué
 * terceros intervienen. Si mañana se agrega un formulario, un rastreador o un
 * proveedor, este texto hay que actualizarlo — un aviso que no coincide con la
 * realidad es peor que no tenerlo.
 *
 * Se declara la CLASE de destinatario, no el producto: "el sistema interno de
 * administración de personal" y "un proveedor de envío de correo", en vez de
 * nombrarlos. La Ley 25.326 pide informar los destinatarios o su clase, así
 * que la clase alcanza, y nombrarlos le daría a un desconocido un mapa de la
 * infraestructura y de los proveedores a los que suplantar en un phishing.
 * Por el mismo motivo el texto no menciona el panel de administración.
 *
 * OJO: es una base redactada por el equipo de desarrollo, no por un estudio
 * jurídico. Antes de publicarlo conviene que lo revise quien corresponda,
 * sobre todo el plazo de conservación (todavía sin definir) y la inscripción
 * en el Registro Nacional de Bases de Datos, que la Ley 25.326 exige y que
 * hoy no está hecha.
 */

const Seccion = ({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) => (
  <section className="mb-10">
    <h2 className="font-heading uppercase font-semibold text-navy-800 text-xl mb-3">
      {titulo}
    </h2>
    <div className="space-y-3 text-gray-600 leading-relaxed">{children}</div>
  </section>
)

const Lista = ({ items }: { items: string[] }) => (
  <ul className="space-y-2">
    {items.map((item) => (
      <li key={item} className="flex gap-3">
        <span className="text-sky-500 font-bold shrink-0">•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

export const PrivacidadPage = () => {
  return (
    <>
      <PageHero eyebrow="Tus datos" title="Aviso de Privacidad" />

      <section className="py-16 bg-white">
        <div className="max-w-3xl page-container">
          <p className="text-gray-500 text-sm mb-10">
            Última actualización: {PRIVACIDAD_REVISION.fecha} · Revisión{" "}
            {PRIVACIDAD_REVISION.numero}
          </p>

          <Seccion titulo="Quién trata tus datos">
            <p>
              Los datos que dejás en este sitio los trata <b>Petrogas S.A</b>,
              con domicilio en {SITE_INFO.address}.
            </p>
            <p>
              Para cualquier consulta sobre tus datos personales podés
              escribirnos a{" "}
              <a
                href={`mailto:${SITE_INFO.email}`}
                className="text-sky-600 hover:underline"
              >
                {SITE_INFO.email}
              </a>
              .
            </p>
          </Seccion>

          <Seccion titulo="Qué datos pedimos y para qué">
            <p>
              Solo los que hacen falta para responderte. No pedimos datos que no
              vayamos a usar.
            </p>
            <p className="font-medium text-navy-800">Formulario de contacto</p>
            <Lista
              items={[
                "Nombre, correo electrónico y, si querés dejarlo, teléfono y asunto.",
                "El mensaje que nos escribas.",
              ]}
            />
            <p>
              Los usamos únicamente para responder tu consulta y, si hiciera
              falta, seguir la conversación.
            </p>

            <p className="font-medium text-navy-800 pt-2">
              Formulario de postulación
            </p>
            <Lista
              items={[
                "Nombre y apellido, correo electrónico, teléfono y localidad.",
                "Tu título y los puestos a los que te postulás.",
                "Tu CV en PDF.",
              ]}
            />
            <p>
              Los usamos solo para procesos de selección de personal de Petrogas
              S.A. No se usan para publicidad ni se cruzan con otra información.
            </p>
          </Seccion>

          <Seccion titulo="Qué no hacemos">
            <Lista
              items={[
                "No vendemos, alquilamos ni cedemos tus datos con fines publicitarios.",
                "No usamos cookies de rastreo, analítica ni publicidad.",
                "No armamos perfiles ni tomamos decisiones automatizadas sobre vos.",
              ]}
            />
            <p>
              Como visitante no se te instala ninguna cookie. Las únicas que
              usa el sitio son técnicas y necesarias para el acceso del personal
              autorizado de Petrogas S.A.
            </p>
          </Seccion>

          <Seccion titulo="Con quién se comparten">
            <p>
              Únicamente con quienes intervienen para cumplir la finalidad con
              la que nos los diste:
            </p>
            <Lista
              items={[
                "El área de Recursos Humanos de Petrogas S.A, a través del sistema interno de administración de personal, en el caso de las postulaciones y los CV.",
                "Un proveedor de servicios de envío de correo electrónico, que interviene únicamente para hacernos llegar los avisos.",
              ]}
            />
            <p>
              Con nadie más. No cedemos tus datos a terceros para finalidades
              distintas de las descriptas acá.
            </p>
          </Seccion>

          <Seccion titulo="Cuánto tiempo los conservamos">
            <p>
              Conservamos tus datos mientras sean necesarios para la finalidad
              con la que los recibimos, y los eliminamos cuando esa finalidad se
              cumple o cuando nos pedís que lo hagamos.
            </p>
            <p>
              Tu CV y los datos de tu postulación se conservan en el sistema
              interno de administración de personal, bajo los plazos que fija el
              área de Recursos Humanos.
            </p>
          </Seccion>

          <Seccion titulo="Tus derechos">
            <p>
              Podés pedirnos en cualquier momento acceder a tus datos,
              corregirlos, actualizarlos o que los eliminemos. Alcanza con
              escribir a{" "}
              <a
                href={`mailto:${SITE_INFO.email}`}
                className="text-sky-600 hover:underline"
              >
                {SITE_INFO.email}
              </a>{" "}
              desde la dirección con la que nos escribiste, o indicándonos cómo
              podemos verificar tu identidad.
            </p>
            {/* Los dos párrafos que siguen son textos que la Ley 25.326 y su
                reglamentación piden incluir casi con estas palabras. */}
            <p className="text-sm text-gray-500">
              El titular de los datos personales tiene la facultad de ejercer el
              derecho de acceso a los mismos en forma gratuita a intervalos no
              inferiores a seis meses, salvo que se acredite un interés legítimo
              al efecto, conforme lo establecido en el artículo 14, inciso 3 de
              la Ley N° 25.326.
            </p>
            <p className="text-sm text-gray-500">
              La Agencia de Acceso a la Información Pública, en su carácter de
              órgano de control de la Ley N° 25.326, tiene la atribución de
              atender las denuncias y reclamos que interpongan quienes resulten
              afectados en sus derechos por incumplimiento de las normas
              vigentes en materia de protección de datos personales.
            </p>
          </Seccion>

          <Seccion titulo="Cambios en este aviso">
            <p>
              Si cambiamos la forma en que tratamos tus datos, actualizamos este
              aviso y la fecha que figura arriba. Te recomendamos revisarlo cada
              tanto.
            </p>
          </Seccion>

          <div className="border-t border-gray-200 pt-8">
            <p className="text-gray-500 text-sm">
              ¿Dudas sobre algo de esto?{" "}
              <Link to="/contacto" className="text-sky-600 hover:underline">
                Escribinos
              </Link>{" "}
              y te respondemos.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
