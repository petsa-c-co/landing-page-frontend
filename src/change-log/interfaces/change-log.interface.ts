/**
 * Registro de cambios (control de documentos ISO).
 *
 * ACÁ ESTÁ LA COSTURA. El contrato del backend todavía puede moverse —sobre
 * todo la forma de `details`—, así que la pantalla NO consume la respuesta
 * cruda: consume los tipos "ya mapeados" de este archivo. Si el backend
 * renombra un campo, se toca `mapearAsiento` en las actions y nada más.
 *
 * Por eso los tipos `...Api` de abajo tienen todo opcional: describen lo que
 * hoy dice el contrato, no lo que la pantalla necesita.
 */

// --- Lo que promete el contrato de hoy -------------------------------------

export interface ChangeLogDetailApi {
  fieldLabel?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  summary?: string | null;
  valueKind?: string | null;
}

export interface ChangeLogEntryApi {
  id?: string;
  occurredAt?: string;
  revision?: string | null;
  entityType?: string | null;
  entityLabel?: string | null;
  action?: string | null;
  actorLabel?: string | null;
  details?: ChangeLogDetailApi[] | null;
}

// --- Lo que usa la pantalla ------------------------------------------------

// Los cinco valores documentados. Se guarda como string y no como unión
// cerrada: si el backend suma uno, la pantalla lo muestra en gris en vez de
// romperse o de esconder un asiento del registro, que sería lo peor que puede
// hacer un registro de auditoría.
export const ACCIONES = [
  "creacion",
  "modificacion",
  "baja",
  "restauracion",
  "eliminacion",
] as const;

export type AccionConocida = (typeof ACCIONES)[number];

export interface ChangeLogDetail {
  campo: string;
  anterior: string | null;
  nuevo: string | null;
  // Cuando viene, reemplaza a los dos valores de arriba: pasa con los campos
  // largos (el cuerpo de una nota) y con los archivos, donde mostrar el "antes
  // y después" no tendría sentido.
  resumen: string | null;
  tipo: string | null;
}

export interface ChangeLogEntry {
  id: string;
  ocurrioEn: string;
  revision: string | null;
  tipoEntidad: string | null;
  // Es el nombre que tenía el elemento EN ESE MOMENTO. No se actualiza si
  // después lo renombran, y no enlaza a la ficha: el elemento puede haber sido
  // eliminado y el asiento sigue.
  etiquetaEntidad: string | null;
  accion: string | null;
  autor: string | null;
  detalles: ChangeLogDetail[];
}

export interface ChangeLogFilters {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  entityType?: string;
  action?: string;
}
