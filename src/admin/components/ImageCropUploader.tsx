import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  AlertTriangle,
  Eraser,
  ImagePlus,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useImageIsBroken } from "@/lib/useLoadableImage";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/api/petrogasApi";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  uploadImageAction,
} from "../actions/media.actions";
import { SlotFigureHint, type SlotFigureKind } from "./SlotFigure";

type OutputType = "image/png" | "image/jpeg";

// Quita un fondo sólido/uniforme: rellena desde los bordes hacia adentro los
// píxeles cercanos al color de las esquinas (flood fill). Solo afecta al fondo
// conectado con el borde, no a colores parecidos dentro del logo.
const removeSolidBackground = (canvas: HTMLCanvasElement, tolerance = 42) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  if (w === 0 || h === 0) return;
  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  const corners = [0, w - 1, (h - 1) * w, (h - 1) * w + (w - 1)];
  let br = 0;
  let bg = 0;
  let bb = 0;
  for (const c of corners) {
    br += data[c * 4];
    bg += data[c * 4 + 1];
    bb += data[c * 4 + 2];
  }
  br /= 4;
  bg /= 4;
  bb /= 4;
  const tol2 = tolerance * tolerance * 3;
  const visited = new Uint8Array(w * h);
  const stack: number[] = [];
  const consider = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    visited[p] = 1;
    const i = p * 4;
    const dr = data[i] - br;
    const dg = data[i + 1] - bg;
    const db = data[i + 2] - bb;
    if (dr * dr + dg * dg + db * db <= tol2) {
      data[i + 3] = 0;
      stack.push(p);
    }
  };
  for (let x = 0; x < w; x++) {
    consider(x, 0);
    consider(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    consider(0, y);
    consider(w - 1, y);
  }
  while (stack.length) {
    const p = stack.pop() as number;
    const x = p % w;
    const y = (p / w) | 0;
    consider(x + 1, y);
    consider(x - 1, y);
    consider(x, y + 1);
    consider(x, y - 1);
  }
  ctx.putImageData(image, 0, 0);
};

// Dibuja el recorte en un canvas a resolución natural (para la vista previa).
const drawCropToCanvas = (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx || !crop.width || !crop.height) return;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const w = Math.max(1, Math.floor(crop.width * scaleX));
  const h = Math.max(1, Math.floor(crop.height * scaleY));
  canvas.width = w;
  canvas.height = h;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, w, h, 0, 0, w, h);
};

// Genera el archivo final: recorta, opcionalmente reduce a maxWidth y quita el
// fondo. JPEG lleva fondo blanco (no soporta transparencia); PNG lo conserva.
const buildOutputFile = async (
  image: HTMLImageElement,
  crop: PixelCrop,
  opts: {
    type: OutputType;
    maxWidth?: number;
    bgRemove: boolean;
    name: string;
  },
): Promise<File> => {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const cropW = crop.width * scaleX;
  const cropH = crop.height * scaleY;
  let outW = cropW;
  let outH = cropH;
  if (opts.maxWidth && outW > opts.maxWidth) {
    outH = outH * (opts.maxWidth / outW);
    outW = opts.maxWidth;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(outW));
  canvas.height = Math.max(1, Math.round(outH));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No pudimos procesar la imagen");
  ctx.imageSmoothingQuality = "high";
  if (opts.type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    cropW,
    cropH,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  if (opts.bgRemove && opts.type === "image/png") removeSolidBackground(canvas);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(
      resolve,
      opts.type,
      opts.type === "image/jpeg" ? 0.9 : undefined,
    ),
  );
  if (!blob) throw new Error("No pudimos procesar la imagen");
  const ext = opts.type === "image/jpeg" ? "jpg" : "png";
  const base = opts.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${base}.${ext}`, { type: opts.type });
};

interface ImageCropUploaderProps {
  label: string;
  hint?: string;
  previewUrl?: string | null;
  onUploaded: (key: string | null) => void;
  // Proporción bloqueada del recorte (ej. 800 / 550). Sin valor: recorte libre.
  aspect?: number;
  outputType?: OutputType;
  // Reduce la salida a este ancho máximo (resolución recomendada del slot).
  maxOutputWidth?: number;
  allowBgRemoval?: boolean;
  // Clases para que la vista previa refleje cómo se ve en el sitio.
  previewBoxClassName?: string;
  previewMediaClassName?: string;
  // Miniatura que ubica el casillero en la página cuando todavía está vacío.
  figure?: SlotFigureKind;
  // Imagen que el sitio ya muestra cuando este casillero está vacío. Sin esto el
  // casillero se ve igual que uno roto y da a entender que la página quedó sin
  // imagen, cuando en realidad tiene una.
  imagenPorDefecto?: string;
  // Qué decir sobre esa imagen. El default habla de la franja de marca, que es
  // el caso más común; una foto de respaldo de un servicio necesita otra frase.
  textoPorDefecto?: string;
}

export const ImageCropUploader = ({
  label,
  hint,
  previewUrl,
  onUploaded,
  aspect,
  outputType = "image/png",
  maxOutputWidth,
  allowBgRemoval = false,
  previewBoxClassName = "h-28 bg-gray-50",
  previewMediaClassName = "max-h-14 w-auto object-contain",
  figure,
  imagenPorDefecto,
  textoPorDefecto = "Hoy la página usa esta imagen de la marca",
}: ImageCropUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // `uploaded` guarda SOLO lo que se subió en esta pasada; mientras no se toque
  // nada manda `previewUrl`. Antes esto era un useState sembrado con el prop, y
  // el valor inicial se lee una única vez: si la imagen guardada llegaba
  // después de montar —la query resuelve asincrónica— el casillero se quedaba
  // mostrando el dropzone vacío aunque la imagen existiera.
  const [uploaded, setUploaded] = useState<string | null>(null);
  // Si la imagen guardada no carga, el casillero no muestra el <img> roto: pasa
  // al estado vacío, pero avisando (abajo) que había una y no se pudo traer. Sin
  // ese aviso sería idéntico a "nunca subí nada", que es otra cosa.
  const savedIsBroken = useImageIsBroken(previewUrl);
  const applied = uploaded ?? (savedIsBroken ? null : (previewUrl ?? null));
  const showMissingNotice = !uploaded && savedIsBroken;
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("imagen");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [bgRemoved, setBgRemoved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    const canvas = previewCanvasRef.current;
    if (!completedCrop?.width || !img || !canvas) return;
    drawCropToCanvas(img, canvas, completedCrop);
    if (bgRemoved) removeSolidBackground(canvas);
  }, [completedCrop, bgRemoved]);

  const pickFile = () => inputRef.current?.click();

  const onFileChange = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("La imagen debe ser PNG, JPEG o WebP");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("La imagen no puede superar los 4 MB");
      return;
    }
    if (editorSrc) URL.revokeObjectURL(editorSrc);
    setFileName(file.name);
    setBgRemoved(false);
    setEditorSrc(URL.createObjectURL(file));
    if (inputRef.current) inputRef.current.value = "";
  };

  const onImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = event.currentTarget;
    if (aspect) {
      const percent = centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
        width,
        height,
      );
      setCrop(percent);
      setCompletedCrop({
        unit: "px",
        x: ((percent.x ?? 0) / 100) * width,
        y: ((percent.y ?? 0) / 100) * height,
        width: ((percent.width ?? 0) / 100) * width,
        height: ((percent.height ?? 0) / 100) * height,
      });
    } else {
      setCrop({ unit: "%", x: 0, y: 0, width: 100, height: 100 });
      setCompletedCrop({ unit: "px", x: 0, y: 0, width, height });
    }
  };

  const resetCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    setBgRemoved(false);
    onImageLoad({ currentTarget: img } as SyntheticEvent<HTMLImageElement>);
  };

  const closeEditor = () => {
    if (editorSrc) URL.revokeObjectURL(editorSrc);
    setEditorSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setBgRemoved(false);
  };

  const apply = async () => {
    if (!imgRef.current || !completedCrop?.width) {
      toast.error("Ajustá el recorte antes de aplicar");
      return;
    }
    setUploading(true);
    try {
      const file = await buildOutputFile(imgRef.current, completedCrop, {
        type: outputType,
        maxWidth: maxOutputWidth,
        bgRemove: bgRemoved,
        name: fileName,
      });
      const media = await uploadImageAction(file);
      setUploaded(media.url);
      onUploaded(media.key);
      closeEditor();
      toast.success("Imagen lista");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No pudimos subir la imagen"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-1.5">
        <p className="font-heading text-sm uppercase tracking-wide text-navy-700 dark:text-navy-200">
          {label}
        </p>
        {hint && (
          <p className="text-gray-400 dark:text-navy-400 text-xs mt-0.5">
            {hint}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => onFileChange(event.target.files?.[0])}
      />

      {applied ? (
        <div className="rounded-lg border border-gray-200 dark:border-navy-700 overflow-hidden">
          <div
            className={cn(
              "flex items-center justify-center overflow-hidden",
              previewBoxClassName,
            )}
          >
            <img src={applied} alt={label} className={previewMediaClassName} />
          </div>
          <button
            type="button"
            onClick={pickFile}
            className="w-full py-2 text-xs font-heading uppercase tracking-wide text-sky-600 dark:text-sky-400 border-t border-gray-200 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-800/60 transition"
          >
            Cambiar imagen
          </button>
        </div>
      ) : (
        // El casillero vacío toma la misma caja que la vista previa: así ya
        // muestra la proporción real de la imagen y no salta de tamaño al subir.
        <button
          type="button"
          onClick={pickFile}
          className={cn(
            "w-full flex items-center justify-center gap-3 rounded-lg border-2 border-dashed transition overflow-hidden",
            // Sin imagen de respaldo el contenido es texto y necesita aire; con
            // imagen, el padding dejaría un marco que la foto no llega a cubrir.
            imagenPorDefecto && !showMissingNotice ? "p-1.5" : "px-3",
            showMissingNotice
              ? "border-amber-500/70 bg-amber-50/60 dark:bg-amber-500/10 hover:border-amber-500"
              : "border-gray-300 dark:border-navy-700 hover:border-sky-400 hover:bg-sky-50/40 dark:hover:bg-navy-800/60",
            previewBoxClassName,
          )}
        >
          {showMissingNotice ? (
            // No se afirma que el archivo no exista: el navegador no distingue
            // un 404 de un servidor que no responde. Se dice lo observable y se
            // indica qué hacer, que sirve en los dos casos.
            <>
              <AlertTriangle className="w-6 h-6 shrink-0 text-amber-600" />
              <span className="text-left">
                <span className="block font-medium text-amber-700 dark:text-amber-500 text-xs">
                  No pudimos cargar esta imagen
                </span>
                <span className="block text-gray-400 dark:text-navy-500 text-[11px] mt-0.5">
                  Recargá la página; si sigue igual, volvé a subirla.
                </span>
              </span>
            </>
          ) : imagenPorDefecto ? (
            // Se muestra la imagen que el sitio usa hoy, no un recuadro
            // abstracto: el casillero está vacío pero la página no, y sin verla
            // parece que falta algo.
            //
            // Ocupa la caja ENTERA, y el texto va afuera (abajo del botón). Con
            // el texto adentro le comía altura a una caja que tiene proporción
            // fija, y el object-cover terminaba recortando: en el banner
            // —que es 4:1— se quedaba con la franja blanca del medio y cortaba
            // las líneas azul y roja, o sea justo lo que hay que reconocer.
            <img
              src={imagenPorDefecto}
              alt=""
              className="w-full h-full rounded object-cover"
            />
          ) : figure ? (
            <SlotFigureHint figure={figure} action="Subir y recortar" />
          ) : (
            <>
              <ImagePlus className="w-6 h-6 text-sky-500" />
              <span className="text-gray-400 text-xs">Subir y recortar</span>
            </>
          )}
        </button>
      )}
      {/* Va afuera del botón: adentro le sacaba altura a la caja y obligaba a
          recortar la imagen. La caja entera sigue siendo clicable. */}
      {!applied && !showMissingNotice && imagenPorDefecto && (
        <p className="text-center mt-1.5">
          <span className="block text-gray-500 dark:text-navy-400 text-[11px]">
            {textoPorDefecto}
          </span>
          <button
            type="button"
            onClick={pickFile}
            className="text-sky-600 dark:text-sky-400 text-xs font-medium hover:underline"
          >
            Subir y recortar para reemplazarla
          </button>
        </p>
      )}

      <Dialog
        open={editorSrc != null}
        onOpenChange={(open) => {
          if (!open && !uploading) closeEditor();
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Recortar imagen</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-navy-300 text-xs mb-2">
                {aspect
                  ? "Arrastrá y ajustá el recorte (proporción fija del slot)."
                  : "Arrastrá para recortar y sacar bordes o espacios sobrantes."}
              </p>
              {editorSrc && (
                <div className="flex justify-center rounded-lg bg-gray-100 dark:bg-navy-950 p-2">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                    aspect={aspect}
                    keepSelection
                  >
                    <img
                      ref={imgRef}
                      src={editorSrc}
                      alt="Recortar"
                      onLoad={onImageLoad}
                      className="max-h-[45vh] w-auto"
                    />
                  </ReactCrop>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetCrop}
                  className="rounded-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restablecer
                </Button>
                {allowBgRemoval && (
                  <Button
                    type="button"
                    variant={bgRemoved ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBgRemoved((value) => !value)}
                    className="rounded-lg"
                  >
                    <Eraser className="w-4 h-4" />
                    {bgRemoved ? "Fondo quitado" : "Quitar fondo"}
                  </Button>
                )}
              </div>
            </div>

            <div>
              <p className="text-gray-500 dark:text-navy-300 text-xs mb-2">
                Vista previa — así se verá en el sitio:
              </p>
              <div
                className={cn(
                  "flex items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 dark:border-navy-700",
                  previewBoxClassName,
                )}
              >
                <canvas
                  ref={previewCanvasRef}
                  className={previewMediaClassName}
                />
              </div>
              {allowBgRemoval && (
                <p className="text-gray-400 dark:text-navy-500 text-[11px] mt-2">
                  “Quitar fondo” funciona con fondos sólidos (blanco o un color
                  uniforme). Para fondos complejos, subí un PNG con
                  transparencia.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeEditor}
              disabled={uploading}
              className="rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void apply()}
              disabled={uploading}
              className="rounded-lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                "Aplicar y subir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
