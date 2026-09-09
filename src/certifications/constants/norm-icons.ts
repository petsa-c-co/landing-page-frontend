import {
  Award,
  HardHat,
  Leaf,
  Lock,
  ShieldCheck,
  TrafficCone,
  Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * Ícono de cada norma certificada.
 *
 * Hace falta porque una empresa certificada NO puede usar el logo de ISO —sus
 * reglas de uso no lo permiten—, así que la tarjeta no tiene una marca real
 * que mostrar y el ícono queda como identificación permanente, no como un
 * placeholder hasta conseguir el logo.
 *
 * Se elige por el NÚMERO de norma y no por el texto del subtítulo: el número
 * es el identificador canónico y no cambia, mientras que el subtítulo se edita
 * desde el panel y alcanza con que alguien escriba "Gestión Ambiental" en vez
 * de "Medio Ambiente" para que el mapeo deje de encontrarlo.
 */
const POR_NORMA: { norma: RegExp; icono: LucideIcon }[] = [
  { norma: /\b9001\b/, icono: Award }, // Calidad
  { norma: /\b14001\b/, icono: Leaf }, // Medio ambiente
  { norma: /\b45001\b/, icono: HardHat }, // Seguridad y salud ocupacional
  { norma: /\b39001\b/, icono: TrafficCone }, // Seguridad vial
  { norma: /\b50001\b/, icono: Zap }, // Energía
  { norma: /\b27001\b/, icono: Lock }, // Seguridad de la información
]

// Respaldo para cuando el título no trae un número reconocible. El orden
// importa: "vial" va antes que "seguridad" porque "Seguridad Vial" contiene
// las dos palabras y ganaría el casco en vez del cono.
const POR_TEXTO: { texto: RegExp; icono: LucideIcon }[] = [
  { texto: /calidad/i, icono: Award },
  { texto: /ambient/i, icono: Leaf },
  { texto: /vial|tr[áa]nsito/i, icono: TrafficCone },
  { texto: /salud|ocupacional|seguridad/i, icono: HardHat },
  { texto: /energ/i, icono: Zap },
]

/**
 * Devuelve el ícono de una certificación. Si no se reconoce ni por número ni
 * por texto cae en el escudo genérico: una norma nueva que nadie previó tiene
 * que verse bien igual, no romperse.
 */
export const iconoDeCertificacion = (
  title: string,
  subtitle: string,
): LucideIcon => {
  const porNorma = POR_NORMA.find((entrada) => entrada.norma.test(title))
  if (porNorma) return porNorma.icono

  const porTexto = POR_TEXTO.find((entrada) =>
    entrada.texto.test(`${subtitle} ${title}`),
  )
  return porTexto?.icono ?? ShieldCheck
}
