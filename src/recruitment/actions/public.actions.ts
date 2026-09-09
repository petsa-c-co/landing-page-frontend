import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"
import type {
  ApplicationReceipt,
  DegreeTitle,
  JobProfile,
} from "../interfaces/recruitment.interface"
import type { ApplicationFormValues } from "../schemas/application.schema"

// Puestos: el backend reenvía la consulta a Gestión, que es donde RRHH los
// administra. Vienen con id numérico y sin flags: la lista ya llega filtrada.
export const getJobProfilesAction = async (): Promise<JobProfile[]> => {
  const { data } = await petrogasApi.get<ApiEnvelope<JobProfile[]>>(
    "/recruitment/job-profiles",
  )
  return unwrap(data)
}

// Títulos: este catálogo sigue siendo del sitio y devuelve la lista completa,
// sin paginar, porque alimenta el autocompletado del formulario.
export const getDegreeTitlesAction = async (): Promise<DegreeTitle[]> => {
  const { data } = await petrogasApi.get<ApiEnvelope<DegreeTitle[]>>(
    "/recruitment/degree-titles",
  )
  return unwrap(data)
}

/**
 * Envía la postulación. Va en multipart porque lleva el CV: se arma un
 * FormData y NO se toca Content-Type — el navegador tiene que poner el
 * boundary él mismo.
 *
 * El backend no guarda nada: reenvía todo a Gestión, incluido el PDF. Si ellos
 * no responden, la postulación no queda registrada en ninguna parte, por eso el
 * formulario conserva lo cargado para poder reintentar.
 */
export const submitApplicationAction = async (
  values: ApplicationFormValues,
  cv: File,
): Promise<ApplicationReceipt> => {
  const formData = new FormData()
  formData.append("fullName", values.fullName.trim())
  formData.append("email", values.email.trim())
  formData.append("phone", values.phone.trim())
  formData.append("location", values.location.trim())

  // Varios puestos = el mismo campo repetido, no un JSON ni un CSV.
  for (const id of values.jobProfileIds) {
    formData.append("jobProfileIds", String(id))
  }

  // Del catálogo viajan id Y nombre: los ids de títulos son nuestros y en
  // Gestión no significan nada, así que lo que guardan es el nombre. Si lo
  // escribió a mano va solo degreeTitleOther; nunca las dos opciones juntas.
  if (values.degreeTitleId) {
    formData.append("degreeTitleId", values.degreeTitleId)
    if (values.degreeTitleName) {
      formData.append("degreeTitleName", values.degreeTitleName)
    }
  } else if (values.degreeTitleOther?.trim()) {
    formData.append("degreeTitleOther", values.degreeTitleOther.trim())
  }

  formData.append("cv", cv)

  const { data } = await petrogasApi.post<ApiEnvelope<ApplicationReceipt>>(
    "/recruitment/applications",
    formData,
  )
  return unwrap(data)
}
