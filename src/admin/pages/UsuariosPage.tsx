import { useEffect, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  Send,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  IconButton,
} from "../components/AdminUi";
import { AdminSelect } from "../components/AdminSelect";
import { ListShell } from "../components/ListShell";
import { Pagination } from "../components/Pagination";
import { ConfirmDialog } from "@/components/custom/ConfirmDialog";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/api/petrogasApi";
import { useAuthStore } from "@/auth/store/auth.store";
import { ROLE_LABELS, ROLE_SHORT } from "@/auth/constants/roles";
import {
  deactivateUserAction,
  deleteUserAction,
  getUsersAction,
  inviteUserAction,
  reactivateUserAction,
  resendActivationAction,
  updateUserRolesAction,
} from "@/auth/actions/users.actions";
import type {
  AuthUser,
  UserRole,
  UserStatus,
} from "@/auth/interfaces/user.interface";

const inviteSchema = z.object({
  email: z.email("Ingresá un correo válido").max(254),
  role: z.enum(["user", "rrhh", "auditor", "admin"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const STATUS_BADGE: Record<
  UserStatus,
  { label: string; variant: "amber" | "green" | "muted"; hint: string }
> = {
  pendiente: {
    label: "Pendiente",
    variant: "amber",
    hint: "Invitado, todavía no aceptó",
  },
  activo: { label: "Activo", variant: "green", hint: "Tiene acceso al panel" },
  desactivado: {
    label: "Desactivado",
    variant: "muted",
    hint: "Un administrador le quitó el acceso",
  },
};

const ROLE_FILTERS: { value: UserRole | "todos"; label: string }[] = [
  { value: "todos", label: "Todos los roles" },
  { value: "admin", label: "Administradores" },
  { value: "rrhh", label: "RRHH" },
  { value: "auditor", label: "Auditores" },
  { value: "user", label: "Sin acceso al panel" },
];

const STATUS_FILTERS: { value: UserStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos los estados" },
  { value: "pendiente", label: "Pendientes" },
  { value: "activo", label: "Activos" },
  { value: "desactivado", label: "Desactivados" },
];

// Fila de la grilla. Las acciones dependen del estado: sobre un pendiente
// "Reactivar" da 409, así que directamente no se ofrece.
const UserRow = ({
  user,
  isSelf,
  onResend,
  onDelete,
  onDeactivate,
  onReactivate,
  onChangeRole,
}: {
  user: AuthUser;
  isSelf: boolean;
  onResend: () => void;
  onDelete: () => Promise<void>;
  onDeactivate: () => Promise<void>;
  onReactivate: () => void;
  onChangeRole: (role: UserRole) => void;
}) => {
  const badge = STATUS_BADGE[user.status];
  const fullName = [user.name, user.surname].filter(Boolean).join(" ");

  return (
    <li className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-navy-800 dark:text-white truncate">
          {fullName || user.email}
          {isSelf && (
            <span className="ml-2 text-gray-400 dark:text-navy-500 text-xs font-normal">
              (vos)
            </span>
          )}
        </p>
        {fullName && (
          <p className="text-gray-500 dark:text-navy-400 text-xs truncate">
            {user.email}
          </p>
        )}
      </div>

      <div className="shrink-0 lg:w-32">
        <Badge variant={badge.variant} title={badge.hint}>
          {badge.label}
        </Badge>
      </div>

      <div className="shrink-0 lg:w-52">
        {/* Cambiar el rol REEMPLAZA el conjunto entero. La UI maneja un rol por
            usuario, que es lo que el alta permite; si alguien tuviera varios,
            se muestran todos y el select arranca en el primero. */}
        <AdminSelect
          aria-label={`Rol de ${user.email}`}
          value={user.roles[0] ?? "user"}
          disabled={isSelf}
          onChange={(event) => onChangeRole(event.target.value as UserRole)}
        >
          {(Object.keys(ROLE_SHORT) as UserRole[]).map((role) => (
            <option key={role} value={role}>
              {ROLE_SHORT[role]}
            </option>
          ))}
        </AdminSelect>
        {user.roles.length > 1 && (
          <p className="text-amber-600 dark:text-amber-500 text-[11px] mt-1">
            Tiene varios roles (
            {user.roles.map((role) => ROLE_SHORT[role]).join(" · ")}). Si
            cambiás el rol acá, se queda solo con el que elijas.
          </p>
        )}
      </div>

      <div className="shrink-0 flex flex-wrap items-center gap-2 lg:w-56 lg:justify-end">
        {user.status === "pendiente" && (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg"
              onClick={onResend}
            >
              <Send className="w-3.5 h-3.5" />
              Reenviar invitación
            </Button>
            {/* Eliminar solo aplica a invitaciones pendientes: en una cuenta
                activa o desactivada el backend responde 409, porque esas se dan
                de baja con Desactivar, que se puede revertir. */}
            <ConfirmDialog
              title="Eliminar invitación"
              description={`Se eliminará la invitación a ${user.email}. Esta acción no se puede deshacer. El correo queda libre para volver a invitarlo.`}
              confirmLabel="Eliminar"
              onConfirm={onDelete}
              trigger={
                <IconButton
                  className="hover:text-red-600"
                  title="Eliminar invitación"
                  aria-label={`Eliminar la invitación a ${user.email}`}
                >
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              }
            />
          </>
        )}

        {user.status === "activo" && (
          <ConfirmDialog
            title="Desactivar usuario"
            description={`${user.email} va a perder el acceso al panel de inmediato, incluso si tiene una sesión abierta. Se puede reactivar después.`}
            confirmLabel="Desactivar"
            onConfirm={onDeactivate}
            trigger={
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isSelf}
                title={
                  isSelf ? "No podés desactivar tu propia cuenta" : undefined
                }
                className="rounded-lg"
              >
                <UserX className="w-3.5 h-3.5" />
                Desactivar
              </Button>
            }
          />
        )}

        {user.status === "desactivado" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            onClick={onReactivate}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Reactivar
          </Button>
        )}
      </div>
    </li>
  );
};

export const UsuariosPage = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "todos">("todos");
  const [status, setStatus] = useState<UserStatus | "todos">("todos");

  // Se espera a que deje de tipear: sin esto cada tecla dispara una consulta.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = {
    page,
    search: search || undefined,
    role: role === "todos" ? undefined : role,
    status: status === "todos" ? undefined : status,
  };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => getUsersAction(params),
    // Evita el parpadeo a vacío al cambiar de página o de filtro.
    placeholderData: keepPreviousData,
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  // Los 409 del backend traen un `message` en español listo para el toast.
  const onActionError = (fallback: string) => (error: unknown) =>
    toast.error(getApiErrorMessage(error, fallback));

  const { mutateAsync: invite, isPending: inviting } = useMutation({
    mutationFn: (values: InviteFormValues) =>
      inviteUserAction({ email: values.email, roles: [values.role] }),
    onSuccess: (user) => {
      toast.success("Invitación enviada", {
        description: `${user.email} recibió el enlace para activar su cuenta.`,
      });
      reset({ email: "", role: "rrhh" });
      invalidate();
    },
    onError: onActionError("No pudimos invitar al usuario"),
  });

  const { mutateAsync: resend } = useMutation({
    mutationFn: resendActivationAction,
    onSuccess: () => toast.success("Invitación reenviada"),
    onError: onActionError("No pudimos reenviar la invitación"),
  });

  const { mutateAsync: deactivate } = useMutation({
    mutationFn: deactivateUserAction,
    onSuccess: () => {
      toast.success("Usuario desactivado", {
        description: "Perdió el acceso al panel de inmediato.",
      });
      invalidate();
    },
    onError: onActionError("No pudimos desactivar al usuario"),
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: deleteUserAction,
    onSuccess: () => {
      toast.success("Invitación eliminada", {
        description: "Ese correo queda libre para volver a invitarlo.",
      });
      invalidate();
    },
    onError: onActionError("No pudimos eliminar la invitación"),
  });

  const { mutateAsync: reactivate } = useMutation({
    mutationFn: reactivateUserAction,
    onSuccess: () => {
      toast.success("Usuario reactivado");
      invalidate();
    },
    onError: onActionError("No pudimos reactivar al usuario"),
  });

  const { mutateAsync: changeRole } = useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: UserRole[] }) =>
      updateUserRolesAction(id, roles),
    onSuccess: (user) => {
      toast.success("Rol actualizado", {
        description: `${user.email} ahora es ${ROLE_SHORT[user.roles[0] ?? "user"]}. El cambio aplica al instante.`,
      });
      invalidate();
    },
    onError: onActionError("No pudimos cambiar el rol"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "rrhh" },
  });

  const users = data?.data ?? [];

  return (
    <ListShell
      header={
        <AdminPageHeader
          title="Usuarios"
          description="El alta es por invitación: la persona define su nombre y contraseña al activar la cuenta. No se borran cuentas — la baja es desactivar, que es reversible."
        />
      }
      toolbar={
        <div className="space-y-4 mb-6">
          <AdminCard className="p-5">
            <h2 className="font-heading uppercase font-semibold text-navy-800 dark:text-white text-sm mb-4">
              Invitar usuario
            </h2>
            <form
              onSubmit={handleSubmit((values) => invite(values))}
              noValidate
              className="flex flex-col sm:flex-row gap-3 sm:items-start"
            >
              <div className="flex-1">
                <Label htmlFor="email" className="sr-only">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="persona@petrogassa.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="sm:w-72">
                <Label htmlFor="role" className="sr-only">
                  Rol
                </Label>
                <AdminSelect id="role" {...register("role")}>
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((option) => (
                    <option key={option} value={option}>
                      {ROLE_LABELS[option]}
                    </option>
                  ))}
                </AdminSelect>
              </div>
              <Button
                type="submit"
                disabled={inviting}
                className="rounded-lg shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                {inviting ? "Enviando..." : "Invitar"}
              </Button>
            </form>
          </AdminCard>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar por nombre, apellido o correo"
                aria-label="Buscar usuarios"
                className="pl-9"
              />
            </div>
            <AdminSelect
              aria-label="Filtrar por rol"
              value={role}
              onChange={(event) => {
                setRole(event.target.value as UserRole | "todos");
                setPage(1);
              }}
              className="sm:w-52"
            >
              {ROLE_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect
              aria-label="Filtrar por estado"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as UserStatus | "todos");
                setPage(1);
              }}
              className="sm:w-52"
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdminSelect>
          </div>
        </div>
      }
      pagination={
        data && users.length > 0 ? (
          <Pagination meta={data.meta} onChange={setPage} />
        ) : null
      }
    >
      {isPending && <SectionLoader />}
      {isError && <SectionError onRetry={() => void refetch()} />}
      {data && users.length === 0 && (
        <EmptyState
          message={
            search || role !== "todos" || status !== "todos"
              ? "Ningún usuario coincide con la búsqueda."
              : "Todavía no hay usuarios."
          }
        />
      )}

      {users.length > 0 && (
        <ul className="divide-y divide-gray-100 dark:divide-navy-800">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isSelf={user.id === currentUser?.id}
              onResend={() => void resend(user.id)}
              onDelete={async () => {
                await remove(user.id);
              }}
              onDeactivate={async () => {
                await deactivate(user.id);
              }}
              onReactivate={() => void reactivate(user.id)}
              onChangeRole={(nextRole) =>
                void changeRole({ id: user.id, roles: [nextRole] })
              }
            />
          ))}
        </ul>
      )}
    </ListShell>
  );
};
