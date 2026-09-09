import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AdminPageHeader,
  AdminTable,
  EmptyState,
  IconButton,
  Td,
  Th,
} from "../components/AdminUi"
import { AdminSelect } from "../components/AdminSelect"
import { AdminTabs } from "../components/AdminTabs"
import { ListShell } from "../components/ListShell"
import { Pagination } from "../components/Pagination"
import { TrashView } from "../components/TrashView"
import { UniqueConflictAlert } from "../components/UniqueConflictAlert"
import { useTrash } from "../hooks/useTrash"
import { useUniqueConflict } from "../hooks/useUniqueConflict"
import { ConfirmDialog } from "@/components/custom/ConfirmDialog"
import { SectionError, SectionLoader } from "@/components/custom/QueryStates"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/api/petrogasApi"
import { TRASH_BASE_PATHS } from "@/api/trash.actions"
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue"
import {
  createDegreeTitleAction,
  deleteDegreeTitleAction,
  getDegreeTitlesAdminAction,
  updateDegreeTitleAction,
} from "@/recruitment/actions/catalog.actions"
import {
  DEGREE_TITLE_LEVELS,
  DEGREE_TITLE_LEVEL_LABELS,
  type DegreeTitle,
  type DegreeTitleLevel,
} from "@/recruitment/interfaces/recruitment.interface"

const INVALIDATE_KEYS: unknown[][] = [
  ["admin", "degree-titles"],
  ["recruitment", "degree-titles"],
]

// El nivel es obligatorio al crear: se arranca en el más frecuente del rubro.
const DEFAULT_LEVEL: DegreeTitleLevel = "secundario_tecnico"

export const TitulosPage = () => {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<"list" | "trash">("list")
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<DegreeTitleLevel | "">("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DegreeTitle | null>(null)
  const [name, setName] = useState("")
  const [level, setLevel] = useState<DegreeTitleLevel>(DEFAULT_LEVEL)

  const conflict = useUniqueConflict()
  const debouncedSearch = useDebouncedValue(search)
  const params = {
    page,
    search: debouncedSearch.trim() || undefined,
    level: levelFilter || undefined,
  }

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin", "degree-titles", params],
    queryFn: () => getDegreeTitlesAdminAction(params),
  })

  const trash = useTrash<DegreeTitle>({
    resourceKey: "degree-titles",
    basePath: TRASH_BASE_PATHS.degreeTitles,
    invalidateKeys: INVALIDATE_KEYS,
  })

  const invalidate = () => {
    for (const key of INVALIDATE_KEYS) {
      void queryClient.invalidateQueries({ queryKey: key })
    }
  }

  const { mutateAsync: save, isPending: saving } = useMutation({
    mutationFn: () =>
      editing
        ? updateDegreeTitleAction(editing.id, { name: name.trim(), level })
        : createDegreeTitleAction({ name: name.trim(), level }),
    onSuccess: () => {
      toast.success(editing ? "Título actualizado" : "Título creado")
      setDialogOpen(false)
      invalidate()
    },
    onError: (error) => {
      if (conflict.capture(error, "Ese título ya está en el catálogo")) return
      toast.error(getApiErrorMessage(error, "No pudimos guardar el título"))
    },
  })

  const { mutateAsync: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateDegreeTitleAction(id, { isActive }),
    onSuccess: invalidate,
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos actualizar el título")),
  })

  const { mutateAsync: remove } = useMutation({
    mutationFn: deleteDegreeTitleAction,
    onSuccess: () => {
      toast.success("Título movido a la papelera")
      trash.invalidate()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos eliminar el título")),
  })

  const openDialog = (title: DegreeTitle | null) => {
    setEditing(title)
    setName(title?.name ?? "")
    setLevel(title?.level ?? DEFAULT_LEVEL)
    conflict.clear()
    setDialogOpen(true)
  }

  return (
    <>
      <ListShell
        header={
          <AdminPageHeader
            title="Títulos"
            description="Catálogo del autocompletado del formulario. Cuando alguien escribe un título a mano, podés darlo de alta acá."
            action={
              <Button
                onClick={() => openDialog(null)}
                size="sm"
                className="rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Nuevo título
              </Button>
            }
          />
        }
        toolbar={
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <AdminTabs
              value={tab}
              onChange={setTab}
              tabs={[
                { value: "list", label: "Listado" },
                { value: "trash", label: "Papelera", count: trash.count },
              ]}
            />
            {tab === "list" && (
              <>
                <div className="relative flex-1 min-w-[14rem]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPage(1)
                    }}
                    placeholder="Buscar título"
                    className="pl-9"
                  />
                </div>
                <AdminSelect
                  value={levelFilter}
                  onChange={(event) => {
                    setLevelFilter(event.target.value as DegreeTitleLevel | "")
                    setPage(1)
                  }}
                  className="w-auto min-w-[12rem]"
                  aria-label="Filtrar por nivel"
                >
                  <option value="">Todos los niveles</option>
                  {DEGREE_TITLE_LEVELS.map((value) => (
                    <option key={value} value={value}>
                      {DEGREE_TITLE_LEVEL_LABELS[value]}
                    </option>
                  ))}
                </AdminSelect>
              </>
            )}
          </div>
        }
        pagination={
          tab === "list" && data && data.data.length > 0 ? (
            <Pagination meta={data.meta} onChange={setPage} />
          ) : null
        }
      >
        {tab === "trash" ? (
          <TrashView
            noun="título"
            items={trash.items?.map((title) => ({
              id: title.id,
              title: title.name,
              subtitle: DEGREE_TITLE_LEVEL_LABELS[title.level],
              deletedAt: title.deletedAt,
              wasVisible: title.isActive,
            }))}
            isPending={trash.isPending}
            isError={trash.isError}
            onRetry={trash.refetch}
            onRestore={trash.restore}
            onPermanent={trash.permanent}
          />
        ) : (
          <>
            {isPending && <SectionLoader />}
            {isError && <SectionError onRetry={() => void refetch()} />}
            {data && data.data.length === 0 && (
              <EmptyState
                message={
                  debouncedSearch || levelFilter
                    ? "Ningún título coincide con el filtro."
                    : "Todavía no hay títulos cargados."
                }
              />
            )}

            {data && data.data.length > 0 && (
              <AdminTable>
                <thead className="sticky top-0 bg-white dark:bg-navy-900 z-10">
                  <tr className="border-b border-gray-100 dark:border-navy-800">
                    <Th>Título</Th>
                    <Th>Nivel</Th>
                    <Th>En el formulario</Th>
                    <Th className="text-right">Acciones</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                  {data.data.map((title) => (
                    <tr key={title.id}>
                      <Td className="font-medium">{title.name}</Td>
                      <Td className="text-gray-500 dark:text-navy-400 text-xs">
                        {DEGREE_TITLE_LEVEL_LABELS[title.level]}
                      </Td>
                      <Td>
                        <button
                          type="button"
                          onClick={() =>
                            void toggleActive({
                              id: title.id,
                              isActive: !title.isActive,
                            })
                          }
                          className={
                            title.isActive
                              ? "rounded-full bg-green-50 text-green-700 text-[11px] px-2 py-0.5"
                              : "rounded-full bg-gray-100 text-gray-500 text-[11px] px-2 py-0.5"
                          }
                        >
                          {title.isActive ? "Visible" : "Oculto"}
                        </button>
                      </Td>
                      <Td>
                        <div className="flex items-center justify-end gap-0.5">
                          <IconButton
                            onClick={() => openDialog(title)}
                            aria-label="Editar"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </IconButton>
                          <ConfirmDialog
                            tone="warning"
                            title="Mover a papelera"
                            description={`«${title.name}» deja de aparecer en el autocompletado. Las postulaciones que ya lo eligieron lo siguen mostrando, y podés restaurarlo cuando quieras.`}
                            confirmLabel="Mover a papelera"
                            pendingLabel="Moviendo..."
                            onConfirm={() => remove(title.id)}
                            trigger={
                              <IconButton
                                className="hover:text-red-600"
                                aria-label="Mover a papelera"
                                title="Mover a papelera"
                              >
                                <Trash2 className="w-4 h-4" />
                              </IconButton>
                            }
                          />
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            )}
          </>
        )}
      </ListShell>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !open && setDialogOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar título" : "Nuevo título"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void save()
            }}
          >
            {conflict.captured && (
              <UniqueConflictAlert
                conflict={conflict.captured.conflict}
                message={conflict.captured.message}
                basePath={TRASH_BASE_PATHS.degreeTitles}
                onResolved={() => {
                  conflict.clear()
                  trash.invalidate()
                }}
              />
            )}
            <div className="mb-5">
              <Label htmlFor="degree-title-name">Nombre</Label>
              <Input
                id="degree-title-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej: Técnico en Seguridad e Higiene"
                maxLength={150}
              />
            </div>
            <div className="mb-5">
              <Label htmlFor="degree-title-level">Nivel</Label>
              <AdminSelect
                id="degree-title-level"
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value as DegreeTitleLevel)
                }
              >
                {DEGREE_TITLE_LEVELS.map((value) => (
                  <option key={value} value={value}>
                    {DEGREE_TITLE_LEVEL_LABELS[value]}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || name.trim().length === 0}
                className="rounded-lg"
              >
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
