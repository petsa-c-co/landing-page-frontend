import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AdminCard,
  AdminPageHeader,
  AdminTable,
  EmptyState,
  IconButton,
  Td,
  Th,
} from "../components/AdminUi"
import { AdminTabs } from "../components/AdminTabs"
import { TrashView } from "../components/TrashView"
import { useTrash } from "../hooks/useTrash"
import { PdfUploader } from "../components/PdfUploader"
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
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/api/petrogasApi"
import { TRASH_BASE_PATHS } from "@/api/trash.actions"
import { getCertificationsAction } from "@/certifications/actions/get-certifications"
import {
  createCertificationAction,
  deleteCertificationAction,
  updateCertificationAction,
} from "@/certifications/actions/admin.actions"
import type { Certification } from "@/certifications/interfaces/certification.interface"

const EMPTY = { title: "", subtitle: "", description: "", isFeatured: false }

export const CertificacionesAdminPage = () => {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Certification | null>(null)
  const [form, setForm] = useState(EMPTY)
  // undefined = no se tocó el PDF; string = key nueva; null = se quitó.
  const [pdfKey, setPdfKey] = useState<string | null | undefined>(undefined)

  const [tab, setTab] = useState<"list" | "trash">("list")

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["certifications"],
    queryFn: getCertificationsAction,
  })

  const trash = useTrash<Certification>({
    resourceKey: "certifications",
    basePath: TRASH_BASE_PATHS.certifications,
    invalidateKeys: [["certifications"]],
  })

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["certifications"] })

  const { mutateAsync: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      // Solo se manda certificatePdf si se tocó: key nueva, o null para quitarlo.
      const payload = {
        ...form,
        ...(pdfKey !== undefined ? { certificatePdf: pdfKey } : {}),
      }
      if (editing) return updateCertificationAction(editing.id, payload)
      return createCertificationAction(payload)
    },
    onSuccess: () => {
      toast.success(editing ? "Certificación actualizada" : "Certificación creada")
      closeDialog()
      invalidate()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos guardar la certificación")),
  })

  const { mutateAsync: remove } = useMutation({
    mutationFn: deleteCertificationAction,
    onSuccess: () => {
      toast.success("Certificación movida a la papelera")
      trash.invalidate()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos mover la certificación")),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setPdfKey(undefined)
    setDialogOpen(true)
  }

  const openEdit = (cert: Certification) => {
    setEditing(cert)
    setForm({
      title: cert.title,
      subtitle: cert.subtitle,
      description: cert.description,
      isFeatured: cert.isFeatured,
    })
    setPdfKey(undefined)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditing(null)
    setForm(EMPTY)
    setPdfKey(undefined)
  }

  return (
    <>
      <AdminPageHeader
        title="Certificaciones"
        description="Normas ISO de la página de Certificaciones. La destacada va en la banda aparte."
        action={
          <Button onClick={openCreate} size="sm" className="rounded-lg">
            <Plus className="w-4 h-4" />
            Nueva certificación
          </Button>
        }
      />

      <AdminTabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "list", label: "Listado" },
          { value: "trash", label: "Papelera", count: trash.count },
        ]}
      />

      <AdminCard>
        {tab === "trash" ? (
          <TrashView
            noun="certificación"
            items={trash.items?.map((cert) => ({
              id: cert.id,
              title: cert.title,
              subtitle: cert.subtitle,
              imageUrl: cert.logoImage,
              deletedAt: cert.deletedAt,
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
        {data?.length === 0 && (
          <EmptyState message="Todavía no hay certificaciones cargadas." />
        )}

        {data && data.length > 0 && (
          <AdminTable>
            <thead className="bg-gray-50 dark:bg-navy-800/60 border-b border-gray-100 dark:border-navy-800">
              <tr>
                <Th>Norma</Th>
                <Th>Categoría</Th>
                <Th>Descripción</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
              {data.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50 dark:hover:bg-navy-800/40">
                  <Td className="font-medium whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      {cert.isFeatured && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      )}
                      {cert.title}
                    </span>
                  </Td>
                  <Td className="text-gray-500 text-xs">{cert.subtitle}</Td>
                  <Td className="text-gray-500 text-xs max-w-[380px]">
                    <p className="line-clamp-2">{cert.description}</p>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <IconButton onClick={() => openEdit(cert)} aria-label="Editar">
                        <Pencil className="w-4 h-4" />
                      </IconButton>
                      <ConfirmDialog
                        tone="warning"
                        title="Mover a papelera"
                        description={`«${cert.title}» sale del sitio y del listado. Queda en la papelera y podés restaurarla cuando quieras.`}
                        confirmLabel="Mover a papelera"
                        pendingLabel="Moviendo..."
                        onConfirm={() => remove(cert.id)}
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
      </AdminCard>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar certificación" : "Nueva certificación"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void save()
            }}
          >
            <div className="mb-4">
              <Label htmlFor="cert-title">Norma</Label>
              <Input
                id="cert-title"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="Ej: ISO 9001:2015"
                maxLength={120}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="cert-subtitle">Categoría</Label>
              <Input
                id="cert-subtitle"
                value={form.subtitle}
                onChange={(event) =>
                  setForm({ ...form, subtitle: event.target.value })
                }
                placeholder="Ej: Calidad"
                maxLength={120}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="cert-description">Descripción</Label>
              <Textarea
                id="cert-description"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                rows={4}
                className="min-h-24"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) =>
                  setForm({ ...form, isFeatured: event.target.checked })
                }
                className="w-4 h-4 accent-sky-500"
              />
              <span className="text-navy-800 dark:text-navy-100 text-sm">
                Destacada (banda aparte al pie de la página)
              </span>
            </label>
            <PdfUploader
              label="Certificado (PDF, opcional)"
              previewUrl={editing?.certificatePdf}
              onUploaded={setPdfKey}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                className="rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  saving ||
                  !form.title.trim() ||
                  !form.subtitle.trim() ||
                  !form.description.trim()
                }
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
