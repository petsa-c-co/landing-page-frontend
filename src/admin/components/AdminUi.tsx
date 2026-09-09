import { useState, type ComponentProps, type ReactNode } from "react";
import { AlertTriangle, ImageOff, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const AdminPageHeader = ({
  title,
  description,
  action,
}: AdminPageHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
    <div>
      <h1 className="font-heading uppercase font-semibold text-navy-800 dark:text-white text-2xl">
        {title}
      </h1>
      {description && (
        <p className="text-gray-500 dark:text-navy-300 text-sm mt-1">
          {description}
        </p>
      )}
    </div>
    {action}
  </div>
);

export const AdminCard = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn(
      "bg-white dark:bg-navy-900 ring-1 ring-gray-200 dark:ring-navy-800 rounded-xl overflow-hidden",
      className,
    )}
    {...props}
  />
);

// Miniatura de listado. Cuando el item no tiene imagen cargada ocupa el mismo
// lugar con un marcador, así las filas no se desalinean. Una clave sin archivo
// detrás cae en ese mismo marcador: el ícono de imagen rota del navegador no
// dice nada y encima descoloca la fila.
export const Thumb = ({
  src,
  alt = "",
  className,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) => {
  const [broken, setBroken] = useState<string | null>(null);
  // `broken === src` a secas comparaba null con null y daba TRUE: cualquier
  // fila sin imagen —que es lo que devuelve la API, `cardImage: null`— salía
  // con el triángulo ámbar de "no se pudo cargar" en vez del gris de "no hay
  // ninguna". Se exige que haya un src antes de considerarlo roto.
  const fallo = Boolean(src) && broken === src;

  return src && !fallo ? (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(src)}
      className={cn("w-12 h-12 rounded object-cover shrink-0", className)}
    />
  ) : (
    // Dos marcadores distintos a propósito: gris es "nunca se subió nada" y
    // ámbar es "hay una cargada que no se pudo traer". Confundirlos deja al
    // admin sin saber cuál hay que arreglar.
    <div
      // El gris es decorativo (la fila ya dice que no hay imagen); el ámbar
      // avisa de un problema, así que sí se anuncia.
      aria-hidden={fallo ? undefined : true}
      role={fallo ? "img" : undefined}
      aria-label={fallo ? `No pudimos cargar la imagen de ${alt}` : undefined}
      title={
        fallo
          ? "No pudimos cargar esta imagen. Recargá la página; si sigue igual, volvé a subirla."
          : "Sin imagen"
      }
      className={cn(
        "w-12 h-12 rounded shrink-0 flex items-center justify-center ring-1 ring-inset",
        fallo
          ? "bg-amber-50 dark:bg-amber-500/10 ring-amber-300 dark:ring-amber-500/40"
          : "bg-gray-100 dark:bg-navy-800 ring-gray-200 dark:ring-navy-700",
        className,
      )}
    >
      {fallo ? (
        <AlertTriangle className="w-4 h-4 text-amber-600" />
      ) : (
        <ImageOff className="w-4 h-4 text-gray-300 dark:text-navy-600" />
      )}
    </div>
  );
};

export const EmptyState = ({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center gap-3 py-16 text-center">
    <Inbox className="w-8 h-8 text-gray-300 dark:text-navy-600" />
    <p className="text-gray-500 dark:text-navy-300 text-sm">{message}</p>
    {action}
  </div>
);

// Tabla con scroll horizontal propio: en pantallas chicas, en vez de aplastar
// las columnas, mantiene un ancho mínimo legible y se desliza en horizontal.
export const AdminTable = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[46rem] text-sm">{children}</table>
  </div>
);

export const Th = ({ className, ...props }: ComponentProps<"th">) => (
  <th
    className={cn(
      "text-left font-heading uppercase text-xs tracking-wide text-gray-500 dark:text-navy-400 px-4 py-3 whitespace-nowrap",
      className,
    )}
    {...props}
  />
);

export const Td = ({ className, ...props }: ComponentProps<"td">) => (
  <td
    className={cn(
      "px-4 py-3 text-navy-800 dark:text-navy-100 align-middle",
      className,
    )}
    {...props}
  />
);

export const IconButton = ({
  className,
  ...props
}: ComponentProps<"button">) => (
  <button
    type="button"
    className={cn(
      "p-2 rounded-lg text-gray-400 dark:text-navy-400 hover:text-navy-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800 transition",
      className,
    )}
    {...props}
  />
);
