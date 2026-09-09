import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { AdminCard, AdminPageHeader, IconButton } from "../components/AdminUi";
import { AdminSelect } from "../components/AdminSelect";
import { UniqueConflictAlert } from "../components/UniqueConflictAlert";
import { useUniqueConflict } from "../hooks/useUniqueConflict";
import brandBanner from "@/assets/banner.webp";
import { ImageCropUploader } from "../components/ImageCropUploader";
import { respaldoDe } from "@/services/constants/default-images";
import { SectionLoader } from "@/components/custom/QueryStates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/api/petrogasApi";
import { TRASH_BASE_PATHS } from "@/api/trash.actions";
import {
  createServiceAction,
  getServicesAdminAction,
  updateServiceAction,
} from "@/services/actions/admin.actions";

// Los dos servicios fundacionales tienen foto de respaldo en el frontend; el
// resto no, y ahí el casillero sigue mostrando el esquema de dónde cae.
const TEXTO_RESPALDO = "Hoy la página usa esta foto";

const serviceSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(120),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones")
    .max(140)
    .optional()
    .or(z.literal("")),
  shortDescription: z.string().min(1, "El resumen es obligatorio").max(500),
  longDescription: z.string().min(1, "La descripción es obligatoria"),
  itemsLayout: z.enum(["bullets", "icons", "numbered"]),
  isActive: z.boolean(),
  items: z.array(
    z.object({
      label: z.string().min(1, "Escribí el texto del item").max(200),
      spec: z.string().max(200).optional(),
      icon: z.string().max(50).optional(),
    }),
  ),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

// Los íconos que resuelve la página pública para el layout "icons".
const ICON_OPTIONS = [
  { value: "", label: "Sin ícono" },
  { value: "pickup", label: "Camioneta" },
  { value: "combi", label: "Combi" },
  { value: "minibus", label: "Minibús" },
];

// Fila arrastrable de la lista de items. La manija (GripVertical) es lo único
// que dispara el drag, así los inputs siguen siendo editables con normalidad.
const SortableItemRow = ({
  id,
  index,
  showNumber,
  children,
}: {
  id: string;
  index: number;
  showNumber: boolean;
  children: ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-start gap-2 rounded-lg",
        isDragging &&
          "relative z-10 bg-white dark:bg-navy-900 shadow-lg ring-1 ring-sky-300",
      )}
    >
      <button
        type="button"
        className="mt-2.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-gray-300 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 active:cursor-grabbing"
        aria-label="Arrastrar para reordenar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      {showNumber && (
        <span className="mt-2 shrink-0 w-6 text-center text-xs font-heading font-semibold text-sky-500 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      {children}
    </li>
  );
};

export const ServicioFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { captured, capture, clear } = useUniqueConflict();
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [detailImage, setDetailImage] = useState<string | null>(null);

  // El backend no expone GET /services/:id por id; se toma del listado admin.
  const { data: services, isPending: loading } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: getServicesAdminAction,
  });
  const service = isEdit ? services?.find((item) => item.id === id) : undefined;
  // Por el slug GUARDADO, no por el que se esté tipeando: el respaldo que se
  // previsualiza es el que la página pública usa ahora mismo.
  const respaldos = respaldoDe(service?.slug);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      itemsLayout: "bullets",
      isActive: true,
      items: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items",
  });
  // useWatch en lugar de watch(): devuelve un valor y no una función, así el
  // React Compiler puede memoizar el componente.
  const layout = useWatch({ control, name: "itemsLayout" });

  const sensors = useSensors(
    // Hay que mover 6px antes de arrancar el drag, así un clic simple en la
    // manija no cuenta como arrastre.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex);
  };

  useEffect(() => {
    if (!service) return;
    reset({
      title: service.title,
      slug: service.slug,
      shortDescription: service.shortDescription,
      longDescription: service.longDescription,
      itemsLayout: service.itemsLayout,
      isActive: service.isActive,
      items: service.items.map((item) => ({
        label: item.label,
        spec: item.spec ?? "",
        icon: item.icon ?? "",
      })),
    });
  }, [service, reset]);

  const { mutateAsync: save } = useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      const payload = {
        ...values,
        slug: values.slug || undefined,
        // El PATCH reemplaza la lista completa de items.
        items: values.items.map((item, index) => ({
          label: item.label,
          spec: item.spec || undefined,
          icon: item.icon || undefined,
          sortOrder: index,
        })),
        ...(cardImage !== null ? { cardImage } : {}),
        ...(bannerImage !== null ? { bannerImage } : {}),
        ...(detailImage !== null ? { detailImage } : {}),
      };
      return isEdit
        ? updateServiceAction(id!, payload)
        : createServiceAction(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Servicio actualizado" : "Servicio creado");
      void queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      void queryClient.invalidateQueries({ queryKey: ["services"] });
      void navigate("/admin/servicios");
    },
    onError: (error) => {
      // Si el slug lo retiene otro registro (quizás en la papelera), se muestra
      // como aviso con acciones en vez de un toast que desaparece.
      if (!capture(error, "No pudimos guardar el servicio")) {
        toast.error(
          getApiErrorMessage(error, "No pudimos guardar el servicio"),
        );
      }
    },
  });

  if (isEdit && loading) return <SectionLoader className="py-32" />;

  return (
    <>
      <Link
        to="/admin/servicios"
        className="inline-flex items-center gap-2 text-sky-500 text-sm mb-4 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Servicios
      </Link>

      <AdminPageHeader title={isEdit ? "Editar servicio" : "Nuevo servicio"} />

      <form onSubmit={handleSubmit((values) => save(values))}>
        {captured && (
          <UniqueConflictAlert
            conflict={captured.conflict}
            message={captured.message}
            basePath={TRASH_BASE_PATHS.services}
            onResolved={clear}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AdminCard className="p-6">
              <div className="mb-5">
                <Label htmlFor="title">Título</Label>
                <Input id="title" {...register("title")} maxLength={120} />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <Label htmlFor="slug">Slug (opcional)</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="se-genera-del-titulo"
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <Label htmlFor="shortDescription">
                  Resumen (card del listado)
                </Label>
                <Textarea
                  id="shortDescription"
                  {...register("shortDescription")}
                  rows={2}
                  maxLength={500}
                  className="min-h-16"
                />
                {errors.shortDescription && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.shortDescription.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="longDescription">
                  Descripción (página del servicio)
                </Label>
                <Textarea
                  id="longDescription"
                  {...register("longDescription")}
                  rows={6}
                  className="min-h-32"
                />
                {errors.longDescription && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.longDescription.message}
                  </p>
                )}
              </div>
            </AdminCard>

            <AdminCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading uppercase font-semibold text-navy-800 dark:text-white">
                    Items
                  </h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {layout === "icons"
                      ? "Cada item puede tener un ícono."
                      : layout === "numbered"
                        ? "Cada item se numera y puede llevar un dato técnico."
                        : "Lista simple de items."}
                  </p>
                  {fields.length > 1 && (
                    <p className="text-gray-400 dark:text-navy-400 text-xs mt-0.5">
                      Arrastrá desde la manija para cambiar el orden.
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => append({ label: "", spec: "", icon: "" })}
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">
                  Sin items todavía.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map((field) => field.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="space-y-3">
                      {fields.map((field, index) => (
                        <SortableItemRow
                          key={field.id}
                          id={field.id}
                          index={index}
                          showNumber={layout === "numbered"}
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                              {...register(`items.${index}.label`)}
                              placeholder="Texto del item"
                              maxLength={200}
                            />
                            {layout === "icons" ? (
                              <AdminSelect {...register(`items.${index}.icon`)}>
                                {ICON_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </AdminSelect>
                            ) : (
                              <Input
                                {...register(`items.${index}.spec`)}
                                placeholder="Dato técnico (opcional)"
                                maxLength={200}
                              />
                            )}
                            {errors.items?.[index]?.label && (
                              <p className="text-red-500 text-xs sm:col-span-2">
                                {errors.items[index]?.label?.message}
                              </p>
                            )}
                          </div>
                          <IconButton
                            onClick={() => remove(index)}
                            className="hover:text-red-600 mt-1"
                            aria-label="Quitar item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </SortableItemRow>
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard className="p-6">
              <div className="mb-5">
                <Label htmlFor="itemsLayout">Diseño de los items</Label>
                <AdminSelect id="itemsLayout" {...register("itemsLayout")}>
                  <option value="bullets">Lista simple</option>
                  <option value="icons">Con íconos</option>
                  <option value="numbered">Numerado (01, 02, 03)</option>
                </AdminSelect>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="w-4 h-4 accent-sky-500"
                />
                <span className="text-navy-800 dark:text-navy-100 text-sm">
                  Visible en el sitio
                </span>
              </label>
            </AdminCard>

            <AdminCard className="p-6 space-y-5">
              <ImageCropUploader
                label="Imagen de la card"
                hint="Recomendado 800 × 550 px (horizontal)"
                previewUrl={service?.cardImage}
                onUploaded={setCardImage}
                aspect={800 / 550}
                outputType="image/jpeg"
                maxOutputWidth={800}
                previewBoxClassName="aspect-[800/550] bg-gray-100 dark:bg-navy-950"
                previewMediaClassName="w-full h-full object-cover"
                figure="card"
                imagenPorDefecto={respaldos?.tarjeta}
                textoPorDefecto={TEXTO_RESPALDO}
              />
              <ImageCropUploader
                label="Banner de la página"
                hint="Recomendado 1920 × 500 px (panorámico)"
                previewUrl={service?.bannerImage}
                onUploaded={setBannerImage}
                aspect={1920 / 500}
                outputType="image/jpeg"
                maxOutputWidth={1920}
                previewBoxClassName="aspect-[1920/500] bg-gray-100 dark:bg-navy-950"
                previewMediaClassName="w-full h-full object-cover"
                figure="banner"
                imagenPorDefecto={brandBanner}
              />
              <ImageCropUploader
                label="Imagen del detalle"
                hint="Recomendado 900 × 700 px (horizontal)"
                previewUrl={service?.detailImage}
                onUploaded={setDetailImage}
                aspect={900 / 700}
                outputType="image/jpeg"
                maxOutputWidth={900}
                previewBoxClassName="aspect-[900/700] bg-gray-100 dark:bg-navy-950"
                previewMediaClassName="w-full h-full object-cover"
                figure="split"
                imagenPorDefecto={respaldos?.detalle}
                textoPorDefecto={TEXTO_RESPALDO}
              />
            </AdminCard>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg"
            >
              {isSubmitting ? "Guardando..." : "Guardar servicio"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};
