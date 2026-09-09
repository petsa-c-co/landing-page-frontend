import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, EmptyState, IconButton } from "../components/AdminUi";
import { ListShell } from "../components/ListShell";
import { Pagination } from "../components/Pagination";
import { ConfirmDialog } from "@/components/custom/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { getApiErrorMessage } from "@/api/petrogasApi";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import {
  deleteContactMessageAction,
  getContactMessagesAction,
  updateContactMessageStatusAction,
} from "@/contact/actions/admin.actions";
import type {
  ContactMessage,
  ContactMessageStatus,
} from "@/contact/interfaces/contact.interface";

type Filter = "all" | ContactMessageStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "nueva", label: "Nuevos" },
  { value: "leida", label: "Leídos" },
];

/**
 * La consulta abierta para leerla entera.
 *
 * Va en un modal y no desplegándose en la fila porque expandir en el lugar
 * empuja el resto de la lista hacia abajo y se pierde el punto donde estabas.
 * Acá además entra lo que en la fila no cabe: la fecha con hora y el correo y
 * el teléfono como acciones.
 */
const MessageDialog = ({
  message,
  onClose,
}: {
  message: ContactMessage | null;
  onClose: () => void;
}) => (
  <Dialog open={message !== null} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-2xl">
      {message && (
        <>
          <DialogHeader>
            <DialogTitle>
              {message.subject || "Consulta sin asunto"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            <span className="font-medium text-navy-800 dark:text-white">
              {message.name}
            </span>
            <a
              href={`mailto:${message.email}`}
              className="text-sky-600 dark:text-sky-400 hover:underline"
            >
              {message.email}
            </a>
            {message.phone && (
              <a
                href={`tel:${message.phone}`}
                className="text-sky-600 dark:text-sky-400 hover:underline"
              >
                {message.phone}
              </a>
            )}
          </div>
          <p className="text-gray-400 dark:text-navy-400 text-xs mt-1">
            Recibida el {formatDate(message.createdAt)}
          </p>

          {/* Sin recortes y con scroll propio: una consulta larga no puede
              empujar los botones fuera de la pantalla. */}
          <p className="mt-4 max-h-[50vh] overflow-y-auto whitespace-pre-line text-gray-700 dark:text-navy-100 text-sm leading-relaxed">
            {message.message}
          </p>

          <DialogFooter>
            <Button asChild variant="outline" className="rounded-lg">
              <a href={`mailto:${message.email}`}>Responder por correo</a>
            </Button>
            <Button type="button" onClick={onClose} className="rounded-lg">
              Cerrar
            </Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  </Dialog>
);

export const MensajesPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  // La consulta que se está leyendo, o null si no hay ninguna abierta.
  const [abierto, setAbierto] = useState<ContactMessage | null>(null);

  const params = { page, status: filter === "all" ? undefined : filter };

  // Mismo criterio que el contador del menú (ver useUnreadMessages): el
  // staleTime de 5 minutos y el refetchOnWindowFocus en false que la app usa
  // por defecto son para el sitio público. Acá se está mirando una bandeja de
  // entrada, así que la lista tiene que traer lo que llegó mientras mirabas,
  // sin recargar el navegador.
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin", "contact-messages", params],
    queryFn: () => getContactMessagesAction(params),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({
      queryKey: ["admin", "contact-messages"],
    });

  const { mutateAsync: setStatus } = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ContactMessageStatus;
    }) => updateContactMessageStatusAction(id, status),
    onSuccess: invalidate,
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "No pudimos actualizar el mensaje"),
      ),
  });

  // Abrir es leer, como en cualquier cliente de correo: así el contador del
  // menú pasa a significar "lo que todavía no miré". El botón del sobre sigue
  // estando para volver a marcarla como nueva y dejarla pendiente.
  const abrirMensaje = (message: ContactMessage) => {
    setAbierto(message);
    if (message.status === "nueva") {
      void setStatus({ id: message.id, status: "leida" });
    }
  };

  const { mutateAsync: remove } = useMutation({
    mutationFn: deleteContactMessageAction,
    onSuccess: () => {
      toast.success("Mensaje eliminado");
      invalidate();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos eliminar el mensaje")),
  });

  return (
    <>
      <ListShell
        header={
          <AdminPageHeader
            title="Mensajes"
            description="Consultas recibidas desde el formulario de contacto."
          />
        }
        toolbar={
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value);
                  setPage(1);
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-heading uppercase tracking-wide transition",
                  filter === option.value
                    ? "bg-navy-600 text-white"
                    : "bg-white dark:bg-navy-900 ring-1 ring-gray-200 dark:ring-navy-800 text-navy-700 dark:text-navy-200 hover:bg-gray-50 dark:hover:bg-navy-800/40",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
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
          <EmptyState message="No hay mensajes en esta bandeja." />
        )}

        {data && data.data.length > 0 && (
          <ul className="divide-y divide-gray-100 dark:divide-navy-800">
            {data.data.map((message) => {
              const isNew = message.status === "nueva";
              return (
                <li
                  key={message.id}
                  className={cn(
                    "border-l-2 transition-colors",
                    isNew
                      ? "border-l-sky-500 bg-sky-50/60 dark:bg-sky-500/[0.07]"
                      : "border-l-transparent",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 p-5">
                    {/* La fila entera abre el mensaje: con el cuerpo
                          recortado a una línea, buscar un enlace chiquito para
                          leerlo completo sería una molestia por consulta. */}
                    <button
                      type="button"
                      onClick={() => abrirMensaje(message)}
                      className="min-w-0 flex-1 text-left"
                      aria-label={`Leer la consulta de ${message.name}`}
                    >
                      <p className="font-medium text-navy-800 dark:text-white flex items-center gap-2">
                        {isNew && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        )}
                        {message.name}
                      </p>
                      <p className="text-gray-500 dark:text-navy-400 text-xs">
                        {message.email}
                        {message.phone && <> · {message.phone}</>}
                      </p>
                      {message.subject && (
                        <p className="font-heading uppercase text-navy-700 dark:text-navy-200 text-sm mt-2">
                          {message.subject}
                        </p>
                      )}
                      {/* Una sola línea: la fila es para barrer con la vista,
                            el texto completo vive en el modal. */}
                      <p className="text-gray-600 dark:text-navy-300 text-sm truncate mt-0.5">
                        {message.message}
                      </p>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-gray-400 dark:text-navy-400 text-xs mr-2">
                        {formatDate(message.createdAt)}
                      </span>
                      <IconButton
                        onClick={() =>
                          void setStatus({
                            id: message.id,
                            status: isNew ? "leida" : "nueva",
                          })
                        }
                        title={
                          isNew ? "Marcar como leído" : "Marcar como nuevo"
                        }
                        aria-label={
                          isNew ? "Marcar como leído" : "Marcar como nuevo"
                        }
                      >
                        {isNew ? (
                          <Mail className="w-4 h-4" />
                        ) : (
                          <MailOpen className="w-4 h-4" />
                        )}
                      </IconButton>
                      <ConfirmDialog
                        title="Eliminar mensaje"
                        description={`Se eliminará la consulta de ${message.name}.`}
                        onConfirm={() => remove(message.id)}
                        trigger={
                          <IconButton
                            className="hover:text-red-600"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        }
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ListShell>

      <MessageDialog message={abierto} onClose={() => setAbierto(null)} />
    </>
  );
};
