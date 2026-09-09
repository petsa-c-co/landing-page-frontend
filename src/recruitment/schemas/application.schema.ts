import { z } from "zod"

// 5 MB, igual que MAX_CV_SIZE_BYTES del backend.
export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024

// Tope de puestos por postulación, igual que el del backend.
export const MAX_PUESTOS = 3

// Los límites de largo espejan lo que valida Gestión, para que el error salte
// acá y no después del viaje de ida y vuelta con el PDF a cuestas.
export const applicationFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(5, "Escribí tu nombre y apellido completos")
      .max(120, "No puede tener más de 120 caracteres"),
    email: z
      .email("Ingresá un correo válido")
      .max(254, "El correo no puede tener más de 254 caracteres"),
    phone: z
      .string()
      .trim()
      .min(1, "Dejanos un teléfono de contacto")
      .max(30, "El teléfono no puede tener más de 30 caracteres"),
    location: z
      .string()
      .trim()
      .min(1, "Indicá tu localidad")
      .max(120, "La localidad no puede tener más de 120 caracteres"),
    // Los ids de puesto son numéricos: los publica Gestión, no el sitio.
    jobProfileIds: z
      .array(z.number())
      .min(1, "Elegí al menos un puesto")
      // El backend rechaza el cuarto con un 422. Acá está por si alguien fuerza
      // los checkboxes desde el navegador; en uso normal no se llega nunca,
      // porque el selector deshabilita las opciones al llegar al tope.
      .max(MAX_PUESTOS, `Podés elegir hasta ${MAX_PUESTOS} puestos.`),
    // Del catálogo van los DOS campos: Gestión guarda el nombre porque los ids
    // del catálogo de títulos son nuestros y allá no significan nada.
    degreeTitleId: z.string().optional(),
    degreeTitleName: z.string().optional(),
    degreeTitleOther: z
      .string()
      .trim()
      .max(150, "El título no puede tener más de 150 caracteres")
      .optional(),
  })
  .superRefine((values, ctx) => {
    const delCatalogo = Boolean(values.degreeTitleId)
    const escritoAMano = Boolean(values.degreeTitleOther?.trim())

    if (delCatalogo && escritoAMano) {
      ctx.addIssue({
        code: "custom",
        path: ["degreeTitleOther"],
        message:
          "Elegí un título del listado o escribí el tuyo, pero no las dos cosas",
      })
      return
    }

    // Gestión documentó el título como opcional pero su API rechaza el envío
    // sin ninguno de los dos. Se pide acá para no hacer viajar un PDF de 5 MB
    // y devolver un 422; si lo confirman como opcional, se borra este bloque.
    if (!delCatalogo && !escritoAMano) {
      ctx.addIssue({
        code: "custom",
        path: ["degreeTitleId"],
        message: "Elegí tu título o escribilo si no está en la lista",
      })
    }
  })

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>

/**
 * Valida el CV antes de subirlo. Devuelve el mensaje de error o null si está
 * bien. Gestión igual comprueba que sea un PDF real: acá solo se atajan los
 * casos obvios para no hacerle subir 5 MB a alguien que eligió un .docx.
 */
export const validateCvFile = (file: File | null): string | null => {
  if (!file) return "Adjuntá tu CV en PDF"

  const looksLikePdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  if (!looksLikePdf) return "El CV tiene que ser un archivo PDF"

  if (file.size > MAX_CV_SIZE_BYTES) {
    return "El CV no puede pesar más de 5 MB"
  }

  return null
}
