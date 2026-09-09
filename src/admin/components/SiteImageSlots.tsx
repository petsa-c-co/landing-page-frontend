import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AdminCard } from "./AdminUi";
import { Backdrop } from "@/components/custom/Backdrop";
import { ConfirmDialog } from "@/components/custom/ConfirmDialog";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { getApiErrorMessage } from "@/api/petrogasApi";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  uploadImageAction,
} from "../actions/media.actions";
import { updateSiteImageAction } from "@/site-settings/actions/site-images.actions";
import {
  SITE_IMAGES_KEY,
  useSiteImages,
} from "@/site-settings/hooks/useSiteImages";
import {
  SITE_IMAGE_DEFAULTS,
  SITE_IMAGE_LABELS,
  SITE_IMAGE_SLOTS,
  type SiteImageSlot,
  type SiteImages,
} from "@/site-settings/interfaces/site-images.interface";

// Ancho al que se reduce cada foto antes de subirla, así una de celular no
// llega entera al servidor. El hero necesita más que el resto: en un teléfono
// la pantalla es casi vertical y el recorte se come ~75% del ancho de la foto,
// así que con 1920 quedaba poca resolución real y se veía blanda.
const OUTPUT_WIDTH: Record<SiteImageSlot, number> = {
  "home-hero": 2560,
  "home-empresa": 1600,
  "banner-nosotros": 1920,
  "banner-servicios": 1920,
  "banner-certificaciones": 1920,
  "banner-rrhh": 1920,
  "banner-novedades": 1920,
  "banner-contacto": 1920,
};

// Dónde cae cada imagen en la página, para el dibujito del casillero vacío.
const SLOT_ORDER: SiteImageSlot[] = [
  SITE_IMAGE_SLOTS.homeHero,
  SITE_IMAGE_SLOTS.homeEmpresa,
  SITE_IMAGE_SLOTS.bannerNosotros,
  SITE_IMAGE_SLOTS.bannerServicios,
  SITE_IMAGE_SLOTS.bannerCertificaciones,
  SITE_IMAGE_SLOTS.bannerRrhh,
  SITE_IMAGE_SLOTS.bannerNovedades,
  SITE_IMAGE_SLOTS.bannerContacto,
];

// Reescala manteniendo la proporción y convierte a WebP. Sin esto, una foto de
// 8 MB sacada con el celular se publicaría tal cual y la página se arrastraría.
const shrinkForWeb = (file: File, maxWidth: number): Promise<File> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / image.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No pudimos procesar la imagen"));
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("No pudimos procesar la imagen"));
          const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
          resolve(new File([blob], name, { type: "image/webp" }));
        },
        "image/webp",
        0.82,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No pudimos leer la imagen"));
    };
    image.src = url;
  });

const SlotCard = ({
  slot,
  imageUrl,
  onSaved,
}: {
  slot: SiteImageSlot;
  imageUrl?: string;
  onSaved: (images: SiteImages) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [working, setWorking] = useState(false);
  const { title, hint, recommended } = SITE_IMAGE_LABELS[slot];

  const { mutateAsync: save } = useMutation({
    mutationFn: (imageKey: string | null) =>
      updateSiteImageAction(slot, imageKey),
    onSuccess: onSaved,
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No pudimos guardar la imagen")),
  });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("La imagen debe ser PNG, JPEG o WebP");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("La imagen no puede superar los 4 MB");
      return;
    }
    setWorking(true);
    try {
      const optimized = await shrinkForWeb(file, OUTPUT_WIDTH[slot]);
      const media = await uploadImageAction(optimized);
      await save(media.key);
      toast.success("Imagen actualizada", { description: title });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No pudimos subir la imagen"));
    } finally {
      setWorking(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // Limpiar el slot = volver a la imagen por defecto: el backend solo guarda
  // las que sube un admin, y sin nada cargado el frontend usa la suya
  // (FRONTEND.md §3.6.2). El archivo se borra del servidor y no va a ninguna
  // papelera, de ahí que la acción vaya detrás de una confirmación.
  const restoreDefault = async () => {
    setWorking(true);
    try {
      await save(null);
      toast.success("Volvió a la imagen por defecto", { description: title });
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-navy-700 overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-navy-700">
        <div className="flex items-start justify-between gap-2">
          <p className="font-heading text-xs uppercase tracking-wide text-navy-700 dark:text-navy-200">
            {title}
          </p>
          {/* El estado va explícito: sin esto, un casillero con la imagen de
              marca y otro con una foto subida se distinguen solo mirando la
              miniatura, y no siempre es evidente cuál es cuál. */}
          <span
            className={
              imageUrl
                ? "shrink-0 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-[10px] px-2 py-0.5"
                : "shrink-0 rounded-full bg-gray-100 dark:bg-navy-800 text-gray-500 dark:text-navy-300 text-[10px] px-2 py-0.5"
            }
          >
            {imageUrl ? "Personalizada" : "Por defecto"}
          </span>
        </div>
        <p className="text-gray-400 dark:text-navy-500 text-[11px] mt-0.5">
          {hint}
        </p>
        <p className="text-sky-600 dark:text-sky-400 text-[11px] mt-1">
          Recomendado: {recommended}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {imageUrl ? (
        <>
          <Backdrop
            image={imageUrl}
            seed={slot}
            className="h-28"
            role="img"
            aria-label={`Imagen actual de ${title}`}
          />
          <div className="flex border-t border-gray-200 dark:border-navy-700">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={working}
              className="flex-1 py-2 text-xs font-heading uppercase tracking-wide text-sky-600 dark:text-sky-400 hover:bg-gray-50 dark:hover:bg-navy-800/60 transition"
            >
              Cambiar
            </button>
            <ConfirmDialog
              tone="warning"
              title="Restaurar imagen por defecto"
              description={`Se va a volver a la imagen original del sitio para «${title}». La imagen que subiste se elimina del servidor y no queda en la papelera.`}
              confirmLabel="Restaurar"
              pendingLabel="Restaurando..."
              onConfirm={restoreDefault}
              trigger={
                <button
                  type="button"
                  disabled={working}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-heading uppercase tracking-wide text-gray-500 dark:text-navy-300 hover:text-navy-700 dark:hover:text-white border-l border-gray-200 dark:border-navy-700 transition"
                  aria-label={`Restaurar la imagen por defecto de ${title}`}
                  title="Restaurar imagen por defecto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar
                </button>
              }
            />
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={working}
          className="w-full h-28 flex items-center justify-center gap-3 px-4 hover:bg-gray-50 dark:hover:bg-navy-800/60 transition"
        >
          {working ? (
            <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
          ) : (
            <>
              {/* Se muestra la foto que la página está usando de verdad, no
                  un recuadro abstracto: con el esquema parecía que la sección
                  había quedado sin imagen, y no había forma de saber cuál era
                  "la imagen por defecto" sin abrir el sitio a buscarla. */}
              <img
                src={SITE_IMAGE_DEFAULTS[slot]}
                alt=""
                className="h-14 w-auto rounded object-cover opacity-90"
              />
              <span className="text-gray-400 text-xs text-left">
                {slot === SITE_IMAGE_SLOTS.homeHero
                  ? "Hoy rota una secuencia de fotos, empezando por esta. Subir para reemplazarla por una sola"
                  : "Hoy usa esta imagen. Subir para reemplazarla"}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Cabeceras de las páginas fijas. Antes solo se podían cambiar tocando el
// código; ahora cada una es un casillero acá.
export const SiteImageSlots = () => {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useSiteImages();

  // El PATCH devuelve el mapa completo: se escribe en la caché para que el
  // panel lo muestre al toque, sin esperar los 5 min del GET público.
  const applyResult = (images: SiteImages) =>
    queryClient.setQueryData(SITE_IMAGES_KEY, images);

  return (
    <AdminCard className="p-5 max-w-3xl">
      <h2 className="font-heading uppercase font-semibold text-navy-800 dark:text-white">
        Imágenes de las páginas
      </h2>
      <p className="text-gray-500 dark:text-navy-300 text-sm mt-1">
        La foto de portada de cada sección del sitio.
      </p>

      <div className="flex gap-3 rounded-lg bg-sky-50/60 dark:bg-sky-500/10 p-3 mt-4">
        <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
        <p className="text-xs text-navy-700 dark:text-navy-200">
          Usá fotos apaisadas (más anchas que altas): se recortan al centro, así
          que lo importante conviene que esté en el medio. Cada casillero indica
          su medida recomendada — si la foto es más grande no hay problema (se
          achica sola antes de subirse), pero si es más chica se va a ver
          borrosa. Si una sección no tiene foto, se muestra un fondo gris de la
          marca.
        </p>
      </div>

      {isPending && <SectionLoader />}
      {isError && <SectionError onRetry={() => void refetch()} />}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {SLOT_ORDER.map((slot) => (
            <SlotCard
              key={slot}
              slot={slot}
              imageUrl={data[slot]}
              onSaved={applyResult}
            />
          ))}
        </div>
      )}

      <p className="text-gray-400 dark:text-navy-500 text-xs mt-4">
        Los cambios pueden tardar hasta 5 minutos en verse en el sitio público.
      </p>
    </AdminCard>
  );
};
