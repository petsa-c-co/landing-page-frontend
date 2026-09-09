import { z } from "zod"

// Los límites espejan CreateContactMessageDto del backend, para que el error
// salte en el cliente y no tras el viaje de ida y vuelta.
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Ingresá tu nombre")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  email: z
    .email("Ingresá un correo válido")
    .max(254, "El correo no puede tener más de 254 caracteres"),
  phone: z
    .string()
    .max(30, "El teléfono no puede tener más de 30 caracteres")
    .optional(),
  subject: z
    .string()
    .max(150, "El asunto no puede tener más de 150 caracteres")
    .optional(),
  message: z
    .string()
    .min(10, "Contanos un poco más en tu mensaje")
    .max(5000, "El mensaje no puede tener más de 5000 caracteres"),
  /**
   * Campo trampa (honeypot). Va oculto y fuera del alcance del teclado, así
   * que una persona no puede completarlo; los bots sí, porque leen el HTML y
   * llenan todos los <input> que encuentran. Si llega con algo, el backend
   * descarta el mensaje en silencio y responde 201 igual, para que el bot no
   * se entere.
   *
   * SIN validación a propósito: tiene que poder salir vacío siempre. Y sin
   * chequeo del lado del cliente — si el frontend cortara el envío, el bot
   * vería el error en el acto y probaría otra cosa.
   */
  referencia: z.string().optional(),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
