import { WifiOff } from "lucide-react";
import { useLocation } from "react-router";
import { cn } from "@/lib/utils";

// Bloque gris que barre. El brillo va en el fondo y no con opacidad para que
// se lea igual sobre el blanco del sitio y sobre el navy del panel.
const Bloque = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "rounded bg-gray-200/80 dark:bg-navy-800 animate-pulse",
      className,
    )}
  />
);

/**
 * Esqueleto: la forma de lo que está por llegar, en vez de un spinner.
 *
 * Va en el sitio público, donde casi todo lo que carga son grillas de
 * tarjetas: servicios, novedades, certificaciones. Se percibe más rápido que
 * un indicador que gira, y sobre todo la página no pega el salto cuando entran
 * los datos, porque el espacio ya estaba tomado.
 */
const Esqueleto = () => (
  <div
    // Es decoración: quien usa un lector de pantalla no gana nada oyendo
    // "seis bloques grises". El aviso de que algo está cargando lo da el
    // aria-busy de la región, no esto.
    aria-hidden="true"
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
  >
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex flex-col gap-3">
        <Bloque className="h-40 rounded-xl" />
        <Bloque className="h-4 w-3/4" />
        <Bloque className="h-3 w-full" />
        <Bloque className="h-3 w-5/6" />
      </div>
    ))}
  </div>
);

/**
 * Anillo: el indicador del panel.
 *
 * Ahí el esqueleto no sirve igual —las pantallas son tablas de alto variable y
 * formularios—, y lo que se quiere es un "estoy trabajando" que no compita con
 * nada de lo que ya hay alrededor.
 */
const Anillo = () => (
  <div
    role="status"
    aria-label="Cargando"
    className="w-10 h-10 rounded-full border-[3px] border-gray-200 dark:border-navy-800 border-t-sky-500 dark:border-t-sky-400 animate-spin"
  />
);

interface SectionLoaderProps {
  className?: string;
  // Para forzar uno de los dos. Sin esto se elige por la ruta.
  variant?: "esqueleto" | "anillo";
}

/**
 * Indicador de carga de una sección.
 *
 * Cuál se usa lo decide la RUTA y no cada pantalla, a propósito: hay más de
 * veinte lugares que llaman a esto, y pedirle a cada uno que elija el suyo
 * garantiza que tarde o temprano alguno quede con el que no va. La regla es
 * una sola —panel o sitio— y vive en un solo lado.
 */
export const SectionLoader = ({ className, variant }: SectionLoaderProps) => {
  const { pathname } = useLocation();
  const cual =
    variant ?? (pathname.startsWith("/admin") ? "anillo" : "esqueleto");

  return (
    <div
      // `aria-busy` es lo que anuncia la espera; el dibujo de adentro es
      // decorativo en el caso del esqueleto.
      aria-busy="true"
      className={cn(
        "flex justify-center",
        cual === "esqueleto" ? "py-10" : "py-16",
        className,
      )}
    >
      {cual === "esqueleto" ? <Esqueleto /> : <Anillo />}
    </div>
  );
};

interface SectionErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const SectionError = ({
  message = "No pudimos cargar esta sección.",
  onRetry,
  className,
}: SectionErrorProps) => (
  <div
    className={cn(
      "flex flex-col items-center gap-3 py-16 text-center",
      className,
    )}
  >
    <WifiOff className="w-8 h-8 text-gray-400" />
    <p className="text-gray-500 text-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-sky-500 font-heading uppercase tracking-wide text-sm hover:underline"
      >
        Reintentar
      </button>
    )}
  </div>
);
