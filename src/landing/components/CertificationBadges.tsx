import { useCertifications } from "@/certifications/hooks/useCertifications"
import { iconoDeCertificacion } from "@/certifications/constants/norm-icons"

// Badges de normas ISO del hero. Salen del CMS: si se da de alta o se quita una
// certificación desde el panel, el hero acompaña sin tocar código.
export const CertificationBadges = () => {
  const { data: certifications } = useCertifications()

  if (!certifications || certifications.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2.5 mb-7">
      {certifications.map((cert) => {
        // El mismo ícono por norma que usa la página de Certificaciones: si
        // acá fueran todas con el escudo genérico, las mismas tres normas se
        // verían distintas según la pantalla.
        const Icono = iconoDeCertificacion(cert.title, cert.subtitle)
        return (
          <span
            key={cert.id}
            title={`${cert.subtitle} — ${cert.description}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-heading uppercase tracking-wide text-sm text-white ring-1 ring-white/30 backdrop-blur-sm"
          >
            <Icono className="w-4 h-4 text-sky-400" />
            {cert.title}
          </span>
        )
      })}
    </div>
  )
}
