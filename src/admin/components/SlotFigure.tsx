import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// Miniatura de la página con el lugar de la imagen resaltado. En un casillero
// vacío el nombre solo ("Banner de la página", "Imagen del detalle") no alcanza
// para saber qué se está por subir: el dibujito lo ubica de un vistazo, sin
// tener que abrir el sitio público a buscarlo.
export type SlotFigureKind = "hero" | "banner" | "split" | "card" | "logo"

const SLOT_FIGURE_CAPTION: Record<SlotFigureKind, string> = {
  hero: "Ocupa toda la pantalla de inicio, detrás del título",
  banner: "Franja de arriba, detrás del título de la sección",
  split: "Al costado del texto, dentro de la página",
  card: "En la tarjeta del listado",
  logo: "Entre los logos de clientes",
}

// Gris para lo que rodea, celeste para el hueco que se está por llenar.
const BASE = "fill-gray-300 dark:fill-navy-700"
const MARK = "fill-sky-400 dark:fill-sky-500"

const FIGURES: Record<SlotFigureKind, ReactNode> = {
  hero: (
    <>
      <rect className={BASE} x="0" y="0" width="96" height="7" rx="1.5" />
      <rect className={MARK} x="0" y="10" width="96" height="34" rx="2" />
      <rect className={BASE} x="8" y="49" width="46" height="4" rx="2" />
      <rect className={BASE} x="8" y="57" width="70" height="4" rx="2" />
    </>
  ),
  banner: (
    <>
      <rect className={BASE} x="0" y="0" width="96" height="7" rx="1.5" />
      <rect className={MARK} x="0" y="10" width="96" height="14" rx="2" />
      <rect className={BASE} x="8" y="30" width="80" height="5" rx="2.5" />
      <rect className={BASE} x="8" y="40" width="62" height="5" rx="2.5" />
      <rect className={BASE} x="8" y="50" width="74" height="5" rx="2.5" />
    </>
  ),
  split: (
    <>
      <rect className={BASE} x="0" y="0" width="96" height="7" rx="1.5" />
      <rect className={MARK} x="4" y="14" width="42" height="38" rx="2" />
      <rect className={BASE} x="54" y="17" width="36" height="5" rx="2.5" />
      <rect className={BASE} x="54" y="27" width="32" height="5" rx="2.5" />
      <rect className={BASE} x="54" y="37" width="36" height="5" rx="2.5" />
      <rect className={BASE} x="54" y="47" width="22" height="5" rx="2.5" />
    </>
  ),
  card: (
    <>
      <rect className={BASE} x="0" y="0" width="96" height="7" rx="1.5" />
      {/* Las tres tarjetas tienen el mismo contorno; en la primera se pinta
          solo la mitad de arriba, que es la parte que ocupa la foto. */}
      <rect className={BASE} x="4" y="16" width="28" height="34" rx="2" />
      <rect className={BASE} x="34" y="16" width="28" height="34" rx="2" />
      <rect className={BASE} x="64" y="16" width="28" height="34" rx="2" />
      <path
        className={MARK}
        d="M6 16h24a2 2 0 0 1 2 2v17H4V18a2 2 0 0 1 2-2z"
      />
    </>
  ),
  logo: (
    <>
      <rect className={BASE} x="0" y="0" width="96" height="7" rx="1.5" />
      <rect className={BASE} x="30" y="14" width="36" height="5" rx="2.5" />
      <rect className={BASE} x="4" y="28" width="15" height="11" rx="2" />
      <rect className={BASE} x="23" y="28" width="15" height="11" rx="2" />
      <rect className={MARK} x="42" y="28" width="15" height="11" rx="2" />
      <rect className={BASE} x="61" y="28" width="15" height="11" rx="2" />
      <rect className={BASE} x="80" y="28" width="12" height="11" rx="2" />
    </>
  ),
}

export const SlotFigure = ({
  figure,
  className,
}: {
  figure: SlotFigureKind
  className?: string
}) => (
  <svg
    viewBox="0 0 96 64"
    aria-hidden="true"
    className={cn("shrink-0", className)}
  >
    {FIGURES[figure]}
  </svg>
)

// Miniatura + la frase que dice dónde cae la imagen. Va dentro del botón del
// casillero vacío, así que son <span> y no <p>.
export const SlotFigureHint = ({
  figure,
  action,
}: {
  figure: SlotFigureKind
  action: string
}) => (
  <>
    <SlotFigure figure={figure} className="w-16 sm:w-20" />
    <span className="text-left">
      <span className="block font-medium text-gray-500 dark:text-navy-300 text-xs">
        {action}
      </span>
      <span className="block text-gray-400 dark:text-navy-500 text-[11px] mt-0.5">
        {SLOT_FIGURE_CAPTION[figure]}
      </span>
    </span>
  </>
)
