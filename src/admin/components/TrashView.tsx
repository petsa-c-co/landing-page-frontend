import { RotateCcw, Trash2 } from "lucide-react"
import { EmptyState, IconButton, Thumb } from "./AdminUi"
import { ConfirmDialog } from "@/components/custom/ConfirmDialog"
import { SectionError, SectionLoader } from "@/components/custom/QueryStates"
import { formatDate } from "@/lib/format-date"

export interface TrashItem {
  id: string
  title: string
  subtitle?: string
  imageUrl?: string | null
  deletedAt?: string | null
  // El item estaba publicado/activo cuando se borró. `restore` no toca
  // isPublished/isActive, así que esto decide si al restaurarlo vuelve a
  // verse en el sitio público o vuelve oculto.
  wasVisible?: boolean
  // Solo novedades: la nota estaba destacada al mandarla a la papelera. Como
  // la destacada es única, si mientras tanto se destacó otra, esta vuelve sin
  // el destacado. Sirve para avisarlo antes de restaurar.
  wasFeatured?: boolean
}

interface TrashViewProps {
  items: TrashItem[] | undefined
  isPending: boolean
  isError: boolean
  onRetry: () => void
  onRestore: (id: string) => Promise<unknown>
  onPermanent: (id: string) => Promise<unknown>
  // Sustantivo del recurso en singular y minúscula: "servicio", "nota"...
  noun: string
}

const restoreDescription = (item: TrashItem, noun: string): string => {
  const parts = [`«${item.title}» vuelve a los listados del panel.`]

  if (item.wasVisible === true) {
    parts.push("Como estaba visible, va a reaparecer en el sitio público al instante.")
  } else if (item.wasVisible === false) {
    parts.push("Estaba oculto, así que vuelve oculto: no se publica solo.")
  } else {
    parts.push(`Vuelve con el mismo estado que tenía este ${noun}.`)
  }

  // Solo puede haber una nota destacada: si ya hay otra, esta no se la quita.
  if (item.wasFeatured) {
    parts.push("Estaba destacada: si mientras tanto destacaste otra, vuelve sin el destacado.")
  }

  return parts.join(" ")
}

export const TrashView = ({
  items,
  isPending,
  isError,
  onRetry,
  onRestore,
  onPermanent,
  noun,
}: TrashViewProps) => {
  if (isPending) return <SectionLoader />
  if (isError) return <SectionError onRetry={onRetry} />
  if (!items || items.length === 0) {
    return <EmptyState message="La papelera está vacía." />
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-navy-800">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 p-4">
          {/* undefined = el recurso no maneja imagen (puestos, títulos): no va
              ni miniatura ni marcador. null = la maneja pero está vacía. */}
          {item.imageUrl !== undefined && <Thumb src={item.imageUrl} />}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-navy-800 dark:text-navy-100 truncate">
              {item.title}
            </p>
            {item.subtitle && (
              <p className="text-gray-500 dark:text-navy-400 text-xs truncate">
                {item.subtitle}
              </p>
            )}
            {item.deletedAt && (
              <p className="text-gray-400 dark:text-navy-500 text-[11px] mt-0.5">
                En la papelera desde el {formatDate(item.deletedAt)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <ConfirmDialog
              tone="warning"
              title={`Restaurar ${noun}`}
              description={restoreDescription(item, noun)}
              confirmLabel="Restaurar"
              pendingLabel="Restaurando..."
              onConfirm={async () => {
                await onRestore(item.id)
              }}
              trigger={
                <IconButton aria-label="Restaurar" title="Restaurar">
                  <RotateCcw className="w-4 h-4" />
                </IconButton>
              }
            />
            <ConfirmDialog
              title="Eliminar definitivamente"
              description={`Se elimina «${item.title}» para siempre, junto con sus archivos del storage. Esta acción no se puede deshacer.`}
              confirmLabel="Eliminar definitivamente"
              pendingLabel="Eliminando..."
              onConfirm={async () => {
                await onPermanent(item.id)
              }}
              trigger={
                <IconButton
                  className="hover:text-red-600"
                  aria-label="Eliminar definitivamente"
                  title="Eliminar definitivamente"
                >
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              }
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
