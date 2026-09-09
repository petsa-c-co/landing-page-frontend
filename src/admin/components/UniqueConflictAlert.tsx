import { useState } from "react"
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/custom/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/api/petrogasApi"
import { deleteForever, restoreFromTrash } from "@/api/trash.actions"
import type { UniqueConflict } from "@/api/types"

interface UniqueConflictAlertProps {
  conflict: UniqueConflict
  // Mensaje del backend, ya redactado en español según el caso.
  message: string
  // Path base del recurso, para liberar el valor desde acá.
  basePath: string
  // Se llama cuando el bloqueante se restauró o se eliminó: el formulario
  // debería limpiar el conflicto y dejar reintentar el guardado.
  onResolved: () => void
}

// Un valor único (slug/name) ya está tomado. Si el registro que lo retiene
// está en la papelera, se ofrece resolverlo acá mismo en vez de mandar al
// usuario a buscarlo (FRONTEND.md §4.7.1).
export const UniqueConflictAlert = ({
  conflict,
  message,
  basePath,
  onResolved,
}: UniqueConflictAlertProps) => {
  const [working, setWorking] = useState(false)

  const run = async (action: () => Promise<void>, success: string) => {
    setWorking(true)
    try {
      await action()
      toast.success(success)
      onResolved()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No pudimos liberar el valor"))
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-200 dark:ring-amber-500/20 p-4 mb-5">
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="min-w-0">
          <p className="text-navy-800 dark:text-navy-100 text-sm">{message}</p>

          {conflict.inTrash && (
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={working}
                className="rounded-lg"
                onClick={() =>
                  void run(
                    () => restoreFromTrash(basePath, conflict.id),
                    "Se restauró desde la papelera",
                  )
                }
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar ese
              </Button>

              <ConfirmDialog
                title="Eliminar definitivamente"
                description={`Se elimina para siempre el registro que usa «${conflict.value}», junto con sus archivos del storage. Esta acción no se puede deshacer, y recién ahí queda libre el ${conflict.field}.`}
                confirmLabel="Eliminar definitivamente"
                pendingLabel="Eliminando..."
                onConfirm={() =>
                  run(
                    () => deleteForever(basePath, conflict.id),
                    "Se eliminó definitivamente",
                  )
                }
                trigger={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={working}
                    className="rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminarlo definitivamente
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
