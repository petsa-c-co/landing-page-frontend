// Nivel educativo del título (enum DegreeTitleLevel del backend). Ordenados
// como escalera educativa: el autocompletado del formulario agrupa por acá.
export const DEGREE_TITLE_LEVELS = [
  "primario",
  "secundario",
  "secundario_tecnico",
  "terciario",
  "universitario",
  "formacion_profesional",
] as const

export type DegreeTitleLevel = (typeof DEGREE_TITLE_LEVELS)[number]

// Etiquetas para mostrar. El backend guarda el valor crudo con guiones bajos.
export const DEGREE_TITLE_LEVEL_LABELS: Record<DegreeTitleLevel, string> = {
  primario: "Primario",
  secundario: "Secundario",
  secundario_tecnico: "Secundario técnico",
  terciario: "Terciario",
  universitario: "Universitario",
  formacion_profesional: "Formación profesional",
}

/**
 * Puesto al que se puede postular. El catálogo ya no es del sitio: lo publica
 * Gestión Petrogas y el backend solo reenvía la consulta. De ahí que venga
 * pelado —solo id y nombre— y que el id sea NUMÉRICO, no un UUID como el
 * resto de las entidades de acá.
 */
export interface JobProfile {
  id: number
  name: string
}

// El catálogo de títulos sí sigue siendo nuestro: se administra desde el panel
// y conserva sus ids UUID.
export interface DegreeTitle {
  id: string
  name: string
  level: DegreeTitleLevel
  isActive: boolean
  sortOrder: number
  deletedAt: string | null
}

// Acuse de Gestión al aceptar una postulación. Antes traía `updated` porque el
// sitio guardaba una postulación por email y la actualizaba; ahora el dueño de
// esa lógica es Gestión y no informa si era una persona repetida.
export interface ApplicationReceipt {
  id: number
  status: string
}
