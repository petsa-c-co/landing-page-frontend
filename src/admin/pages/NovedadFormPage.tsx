import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { AdminCard, AdminPageHeader } from "../components/AdminUi"
import { AdminSelect } from "../components/AdminSelect"
import { UniqueConflictAlert } from "../components/UniqueConflictAlert"
import { useUniqueConflict } from "../hooks/useUniqueConflict"
import { ImageCropUploader } from "../components/ImageCropUploader"
import { SectionLoader } from "@/components/custom/QueryStates"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/api/petrogasApi"
import { TRASH_BASE_PATHS } from "@/api/trash.actions"
import {
  createNewsAction,
  getNewsByIdAction,
  updateNewsAction,
} from "@/news/actions/admin.actions"

const newsSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  // "admin" está reservado porque colisiona con las rutas del panel.
  slug: z
    .string()
    .regex(
      /^(?!admin$)[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Solo minúsculas, números y guiones (y no puede ser \"admin\")",
    )
    .max(220)
    .optional()
    .or(z.literal("")),
  category: z.enum(["novedades", "prensa"]),
  excerpt: z.string().min(1, "El extracto es obligatorio").max(500),
  body: z.string().min(1, "El cuerpo es obligatorio"),
  externalUrl: z.url("Debe ser una URL válida").optional().or(z.literal("")),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
})

type NewsFormValues = z.infer<typeof newsSchema>

export const NovedadFormPage = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [coverKey, setCoverKey] = useState<string | null>(null)
  const { captured, capture, clear } = useUniqueConflict()

  const { data: post, isPending: loadingPost } = useQuery({
    queryKey: ["admin", "news", "detail", id],
    queryFn: () => getNewsByIdAction(id!),
    enabled: isEdit,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      category: "novedades",
      isFeatured: false,
      isPublished: false,
    },
  })

  useEffect(() => {
    if (!post) return
    reset({
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      body: post.body,
      externalUrl: post.externalUrl ?? "",
      isFeatured: post.isFeatured,
      isPublished: post.isPublished,
    })
  }, [post, reset])

  const { mutateAsync: save } = useMutation({
    mutationFn: async (values: NewsFormValues) => {
      const payload = {
        ...values,
        slug: values.slug || undefined,
        externalUrl: values.externalUrl || undefined,
        // Solo se manda si se tocó el uploader: null borra la portada.
        ...(coverKey !== null ? { coverImage: coverKey } : {}),
      }
      // Si se marca como destacada, el backend des-marca la anterior solo.
      return isEdit ? updateNewsAction(id!, payload) : createNewsAction(payload)
    },
    onSuccess: () => {
      toast.success(isEdit ? "Nota actualizada" : "Nota creada")
      void queryClient.invalidateQueries({ queryKey: ["admin", "news"] })
      void queryClient.invalidateQueries({ queryKey: ["news"] })
      void navigate("/admin/novedades")
    },
    onError: (error) => {
      // El slug puede estar retenido por otra nota, incluso una en la papelera.
      if (!capture(error, "No pudimos guardar la nota")) {
        toast.error(getApiErrorMessage(error, "No pudimos guardar la nota"))
      }
    },
  })

  if (isEdit && loadingPost) return <SectionLoader className="py-32" />

  return (
    <>
      <Link
        to="/admin/novedades"
        className="inline-flex items-center gap-2 text-sky-500 text-sm mb-4 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Novedades
      </Link>

      <AdminPageHeader title={isEdit ? "Editar nota" : "Nueva nota"} />

      <form onSubmit={handleSubmit((values) => save(values))}>
        {captured && (
          <UniqueConflictAlert
            conflict={captured.conflict}
            message={captured.message}
            basePath={TRASH_BASE_PATHS.news}
            onResolved={clear}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AdminCard className="lg:col-span-2 p-6">
            <div className="mb-5">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register("title")} maxLength={200} />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
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
                <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
              )}
            </div>

            <div className="mb-5">
              <Label htmlFor="excerpt">Extracto</Label>
              <Textarea
                id="excerpt"
                {...register("excerpt")}
                rows={3}
                maxLength={500}
                className="min-h-20"
              />
              {errors.excerpt && (
                <p className="text-red-500 text-xs mt-1">{errors.excerpt.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="body">Cuerpo</Label>
              <Textarea id="body" {...register("body")} rows={14} className="min-h-64" />
              <p className="text-gray-400 text-xs mt-1">
                Se muestra como texto: separá los párrafos con una línea en blanco.
              </p>
              {errors.body && (
                <p className="text-red-500 text-xs mt-1">{errors.body.message}</p>
              )}
            </div>
          </AdminCard>

          <div className="space-y-6">
            <AdminCard className="p-6">
              <div className="mb-5">
                <Label htmlFor="category">Categoría</Label>
                <AdminSelect
                  id="category"
                  {...register("category")}
                >
                  <option value="novedades">Novedades</option>
                  <option value="prensa">Prensa</option>
                </AdminSelect>
              </div>

              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isPublished")}
                  className="w-4 h-4 accent-sky-500"
                />
                <span className="text-navy-800 dark:text-navy-100 text-sm">Publicada</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isFeatured")}
                  className="w-4 h-4 accent-sky-500"
                />
                <span className="text-navy-800 dark:text-navy-100 text-sm">
                  Destacada — encabeza Novedades y Prensa
                  <span className="block text-gray-400 text-xs">
                    Solo puede haber una: marcarla reemplaza a la actual.
                  </span>
                </span>
              </label>
            </AdminCard>

            <AdminCard className="p-6">
              <ImageCropUploader
                label="Portada"
                hint="Recomendado 1200 × 675 px (16:9)"
                previewUrl={post?.coverImage}
                onUploaded={setCoverKey}
                aspect={16 / 9}
                outputType="image/jpeg"
                maxOutputWidth={1600}
                previewBoxClassName="aspect-video bg-gray-100 dark:bg-navy-950"
                previewMediaClassName="w-full h-full object-cover"
                figure="card"
              />
            </AdminCard>

            <AdminCard className="p-6">
              <Label htmlFor="externalUrl">URL externa (opcional)</Label>
              <Input
                id="externalUrl"
                {...register("externalUrl")}
                placeholder="https://linkedin.com/..."
              />
              {errors.externalUrl && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.externalUrl.message}
                </p>
              )}
            </AdminCard>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg"
            >
              {isSubmitting ? "Guardando..." : "Guardar nota"}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}
