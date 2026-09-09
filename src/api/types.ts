// Sobre estándar del backend. Todas las respuestas 2xx lo usan
// (ver ResponseInterceptor en el backend).
export interface ApiEnvelope<T> {
  success: true
  statusCode: number
  message: string
  data: T
  meta?: PaginationMeta
}

// Presente solo en listas paginadas.
export interface PaginationMeta {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPageUrl: string | null
  prevPageUrl: string | null
}

// Lo que devuelven las actions de endpoints paginados: la lista ya
// desenvuelta más su metadata.
export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

// Registro que ya usa un valor único (slug/name) y bloquea la operación.
// Viene solo en los 409 por duplicado (FRONTEND.md §4.7.1). Un item en la
// papelera sigue reservando su valor, de ahí que el bloqueante pueda estar ahí.
export interface UniqueConflict {
  id: string
  field: "slug" | "name"
  value: string
  // true = el bloqueante está en la papelera: con su id se puede restaurar o
  // eliminar definitivamente para liberar el valor.
  inTrash: boolean
}

// Detalle de validación por campo. Lo devuelven los 422 que Gestión Petrogas
// reenvía a través del backend: cada clave es un campo del formulario y cada
// valor, sus mensajes ya redactados en español.
export type FieldErrors = Record<string, string[]>

// Sobre de errores, que arman los Exception Filters del backend.
export interface ApiErrorEnvelope {
  success: false
  statusCode: number
  message: string
  // Lista plana en los errores propios del backend; mapa por campo en los 422
  // de Gestión.
  errors: string[] | FieldErrors | null
  // Presente solo en los 409 por valor único ya tomado.
  conflict?: UniqueConflict
  timestamp: string
  path: string
}
