import { Link } from "react-router";
import type { ReactNode } from "react";
import { useLoadableImage } from "@/lib/useLoadableImage";
import { cn } from "@/lib/utils";
import { useSiteImages } from "@/site-settings/hooks/useSiteImages";
import {
  SITE_IMAGE_DEFAULTS,
  type SiteImageSlot,
} from "@/site-settings/interfaces/site-images.interface";
import { AccentBar } from "./AccentBar";

interface PageHeroProps {
  eyebrow: ReactNode;
  title: string;
  // Imagen propia de la entidad (ej. el banner de un servicio). Tiene
  // prioridad: es más específica que la cabecera genérica de la sección.
  image?: string | null;
  // Cabecera editable desde el panel para esta página.
  slot?: SiteImageSlot;
}

export const PageHero = ({ eyebrow, title, image, slot }: PageHeroProps) => {
  const { data: siteImages } = useSiteImages();

  // Una foto (de la entidad o cargada en el panel) es impredecible: lleva velo
  // oscuro encima y el texto va en blanco. El banner de marca del proyecto es
  // claro y ya viene diseñado, así que va limpio y con el texto en navy.
  // Si el archivo no está (clave viva en la base, objeto perdido), se trata
  // como si no hubiera foto: cae en el banner de marca, que es el default
  // diseñado para estas cabeceras, y no en el degradado gris.
  const photo = useLoadableImage(
    image ?? (slot ? siteImages?.[slot] : undefined) ?? null,
  );
  const background =
    photo ??
    (slot ? SITE_IMAGE_DEFAULTS[slot] : SITE_IMAGE_DEFAULTS["banner-nosotros"]);
  const onLightBanner = !photo;

  return (
    <section
      className={cn(
        "relative flex items-center",
        // La sección toma la proporción 4:1 del banner (1920×480), así no se
        // recortan las franjas curvas de arriba y abajo. En pantallas chicas
        // eso daría una franja demasiado baja para el título, así que ahí manda
        // la altura mínima y sí se recorta un poco.
        "min-h-[200px] md:min-h-0 md:aspect-[1920/480]",
      )}
      style={{
        backgroundImage: photo
          ? `linear-gradient(rgba(13,21,48,.85),rgba(28,47,107,.7)), url('${background}')`
          : `url('${background}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className={cn(
          "max-w-7xl page-container w-full",
          // Sobre una foto el texto va abajo; sobre el banner de marca va
          // centrado, porque las franjas ocupan el borde inferior.
          onLightBanner ? "" : "pb-0 md:pb-10",
        )}
      >
        <p
          className={cn(
            "font-heading uppercase tracking-[.2em] text-sm mb-2",
            onLightBanner ? "text-petrogas-red-500" : "text-sky-400",
          )}
        >
          {eyebrow}
        </p>
        <h1
          className={cn(
            "font-heading uppercase font-bold text-4xl md:text-5xl",
            onLightBanner ? "text-navy-800" : "text-white",
          )}
        >
          {title}
        </h1>
        <AccentBar className="mt-5" tone={onLightBanner ? "navy" : "sky"} />
      </div>
    </section>
  );
};

export const ServiceBreadcrumb = ({ label }: { label: string }) => (
  <>
    <Link to="/servicios" className="hover:underline">
      Servicios
    </Link>{" "}
    / {label}
  </>
);
