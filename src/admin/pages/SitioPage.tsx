import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Info, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, AdminPageHeader } from "../components/AdminUi";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { CertificationBand } from "@/components/custom/CertificationBand";
import { SiteImageSlots } from "../components/SiteImageSlots";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/api/petrogasApi";
import { useAuthStore } from "@/auth/store/auth.store";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  uploadImageAction,
} from "../actions/media.actions";
import { updateSiteSettingsAction } from "@/site-settings/actions/site-settings.actions";
import {
  SITE_SETTINGS_KEY,
  useSiteSettings,
} from "@/site-settings/hooks/useSiteSettings";
import type { SiteSettings } from "@/site-settings/interfaces/site-settings.interface";

// Manual de Uso de la Marca de Bureau Veritas (Rev. 14), pág. 4: mínimo
// recomendado para digital, incluyendo la zona de protección.
const MIN_WIDTH = 820;
const MIN_HEIGHT = 510;

// Tope del backend para certificationScopeText (openapi.yaml). Se corta acá
// para no mandar un texto que vuelva como 400.
const SCOPE_MAX_LENGTH = 1000;

const readDimensions = (
  file: File,
): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No pudimos leer la imagen"));
    };
    image.src = url;
  });

export const SitioPage = () => {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useSiteSettings();
  // Esta pantalla tiene dos bloques con permisos distintos: la marca del pie y
  // su alcance van por PATCH /site-settings, que el auditor puede; las
  // imágenes de las páginas van por PATCH /site-settings/images, que es solo
  // de admin. Mostrarle el segundo lo dejaría tildar, subir, y recién al
  // guardar comerse un 403 sin entender por qué.
  const esAdmin =
    useAuthStore((state) => state.user?.roles.includes("admin")) ?? false;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // null = no se editó todavía y se muestra lo que hay en el servidor. Al
  // guardar vuelve a null, así toma el valor recién devuelto por el PATCH.
  const [draftScope, setDraftScope] = useState<string | null>(null);
  const scope = draftScope ?? data?.certificationScopeText ?? "";

  // El PATCH devuelve la config ya actualizada: se escribe en la caché para
  // que el panel la muestre al toque, sin esperar el max-age del GET público.
  const applyResult = (settings: SiteSettings) => {
    queryClient.setQueryData(SITE_SETTINGS_KEY, settings);
  };

  const { mutateAsync: save, isPending: saving } = useMutation({
    mutationFn: updateSiteSettingsAction,
    onSuccess: applyResult,
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos guardar los cambios")),
  });

  // La marca se sube tal cual la entrega Bureau Veritas: no se recorta ni se
  // reescala, porque eso rompería su zona de protección y sus proporciones.
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("La marca debe ser PNG, JPEG o WebP");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("La marca no puede superar los 4 MB");
      return;
    }

    setUploading(true);
    try {
      const { width, height } = await readDimensions(file);
      if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        toast.warning("La marca es más chica de lo que pide el manual", {
          description: `Subiste ${width} × ${height} px y Bureau Veritas recomienda al menos ${MIN_WIDTH} × ${MIN_HEIGHT}. Se va a ver borrosa: pedile el archivo en alta a BV.`,
        });
      }
      const media = await uploadImageAction(file);
      await save({ certificationMarkImage: media.key });
      toast.success("Marca actualizada");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No pudimos subir la marca"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (isPending) return <SectionLoader className="py-32" />;
  if (isError) return <SectionError onRetry={() => void refetch()} />;

  const scopeChanged =
    draftScope !== null &&
    draftScope.trim() !== (data?.certificationScopeText ?? "");

  return (
    <>
      <AdminPageHeader
        title="Configuración del sitio"
        description="Datos que no pertenecen a una sección en particular."
      />

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {esAdmin && <SiteImageSlots />}

      <AdminCard className="p-5 max-w-3xl mt-6">
        <h2 className="font-heading uppercase font-semibold text-navy-800 dark:text-white">
          Marca de certificación (footer)
        </h2>
        <p className="text-gray-500 dark:text-navy-300 text-sm mt-1">
          Es una sola imagen de Bureau Veritas, que adentro lista todas las
          normas certificadas. Se muestra al pie del sitio, junto al logo de
          Petrogas.
        </p>

        <div className="flex gap-3 rounded-lg bg-sky-50/60 dark:bg-sky-500/10 p-3 mt-4">
          <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <div className="text-xs text-navy-700 dark:text-navy-200 space-y-1">
            <p>
              Pedile el archivo oficial a Bureau Veritas (
              <code className="bg-white dark:bg-navy-950 px-1 rounded">
                gerencia.a.tecnica@bureauveritas.com
              </code>
              ). Según su manual Rev. 14:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-gray-600 dark:text-navy-300">
              <li>
                Mínimo{" "}
                <strong>
                  {MIN_WIDTH} × {MIN_HEIGHT} px
                </strong>{" "}
                para uso digital, incluyendo la zona de protección.
              </li>
              <li>
                No la recortes, estires ni recolorees: lo único modificable es
                la norma que muestra.
              </li>
              <li>
                Si se suspende una certificación, hay que retirarla del sitio.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-gray-200 dark:border-navy-700 overflow-hidden">
          {data?.certificationMarkImage ? (
            <>
              {/* Vista previa con el mismo componente que usa el footer: lo que
                  se ve acá es literalmente lo que se publica. */}
              <div className="bg-navy-900">
                {/* El padding va acá y no adentro del componente: en el footer
                    el espaciado se lo da la grilla del pie. */}
                <CertificationBand
                  markImage={data.certificationMarkImage}
                  scopeText={scope}
                  className="p-6"
                />
              </div>
              <div className="flex border-t border-gray-200 dark:border-navy-700">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading || saving}
                  className="flex-1 py-2 text-xs font-heading uppercase tracking-wide text-sky-600 dark:text-sky-400 hover:bg-gray-50 dark:hover:bg-navy-800/60 transition"
                >
                  Reemplazar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void save({ certificationMarkImage: null }).then(() =>
                      toast.success("Marca quitada del sitio"),
                    )
                  }
                  disabled={uploading || saving}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-red-600 border-l border-gray-200 dark:border-navy-700 transition"
                  aria-label="Quitar marca"
                  title="Quitar marca"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || saving}
              className="w-full h-32 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-navy-800/60 transition"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="w-5 h-5 text-sky-500" />
                  <span className="text-gray-400 text-xs">Subir marca</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-6">
          <Label htmlFor="scope">Alcance de la certificación</Label>
          <p className="text-gray-500 dark:text-navy-300 text-xs mb-1.5">
            Obligatorio si la certificación no cubre todos los procesos y sitios
            de la empresa. Se muestra junto a la marca, siempre visible.
          </p>
          <Textarea
            id="scope"
            value={scope}
            onChange={(event) => setDraftScope(event.target.value)}
            rows={3}
            maxLength={SCOPE_MAX_LENGTH}
            className="min-h-20"
            placeholder="Ej: Alcance: operación y mantenimiento de plantas de tratamiento de gas en la cuenca Neuquina."
          />
          <div className="flex items-center justify-between gap-3 mt-3">
            {/* El contador aparece recién cerca del tope, para no distraer. */}
            <span className="text-gray-400 dark:text-navy-500 text-xs">
              {scope.length > SCOPE_MAX_LENGTH - 100 &&
                `Quedan ${SCOPE_MAX_LENGTH - scope.length} caracteres`}
            </span>
            <Button
              type="button"
              size="sm"
              className="rounded-lg"
              disabled={saving || !scopeChanged}
              onClick={() =>
                // maxLength solo frena lo que se tipea o pega; el corte acá
                // cubre además un texto largo que ya viniera del servidor.
                void save({
                  certificationScopeText:
                    scope.trim().slice(0, SCOPE_MAX_LENGTH) || null,
                }).then(() => {
                  setDraftScope(null);
                  toast.success("Alcance actualizado");
                })
              }
            >
              {saving ? "Guardando..." : "Guardar alcance"}
            </Button>
          </div>
        </div>

        <p className="text-gray-400 dark:text-navy-500 text-xs mt-4">
          Los cambios pueden tardar hasta 5 minutos en verse en el sitio
          público, porque la configuración se sirve cacheada.
        </p>
      </AdminCard>
    </>
  );
};
