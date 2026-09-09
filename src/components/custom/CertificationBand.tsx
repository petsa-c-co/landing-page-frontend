import { cn } from "@/lib/utils";
import { SafeImage } from "./SafeImage";
import logo from "@/assets/logo_2-removebg-preview.png";

interface CertificationBandProps {
  // URL absoluta de la marca de Bureau Veritas. Puede no haber ninguna cargada:
  // el logo de la empresa va igual, es la identificación del pie.
  markImage?: string | null;
  scopeText?: string | null;
  className?: string;
}

// Bloque de identificación del pie del sitio: el logo de la empresa y, debajo,
// la marca de certificación. Vive acá y no dentro del footer porque el panel lo
// usa como vista previa: así lo que el admin ve al cargar la marca es
// exactamente lo que sale publicado.
export const CertificationBand = ({
  markImage,
  scopeText,
  className,
}: CertificationBandProps) => (
  <div className={cn("flex flex-col gap-4", className)}>
    {/* Los dos logos van uno al lado del otro, y en celular se envuelven solos
        si no entran a lo ancho. La excepción es 1024-1279: ahí el bloque es una
        columna del pie y en fila mide 423px, que le come el ancho a las columnas
        de enlaces hasta hacerlas envolver. Apilados la columna mide lo que la
        placa más ancha —225px— y la marca de BV conserva los 200px que pide su
        manual. */}
    <div className="flex flex-row flex-wrap items-center gap-4 lg:flex-col lg:items-start xl:flex-row xl:items-center">
      {/* Placas blancas: los dos logos son de colores oscuros y se perderían
          sobre el navy. El h-32 no es estético: con la marca a los 200px que
          pide BV, un logo más chico dejaba de leerse como el "visiblemente
          mayor" que exige la Nota 1 del manual. Con h-32 el logo saca 49% de
          alto (128 contra 86); en superficie apenas empata, así que si alguna
          vez hay que defenderlo en auditoría, subirlo a h-36 da el margen. */}
      <div className="rounded-xl bg-white px-5 py-4 shrink-0">
        <img src={logo} alt="Petrogas S.A" className="h-32 w-auto" />
      </div>
      {/* Si el archivo de la marca se perdió, se omite la placa entera: una
          placa blanca vacía al lado del logo se lee como un error de diseño. */}
      {markImage && (
        <SafeImage
          src={markImage}
          alt="Certificaciones otorgadas por Bureau Veritas"
          loading="lazy"
          // Los 256px salen del manual de BV (rev. 14, pág. 7): en escritorio el
          // sello se muestra a 200px de ancho, 250 como máximo. El archivo
          // oficial mide 1419px de los que 1182 son el sello, así que estos
          // 240px de imagen lo dejan justo en 200, más el padding.
          // El ancho es el mismo en todos los breakpoints: entre 1024 y 1279 la
          // columna igual entra porque ahí las dos placas se apilan (ver el
          // lg:flex-col de arriba).
          // La zona de protección la trae el propio archivo —118px de aire en
          // los cuatro lados, unos 20px a esta escala—, así que el p-2 es
          // margen de sobra. Ojo: ese aire tiene que estar PAREJO. Un archivo
          // con más espacio abajo que arriba se dibuja igual, vacío incluido, y
          // el sello queda descolgado dentro de la placa.
          className="w-[256px] h-auto shrink-0 rounded-xl bg-white p-2"
        />
      )}
    </div>
    {/* El alcance va a la vista: el manual prohíbe esconderlo detrás de un
        clic, un tooltip o un acordeón. El max-w lo frena antes de que se
        estire a los 1216px de la fila y quede ilegible de tan largo. */}
    {scopeText && (
      <p className="text-navy-300 text-xs max-w-3xl">{scopeText}</p>
    )}
  </div>
);
