import flotaBase from "@/assets/fotos/flota-base.webp";
import micros from "@/assets/fotos/micros.webp";
import equipoAtardecer from "@/assets/fotos/equipo-atardecer.webp";
import plantaDeNoche from "@/assets/fotos/zona-2.webp";
import type { Service } from "../interfaces/service.interface";

/**
 * Fotos de respaldo para los DOS servicios fundacionales, mientras nadie suba
 * una desde el panel.
 *
 * Por qué existe, si los servicios son datos del backend: estos dos vienen
 * sembrados y no se dan de baja —son los que presta la empresa—, así que
 * dejarlos con el degradado gris es peor que fijarles una foto. Cualquier OTRO
 * servicio no lleva default: el frontend no puede saber qué foto le
 * corresponde a algo que todavía no existe, y ahí el degradado sigue siendo la
 * respuesta correcta.
 *
 * OJO: la clave es el SLUG. Si alguien lo renombra desde el panel, el respaldo
 * deja de aplicar en silencio y vuelve el degradado. Es el precio de atar
 * contenido a una constante del código; la alternativa sin ataduras es subir
 * la foto desde el panel, que además vale para cualquier servicio futuro.
 *
 * Sobre la ELECCIÓN de cada foto: `tarjeta` se recorta apaisada y bastante
 * baja, así que necesita una imagen con el motivo repartido a lo ancho —una
 * vertical queda en un pedazo de cielo—. `detalle` va en un bloque casi
 * cuadrado y grande, y ahí entra bien una foto con gente trabajando.
 */
const POR_SLUG: Record<string, { tarjeta: string; detalle: string }> = {
  "operacion-y-mantenimiento": {
    // La planta de procesamiento de noche: es literalmente lo que dice el
    // servicio, "Plantas de Procesamiento de Crudo y Gas".
    tarjeta: plantaDeNoche,
    // La cuadrilla en la plataforma al atardecer. Es vertical, que es
    // justo lo que pide ese bloque alto, y muestra gente trabajando.
    detalle: equipoAtardecer,
  },
  "transporte-de-personal": {
    tarjeta: micros,
    detalle: flotaBase,
  },
};

/**
 * El respaldo de un servicio, SIN mirar lo que haya cargado en el panel.
 *
 * Lo usa el formulario de edición: ahí la imagen guardada ya se muestra por su
 * cuenta, y lo que hace falta saber es qué se ve HOY en la página cuando el
 * casillero está vacío. Devuelve undefined para cualquier servicio que no sea
 * uno de los dos fundacionales.
 */
export const respaldoDe = (
  slug: string | undefined,
): { tarjeta: string; detalle: string } | undefined =>
  slug ? POR_SLUG[slug] : undefined;

/**
 * Imagen de la tarjeta del listado y de la portada. Lo cargado en el panel
 * gana siempre; el respaldo solo aparece si no hay nada.
 */
export const imagenDeTarjeta = (service: Service): string | null =>
  service.cardImage ?? POR_SLUG[service.slug]?.tarjeta ?? null;

/**
 * Imagen que acompaña al listado de items dentro de la página del servicio.
 *
 * El banner de la cabecera NO tiene respaldo acá a propósito: esa franja es
 * 4:1 y ya cae en la banda de marca, que está diseñada para esa proporción.
 * Una foto vertical ahí se recortaría a un pedazo irreconocible.
 */
export const imagenDeDetalle = (service: Service): string | null =>
  service.detailImage ?? POR_SLUG[service.slug]?.detalle ?? null;
