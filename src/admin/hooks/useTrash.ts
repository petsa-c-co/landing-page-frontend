import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/api/petrogasApi"
import { createTrashActions } from "@/api/trash.actions"

interface UseTrashOptions {
  // Identifica el recurso dentro de la queryKey: ["admin", resourceKey, "trash"].
  resourceKey: string
  basePath: string
  // Listados que hay que refrescar al restaurar/eliminar, porque el item entra
  // o sale de ellos (el admin y, si aplica, el público).
  invalidateKeys: readonly unknown[][]
}

// Papelera de un recurso del catálogo: la lista de borrados y las dos acciones.
// Ni restore ni permanent devuelven la entidad, así que siempre se refrescan
// los listados involucrados.
export const useTrash = <T>({
  resourceKey,
  basePath,
  invalidateKeys,
}: UseTrashOptions) => {
  const queryClient = useQueryClient()
  const actions = useMemo(() => createTrashActions<T>(basePath), [basePath])
  const trashKey = ["admin", resourceKey, "trash"]

  const query = useQuery({ queryKey: trashKey, queryFn: actions.getTrash })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: trashKey })
    for (const key of invalidateKeys) {
      void queryClient.invalidateQueries({ queryKey: key })
    }
  }

  const { mutateAsync: restore } = useMutation({
    mutationFn: actions.restore,
    onSuccess: () => {
      toast.success("Se restauró desde la papelera")
      invalidate()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos restaurarlo")),
  })

  const { mutateAsync: permanent } = useMutation({
    mutationFn: actions.permanent,
    onSuccess: () => {
      toast.success("Se eliminó definitivamente")
      invalidate()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos eliminarlo")),
  })

  return {
    items: query.data,
    isPending: query.isPending,
    isError: query.isError,
    refetch: () => void query.refetch(),
    count: query.data?.length ?? 0,
    restore,
    permanent,
    // Para que la página lo llame al mover un item a la papelera: refresca el
    // contador del tab y los listados de los que el item acaba de salir.
    invalidate,
  }
}
