import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AdminCard,
  AdminPageHeader,
  AdminTable,
  EmptyState,
  IconButton,
  Td,
  Th,
  Thumb,
} from "../components/AdminUi";
import { AdminTabs } from "../components/AdminTabs";
import { imagenDeTarjeta } from "@/services/constants/default-images";
import { TrashView } from "../components/TrashView";
import { useTrash } from "../hooks/useTrash";
import { ConfirmDialog } from "@/components/custom/ConfirmDialog";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/api/petrogasApi";
import { TRASH_BASE_PATHS } from "@/api/trash.actions";
import {
  deleteServiceAction,
  getServicesAdminAction,
  updateServiceAction,
} from "@/services/actions/admin.actions";
import type { Service } from "@/services/interfaces/service.interface";

const LAYOUT_LABELS: Record<string, string> = {
  bullets: "Lista simple",
  icons: "Con íconos",
  numbered: "Numerado",
};

export const ServiciosPage = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"list" | "trash">("list");

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: getServicesAdminAction,
  });

  const trash = useTrash<Service>({
    resourceKey: "services",
    basePath: TRASH_BASE_PATHS.services,
    invalidateKeys: [["admin", "services"], ["services"]],
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: deleteServiceAction,
    onSuccess: () => {
      toast.success("Servicio movido a la papelera");
      void queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      void queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos eliminar el servicio")),
  });

  // Alternar visibilidad desde la tabla, sin entrar a editar.
  const { mutateAsync: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateServiceAction(id, { isActive }),
    onSuccess: (_data, { isActive }) => {
      toast.success(
        isActive ? "Servicio visible en el sitio" : "Servicio oculto",
      );
      void queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      void queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "No pudimos actualizar el servicio"),
      ),
  });

  return (
    <>
      <AdminPageHeader
        title="Servicios"
        description="Cada servicio tiene su página propia en el sitio."
        action={
          <Button asChild size="sm" className="rounded-lg">
            <Link to="/admin/servicios/nuevo">
              <Plus className="w-4 h-4" />
              Nuevo servicio
            </Link>
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
            noun="servicio"
            items={trash.items?.map((service) => ({
              id: service.id,
              title: service.title,
              subtitle: `/servicios/${service.slug}`,
              imageUrl: service.cardImage,
              deletedAt: service.deletedAt,
              wasVisible: service.isActive,
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
              <EmptyState message="Todavía no hay servicios cargados." />
            )}

            {data && data.length > 0 && (
              <AdminTable>
                <thead className="bg-gray-50 dark:bg-navy-800/60 border-b border-gray-100 dark:border-navy-800">
                  <tr>
                    <Th>Servicio</Th>
                    <Th>Diseño</Th>
                    <Th>Items</Th>
                    <Th>Estado</Th>
                    <Th className="text-right">Acciones</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                  {data.map((service) => (
                    <tr
                      key={service.id}
                      className="hover:bg-gray-50 dark:hover:bg-navy-800/40"
                    >
                      <Td className="max-w-[320px]">
                        <div className="flex items-center gap-3">
                          {/* Con el respaldo del frontend, no con cardImage a
                          secas: así la miniatura muestra lo mismo que el sitio
                          público, y no un hueco donde en realidad hay foto. */}
                          <Thumb src={imagenDeTarjeta(service)} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {service.title}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                              /servicios/{service.slug}
                            </p>
                          </div>
                        </div>
                      </Td>
                      <Td className="text-gray-500 text-xs">
                        {LAYOUT_LABELS[service.itemsLayout]}
                      </Td>
                      <Td className="text-gray-500 text-xs">
                        {service.items.length}
                      </Td>
                      <Td>
                        <span
                          className={
                            service.isActive
                              ? "rounded-full bg-green-50 text-green-700 text-xs px-2.5 py-1"
                              : "rounded-full bg-gray-100 text-gray-500 text-xs px-2.5 py-1"
                          }
                        >
                          {service.isActive ? "Visible" : "Oculto"}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex items-center justify-end gap-1">
                          {service.isActive ? (
                            <ConfirmDialog
                              tone="warning"
                              title="Ocultar servicio"
                              description={`"${service.title}" dejará de mostrarse en el sitio público. Vas a poder volver a activarlo cuando quieras.`}
                              confirmLabel="Ocultar"
                              pendingLabel="Ocultando..."
                              onConfirm={async () => {
                                await toggleActive({
                                  id: service.id,
                                  isActive: false,
                                });
                              }}
                              trigger={
                                <IconButton
                                  aria-label="Ocultar del sitio"
                                  title="Visible — clic para ocultar"
                                >
                                  <Eye className="w-4 h-4" />
                                </IconButton>
                              }
                            />
                          ) : (
                            <IconButton
                              aria-label="Mostrar en el sitio"
                              title="Oculto — clic para mostrar"
                              onClick={() =>
                                void toggleActive({
                                  id: service.id,
                                  isActive: true,
                                })
                              }
                            >
                              <EyeOff className="w-4 h-4" />
                            </IconButton>
                          )}
                          <Link to={`/admin/servicios/${service.id}`}>
                            <IconButton aria-label="Editar">
                              <Pencil className="w-4 h-4" />
                            </IconButton>
                          </Link>
                          <ConfirmDialog
                            tone="warning"
                            title="Mover a papelera"
                            description={`«${service.title}» sale del sitio y del listado. Queda en la papelera y podés restaurarlo cuando quieras.`}
                            confirmLabel="Mover a papelera"
                            pendingLabel="Moviendo..."
                            onConfirm={() => remove(service.id)}
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
    </>
  );
};
