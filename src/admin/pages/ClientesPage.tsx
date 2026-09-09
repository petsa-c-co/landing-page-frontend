import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  IconButton,
} from "../components/AdminUi"
import { AdminTabs } from "../components/AdminTabs"
import { TrashView } from "../components/TrashView"
import { useTrash } from "../hooks/useTrash"
import { ImageCropUploader } from "../components/ImageCropUploader"
import { SafeImage } from "@/components/custom/SafeImage"
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
import {
  createClientAction,
  deleteClientAction,
  getClientsAdminAction,
  updateClientAction,
} from "@/clients/actions/admin.actions"
import type { Client } from "@/clients/interfaces/client.interface"

export const ClientesPage = () => {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [name, setName] = useState("")
  const [logoKey, setLogoKey] = useState<string | null>(null)

  const [tab, setTab] = useState<"list" | "trash">("list")

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: getClientsAdminAction,
  })

  const trash = useTrash<Client>({
    resourceKey: "clients",
    basePath: TRASH_BASE_PATHS.clients,
    invalidateKeys: [["admin", "clients"], ["clients"]],
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "clients"] })
    void queryClient.invalidateQueries({ queryKey: ["clients"] })
  }

  const { mutateAsync: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      if (editing) {
        return updateClientAction(editing.id, {
          name,
          ...(logoKey ? { logoImage: logoKey } : {}),
        })
      }
      if (!logoKey) throw new Error("Subí el logo del cliente")
      return createClientAction({ name, logoImage: logoKey })
    },
    onSuccess: () => {
      toast.success(editing ? "Cliente actualizado" : "Cliente creado")
      closeDialog()
      invalidate()
    },
    onError: (error) =>
      toast.error(
        error instanceof Error && !("response" in error)
          ? error.message
          : getApiErrorMessage(error, "No pudimos guardar el cliente"),
      ),
  })

  const { mutateAsync: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateClientAction(id, { isActive }),
    onSuccess: () => {
      toast.success("Cliente actualizado")
      invalidate()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos actualizar el cliente")),
  })

  const { mutateAsync: remove } = useMutation({
    mutationFn: deleteClientAction,
    onSuccess: () => {
      toast.success("Cliente movido a la papelera")
      trash.invalidate()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos eliminar el cliente")),
  })

  const openCreate = () => {
    setEditing(null)
    setName("")
    setLogoKey(null)
    setDialogOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditing(client)
    setName(client.name)
    setLogoKey(null)
    setDialogOpen(true)
  }

  // Solo se cierra: limpiar `editing`/`name` acá vaciaría el diálogo a la vista
  // mientras se desvanece. El contenido se resetea al abrirlo (openCreate y
  // openEdit dejan los tres campos en su valor inicial).
  const closeDialog = () => setDialogOpen(false)

  return (
    <>
      <AdminPageHeader
        title="Clientes"
        description="Logos de la sección “Algunos de nuestros clientes” del index."
        action={
          <Button onClick={openCreate} size="sm" className="rounded-lg">
            <Plus className="w-4 h-4" />
            Nuevo cliente
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

      {tab === "trash" ? (
        <AdminCard>
          <TrashView
            noun="cliente"
            items={trash.items?.map((client) => ({
              id: client.id,
              title: client.name,
              imageUrl: client.logoImage,
              deletedAt: client.deletedAt,
              wasVisible: client.isActive,
            }))}
            isPending={trash.isPending}
            isError={trash.isError}
            onRetry={trash.refetch}
            onRestore={trash.restore}
            onPermanent={trash.permanent}
          />
        </AdminCard>
      ) : (
        <>
      {isPending && <SectionLoader />}
      {isError && <SectionError onRetry={() => void refetch()} />}
      {data?.length === 0 && (
        <AdminCard>
          <EmptyState message="Todavía no hay clientes cargados." />
        </AdminCard>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((client) => (
            <AdminCard key={client.id} className="p-4">
              <div className="h-24 flex items-center justify-center mb-3">
                <SafeImage
                  src={client.logoImage}
                  alt={client.name}
                  className="max-h-16 w-auto object-contain"
                  fallback={
                    <span
                      title="Recargá la página; si sigue igual, volvé a subir el logo."
                      className="text-amber-700 dark:text-amber-500 text-xs text-center"
                    >
                      No pudimos cargar el logo
                    </span>
                  }
                />
              </div>
              <p className="font-medium text-navy-800 dark:text-white text-sm truncate">
                {client.name}
              </p>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() =>
                    void toggleActive({
                      id: client.id,
                      isActive: !client.isActive,
                    })
                  }
                  className={
                    client.isActive
                      ? "rounded-full bg-green-50 text-green-700 text-[11px] px-2 py-0.5"
                      : "rounded-full bg-gray-100 text-gray-500 text-[11px] px-2 py-0.5"
                  }
                >
                  {client.isActive ? "Visible" : "Oculto"}
                </button>
                <div className="flex gap-0.5">
                  <IconButton onClick={() => openEdit(client)} aria-label="Editar">
                    <Pencil className="w-3.5 h-3.5" />
                  </IconButton>
                  <ConfirmDialog
                    tone="warning"
                    title="Mover a papelera"
                    description={`«${client.name}» sale del index y del listado. Queda en la papelera y podés restaurarlo cuando quieras.`}
                    confirmLabel="Mover a papelera"
                    pendingLabel="Moviendo..."
                    onConfirm={() => remove(client.id)}
                    trigger={
                      <IconButton
                        className="hover:text-red-600"
                        aria-label="Mover a papelera"
                        title="Mover a papelera"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    }
                  />
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar cliente" : "Nuevo cliente"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void save()
            }}
          >
            <div className="mb-5">
              <Label htmlFor="client-name">Nombre</Label>
              <Input
                id="client-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej: YPF"
                maxLength={120}
              />
            </div>
            <ImageCropUploader
              label="Logo"
              hint="Preferí PNG con fondo transparente · ~400 × 160 px"
              previewUrl={editing?.logoImage}
              onUploaded={setLogoKey}
              outputType="image/png"
              maxOutputWidth={600}
              allowBgRemoval
              previewBoxClassName="h-28 bg-gray-50 dark:bg-navy-950"
              previewMediaClassName="max-h-14 w-auto object-contain"
              figure="logo"
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
