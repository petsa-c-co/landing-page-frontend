import { petrogasApi, unwrap } from "./petrogasApi"
import type { ApiEnvelope } from "./types"

// Los recursos del catálogo comparten los mismos 3 endpoints de papelera
// (FRONTEND.md §4.7), así que se generan a partir del path base en vez de
// repetir el mismo trío en cada módulo.
export const TRASH_BASE_PATHS = {
  services: "/services",
  certifications: "/certifications",
  clients: "/clients",
  news: "/news",
  // Los puestos salieron de acá: los administra Gestión Petrogas y el sitio
  // solo lee su lista. Los títulos siguen siendo nuestros.
  degreeTitles: "/recruitment/degree-titles",
} as const

export type TrashResource = keyof typeof TRASH_BASE_PATHS

export interface TrashActions<T> {
  getTrash: () => Promise<T[]>
  restore: (id: string) => Promise<void>
  permanent: (id: string) => Promise<void>
}

export const createTrashActions = <T>(basePath: string): TrashActions<T> => ({
  // Array plano (sin paginar), más recientes primero.
  getTrash: async () => {
    const { data } = await petrogasApi.get<ApiEnvelope<T[]>>(
      `${basePath}/admin/trash`,
    )
    return unwrap(data)
  },
  // restore y permanent no devuelven la entidad: hay que refrescar los
  // listados (papelera + listado normal) después de cada uno.
  restore: async (id) => {
    await petrogasApi.post(`${basePath}/${id}/restore`)
  },
  permanent: async (id) => {
    await petrogasApi.delete(`${basePath}/${id}/permanent`)
  },
})

// Acciones sueltas por id, para resolver un 409 cuyo bloqueante está en la
// papelera: ahí solo se tiene el id y el recurso, no la entidad.
export const restoreFromTrash = (basePath: string, id: string): Promise<void> =>
  petrogasApi.post(`${basePath}/${id}/restore`).then(() => undefined)

export const deleteForever = (basePath: string, id: string): Promise<void> =>
  petrogasApi.delete(`${basePath}/${id}/permanent`).then(() => undefined)
