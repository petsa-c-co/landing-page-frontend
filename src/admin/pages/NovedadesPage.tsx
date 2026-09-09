import { useState } from "react"
import { Link } from "react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Linkedin, Pencil, Plus, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AdminPageHeader,
  AdminTable,
  EmptyState,
  IconButton,
  Td,
  Th,
  Thumb,
} from "../components/AdminUi"
import { AdminTabs } from "../components/AdminTabs"
import { TrashView } from "../components/TrashView"
import { useTrash } from "../hooks/useTrash"
import { ListShell } from "../components/ListShell"
import { Pagination } from "../components/Pagination"
import { ConfirmDialog } from "@/components/custom/ConfirmDialog"
import { SectionError, SectionLoader } from "@/components/custom/QueryStates"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/api/petrogasApi"
import { TRASH_BASE_PATHS } from "@/api/trash.actions"
import { formatDate } from "@/lib/format-date"
import {
  deleteNewsAction,
  getNewsAdminAction,
  updateNewsAction,
} from "@/news/actions/admin.actions"
import type { NewsPost } from "@/news/interfaces/news.interface"

/**
 * Las cuatro vistas del listado. Antes eran dos controles apilados —una fila
 * de Listado/Papelera y otra de Todas/Publicadas/Borradores— pero son
 * mutuamente excluyentes: el filtro de estado ni siquiera se dibujaba estando
 * en la papelera. Unificarlos deja una sola fila y un único "dónde estoy
 * parado", como Recibidos/Borradores/Papelera en un cliente de correo.
 */
type Vista = "all" | "published" | "draft" | "trash"

const VISTAS: { value: Vista; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "published", label: "Publicadas" },
  { value: "draft", label: "Borradores" },
]

export const NovedadesPage = () => {
  const [page, setPage] = useState(1)
  const [vista, setVista] = useState<Vista>("all")
  const enPapelera = vista === "trash"

  const trash = useTrash<NewsPost>({
    resourceKey: "news",
    basePath: TRASH_BASE_PATHS.news,
    invalidateKeys: [["admin", "news"], ["news"]],
  })

  const params = {
    page,
    // En la papelera el estado no filtra nada: ese listado lo trae useTrash.
    published:
      vista === "all" || enPapelera ? undefined : vista === "published",
  }

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin", "news", params],
    queryFn: () => getNewsAdminAction(params),
  })

  // Solo una nota puede estar destacada. La unicidad la garantiza el backend
  // de forma atómica: marcar una des-marca la anterior sola.
  const { mutateAsync: setFeatured } = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      updateNewsAction(id, { isFeatured: featured }),
    onSuccess: (_data, { featured }) => {
      toast.success(
        featured
          ? "Ahora encabeza Novedades y Prensa"
          : "Ya no hay nota destacada",
      )
      trash.invalidate()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos cambiar la destacada")),
  })

  const { mutateAsync: remove } = useMutation({
    mutationFn: deleteNewsAction,
    onSuccess: () => {
      toast.success("Nota movida a la papelera")
      trash.invalidate()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos eliminar la nota")),
  })

  return (
    <>
      <ListShell
        header={
          <AdminPageHeader
            title="Novedades y Prensa"
            description="Notas del sitio. Los borradores no se ven en la landing."
            action={
              <Button asChild size="sm" className="rounded-lg">
                <Link to="/admin/novedades/nueva">
                  <Plus className="w-4 h-4" />
                  Nueva nota
                </Link>
              </Button>
            }
          />
        }
        toolbar={
          <AdminTabs
            className="mb-6"
            value={vista}
            onChange={(valor) => {
              setVista(valor)
              setPage(1)
            }}
            tabs={[
              ...VISTAS,
              { value: "trash" as const, label: "Papelera", count: trash.count },
            ]}
          />
        }
        pagination={
          !enPapelera && data && data.data.length > 0 ? (
            <Pagination meta={data.meta} onChange={setPage} />
          ) : null
        }
      >
        {enPapelera && (
          <TrashView
            noun="nota"
            items={trash.items?.map((post) => ({
              id: post.id,
              title: post.title,
              subtitle: `/${post.slug}`,
              imageUrl: post.coverImage,
              deletedAt: post.deletedAt,
              wasVisible: post.isPublished,
              wasFeatured: post.isFeatured,
            }))}
            isPending={trash.isPending}
            isError={trash.isError}
            onRetry={trash.refetch}
            onRestore={trash.restore}
            onPermanent={trash.permanent}
          />
        )}
        {!enPapelera && (
          <>
        {isPending && <SectionLoader />}
        {isError && <SectionError onRetry={() => void refetch()} />}
        {data && data.data.length === 0 && (
          <EmptyState message="Todavía no hay notas cargadas." />
        )}

        {data && data.data.length > 0 && (
          <AdminTable>
              <thead className="bg-gray-50 dark:bg-navy-800/60 border-b border-gray-100 dark:border-navy-800">
                <tr>
                  <Th>Nota</Th>
                  <Th>Categoría</Th>
                  <Th>Estado</Th>
                  <Th>Fecha</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                {data.data.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-navy-800/40">
                    <Td className="max-w-[320px]">
                      <div className="flex items-center gap-3">
                        <Thumb src={post.coverImage} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{post.title}</p>
                          <p className="text-gray-400 text-xs truncate">
                            /{post.slug}
                          </p>
                          {post.source === "linkedin" && (
                            <a
                              href={post.externalUrl ?? undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-1 text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                            >
                              <Linkedin className="w-3 h-3" />
                              Desde LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge variant={post.category === "prensa" ? "amber" : "sky"}>
                        {post.category === "prensa" ? "Prensa" : "Novedades"}
                      </Badge>
                    </Td>
                    <Td>
                      <span
                        className={
                          post.isPublished
                            ? "rounded-full bg-green-50 text-green-700 text-xs px-2.5 py-1"
                            : "rounded-full bg-gray-100 text-gray-500 text-xs px-2.5 py-1"
                        }
                      >
                        {post.isPublished ? "Publicada" : "Borrador"}
                      </span>
                    </Td>
                    <Td className="text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(post.publishedAt) || "—"}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          onClick={() =>
                            void setFeatured({
                              id: post.id,
                              featured: !post.isFeatured,
                            })
                          }
                          aria-label={
                            post.isFeatured
                              ? "Quitar de destacada"
                              : "Marcar como destacada"
                          }
                          title={
                            post.isFeatured
                              ? "Destacada — encabeza Novedades y Prensa"
                              : "Marcar como destacada (reemplaza la actual)"
                          }
                          className={
                            post.isFeatured
                              ? "text-amber-500 hover:text-amber-600"
                              : undefined
                          }
                        >
                          <Star
                            className={
                              post.isFeatured
                                ? "w-4 h-4 fill-amber-500"
                                : "w-4 h-4"
                            }
                          />
                        </IconButton>
                        <Link to={`/admin/novedades/${post.id}`}>
                          <IconButton aria-label="Editar">
                            <Pencil className="w-4 h-4" />
                          </IconButton>
                        </Link>
                        <ConfirmDialog
                          tone="warning"
                          title="Mover a papelera"
                          description={`«${post.title}» sale del sitio y del listado. Queda en la papelera y podés restaurarla cuando quieras.`}
                          confirmLabel="Mover a papelera"
                          pendingLabel="Moviendo..."
                          onConfirm={() => remove(post.id)}
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
    </>
  )
}
