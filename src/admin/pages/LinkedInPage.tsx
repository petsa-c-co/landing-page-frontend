import { useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, ExternalLink, RefreshCw, X } from "lucide-react"
import { toast } from "sonner"
import { AdminPageHeader, EmptyState } from "../components/AdminUi"
import { AdminSelect } from "../components/AdminSelect"
import { AdminTabs } from "../components/AdminTabs"
import { ListShell } from "../components/ListShell"
import { Pagination } from "../components/Pagination"
import { ConfirmDialog } from "@/components/custom/ConfirmDialog"
import { SectionError, SectionLoader } from "@/components/custom/QueryStates"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/api/petrogasApi"
import { formatDate } from "@/lib/format-date"
import { SafeImage } from "@/components/custom/SafeImage"
import {
  approveLinkedInImportAction,
  getLinkedInImportsAction,
  rejectLinkedInImportAction,
  syncLinkedInAction,
} from "@/news/actions/linkedin.actions"
import type {
  LinkedInImport,
  LinkedInImportStatus,
} from "@/news/interfaces/linkedin.interface"
import type { NewsCategory } from "@/news/interfaces/news.interface"

const STATUS_TABS: { value: LinkedInImportStatus; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobados" },
  { value: "rejected", label: "Rechazados" },
]

// El backend deriva título y extracto del texto si no se mandan. Se derivan
// también acá para prellenar el modal: así lo que el editor ve antes de
// publicar es exactamente lo que se va a publicar.
const deriveTitle = (text: string): string => {
  const firstLine = text.trim().split("\n")[0] ?? ""
  return firstLine.slice(0, 120).trim()
}

const deriveExcerpt = (text: string): string =>
  text.trim().replace(/\s+/g, " ").slice(0, 300)

const EMPTY_FORM = {
  category: "novedades" as NewsCategory,
  title: "",
  excerpt: "",
  isFeatured: false,
}

export const LinkedInPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<LinkedInImportStatus>("pending")
  const [page, setPage] = useState(1)
  // Candidato que se está aprobando (abre el modal de catalogación).
  const [approving, setApproving] = useState<LinkedInImport | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const params = { status, page }
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin", "linkedin", params],
    queryFn: () => getLinkedInImportsAction(params),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "linkedin"] })
    // Al aprobar se crea y publica una nota.
    void queryClient.invalidateQueries({ queryKey: ["admin", "news"] })
    void queryClient.invalidateQueries({ queryKey: ["news"] })
  }

  const { mutateAsync: sync, isPending: syncing } = useMutation({
    mutationFn: syncLinkedInAction,
    onSuccess: ({ fetched, created }) => {
      if (created > 0) {
        toast.success(`${created} ${created === 1 ? "nuevo" : "nuevos"}`, {
          description: `Se revisaron ${fetched} posteos de LinkedIn.`,
        })
      } else {
        toast.success("No hay posteos nuevos", {
          description: `Se revisaron ${fetched} y ya estaban todos en la cola.`,
        })
      }
      invalidate()
    },
    // Si el modo real está activo y faltan credenciales, el backend responde
    // 503 con un mensaje claro: se muestra tal cual.
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos sincronizar con LinkedIn")),
  })

  const { mutateAsync: approve, isPending: approvingNow } = useMutation({
    // Si se aprueba como destacada, el backend des-marca la anterior solo.
    mutationFn: ({ id, ...payload }: { id: string } & typeof EMPTY_FORM) =>
      approveLinkedInImportAction(id, payload),
    onSuccess: (post) => {
      toast.success("Nota publicada", { description: post.title })
      closeApprove()
      invalidate()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos aprobar el posteo")),
  })

  const { mutateAsync: reject } = useMutation({
    mutationFn: rejectLinkedInImportAction,
    onSuccess: () => {
      toast.success("Posteo descartado")
      invalidate()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos rechazar el posteo")),
  })

  const openApprove = (item: LinkedInImport) => {
    setApproving(item)
    setForm({
      category: "novedades",
      title: deriveTitle(item.text),
      excerpt: deriveExcerpt(item.text),
      isFeatured: false,
    })
  }

  const closeApprove = () => {
    setApproving(null)
    setForm(EMPTY_FORM)
  }

  return (
    <>
      <ListShell
        header={
          <AdminPageHeader
            title="Curaduría de LinkedIn"
            description="Posteos traídos de LinkedIn. Nada sale en la web hasta que lo apruebes y lo catalogues."
            action={
              <Button
                onClick={() => void sync()}
                disabled={syncing}
                size="sm"
                className="rounded-lg"
              >
                <RefreshCw className={syncing ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
                {syncing ? "Sincronizando..." : "Sincronizar"}
              </Button>
            }
          />
        }
        toolbar={
          <AdminTabs
            className="mb-6"
            value={status}
            onChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
            tabs={STATUS_TABS}
          />
        }
        pagination={
          data && data.data.length > 0 ? (
            <Pagination meta={data.meta} onChange={setPage} />
          ) : null
        }
      >
        {isPending && <SectionLoader />}
        {isError && <SectionError onRetry={() => void refetch()} />}
        {data && data.data.length === 0 && (
          <EmptyState
            message={
              status === "pending"
                ? "No hay posteos esperando revisión. Probá sincronizar."
                : "No hay posteos en este estado."
            }
          />
        )}

        {data && data.data.length > 0 && (
          <ul className="divide-y divide-gray-100 dark:divide-navy-800">
            {data.data.map((item) => (
              <li key={item.id} className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* La media viene de LinkedIn, no de nuestro storage: si el
                      posteo se borró allá, la fila sigue usable sin la foto. */}
                  <SafeImage
                    src={item.mediaUrl}
                    alt=""
                    loading="lazy"
                    className="w-full sm:w-40 h-40 sm:h-28 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-navy-950"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-navy-400 mb-1.5">
                      {item.authorName && (
                        <span className="font-medium text-navy-700 dark:text-navy-200">
                          {item.authorName}
                        </span>
                      )}
                      {item.postedAt && <span>{formatDate(item.postedAt)}</span>}
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sky-500 hover:underline"
                      >
                        Ver original
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <p className="text-navy-800 dark:text-navy-100 text-sm whitespace-pre-line line-clamp-5">
                      {item.text}
                    </p>

                    {item.status === "pending" ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          size="sm"
                          className="rounded-lg"
                          onClick={() => openApprove(item)}
                        >
                          <Check className="w-4 h-4" />
                          Aprobar
                        </Button>
                        <ConfirmDialog
                          tone="warning"
                          title="Rechazar posteo"
                          description="Se descarta: no se publica y no vuelve a aparecer en la cola de pendientes."
                          confirmLabel="Rechazar"
                          pendingLabel="Rechazando..."
                          onConfirm={async () => {
                            await reject(item.id)
                          }}
                          trigger={
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg"
                            >
                              <X className="w-4 h-4" />
                              Rechazar
                            </Button>
                          }
                        />
                      </div>
                    ) : (
                      <div className="mt-3">
                        <Badge variant={item.status === "approved" ? "sky" : "amber"}>
                          {item.status === "approved" ? "Aprobado" : "Rechazado"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ListShell>

      <Dialog
        open={approving !== null}
        onOpenChange={(open) => !open && closeApprove()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar y publicar</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (approving) void approve({ id: approving.id, ...form })
            }}
          >
            <p className="text-gray-500 dark:text-navy-300 text-sm mb-5">
              Se publica al instante en Novedades y Prensa, con el link al post
              original.
            </p>

            <div className="mb-5">
              <Label htmlFor="li-category">Categoría</Label>
              <AdminSelect
                id="li-category"
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value as NewsCategory,
                  })
                }
              >
                <option value="novedades">Novedades</option>
                <option value="prensa">Prensa</option>
              </AdminSelect>
            </div>

            <div className="mb-5">
              <Label htmlFor="li-title">Título</Label>
              <Input
                id="li-title"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                maxLength={200}
              />
            </div>

            <div className="mb-5">
              <Label htmlFor="li-excerpt">Extracto</Label>
              <Textarea
                id="li-excerpt"
                value={form.excerpt}
                onChange={(event) =>
                  setForm({ ...form, excerpt: event.target.value })
                }
                rows={3}
                maxLength={500}
                className="min-h-20"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) =>
                  setForm({ ...form, isFeatured: event.target.checked })
                }
                className="w-4 h-4 accent-sky-500"
              />
              <span className="text-navy-800 dark:text-navy-100 text-sm">
                Destacada (hero y teaser del index)
              </span>
            </label>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeApprove}
                className="rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={approvingNow || form.title.trim().length === 0}
                className="rounded-lg"
              >
                {approvingNow ? "Publicando..." : "Aprobar y publicar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
