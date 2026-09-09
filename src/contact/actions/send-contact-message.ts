import { petrogasApi, unwrap } from "@/api/petrogasApi"
import type { ApiEnvelope } from "@/api/types"
import type { ContactFormValues } from "../schemas/contact.schema"

export const sendContactMessageAction = async (
  values: ContactFormValues,
): Promise<{ id: string }> => {
  // Los campos opcionales vacíos se omiten: sus columnas son nullable y
  // @IsOptional() del backend solo ignora undefined, no la cadena vacía.
  const payload = {
    ...values,
    phone: values.phone?.trim() || undefined,
    subject: values.subject?.trim() || undefined,
    // El campo trampa viaja SIEMPRE, también vacío: es la mitad del honeypot.
    // A diferencia de los opcionales de arriba, acá no se omite la cadena
    // vacía — que el campo esté presente es parte de que el formulario se vea
    // normal desde afuera.
    referencia: values.referencia ?? "",
  }

  const { data } = await petrogasApi.post<ApiEnvelope<{ id: string }>>(
    "/contact",
    payload,
  )
  return unwrap(data)
}
