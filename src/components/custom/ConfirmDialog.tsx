import { useState, type ReactNode } from "react"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

// "danger" para acciones destructivas (borrar); "warning" para acciones
// reversibles pero que conviene confirmar (ocultar del sitio).
type ConfirmTone = "danger" | "warning"

const TONE_STYLES: Record<ConfirmTone, { iconBg: string; icon: string; button: string }> = {
  danger: {
    iconBg: "bg-red-50 dark:bg-red-500/15",
    icon: "text-red-600 dark:text-red-400",
    button: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    iconBg: "bg-amber-50 dark:bg-amber-500/15",
    icon: "text-amber-600 dark:text-amber-400",
    button: "bg-amber-600 hover:bg-amber-700",
  },
}

interface ConfirmDialogProps {
  trigger: ReactNode
  title: string
  description: string
  confirmLabel?: string
  // Texto mientras la acción está en curso ("Eliminando...", "Ocultando...").
  pendingLabel?: string
  tone?: ConfirmTone
  onConfirm: () => void | Promise<void>
}

// Confirmación para acciones destructivas (borrar contenido, mensajes).
// Bloquea el botón mientras la acción está en curso.
export const ConfirmDialog = ({
  trigger,
  title,
  description,
  confirmLabel = "Eliminar",
  pendingLabel = "Eliminando...",
  tone = "danger",
  onConfirm,
}: ConfirmDialogProps) => {
  const toneStyles = TONE_STYLES[tone]
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const handleConfirm = async () => {
    setPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch {
      // La acción ya avisa del error (toast con el mensaje del backend). El
      // modal queda abierto a propósito, para reintentar o cancelar: cerrarlo
      // daría a entender que salió bien.
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-navy-900 dark:ring-1 dark:ring-navy-800 p-6 shadow-xl">
          <div className="flex gap-4">
            <div
              className={cn(
                "w-11 h-11 shrink-0 rounded-full flex items-center justify-center",
                toneStyles.iconBg,
              )}
            >
              <AlertTriangle className={cn("w-5 h-5", toneStyles.icon)} />
            </div>
            <div>
              <AlertDialog.Title className="font-heading uppercase font-semibold text-navy-800 dark:text-white text-lg">
                {title}
              </AlertDialog.Title>
              <AlertDialog.Description className="text-gray-500 dark:text-navy-300 text-sm mt-1">
                {description}
              </AlertDialog.Description>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg text-sm font-heading uppercase tracking-wide border border-gray-300 dark:border-navy-700 text-navy-700 dark:text-navy-200 hover:bg-gray-50 dark:hover:bg-navy-800 transition"
              >
                Cancelar
              </button>
            </AlertDialog.Cancel>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={pending}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-heading uppercase tracking-wide text-white transition",
                toneStyles.button,
                pending && "opacity-60",
              )}
            >
              {pending ? pendingLabel : confirmLabel}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
