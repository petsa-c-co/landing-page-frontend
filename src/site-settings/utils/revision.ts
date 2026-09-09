import { SITE_REVISION } from "@/constants/site";
import type { SiteSettings } from "../interfaces/site-settings.interface";

// Abreviaturas en castellano, con punto, como las usa el manual de Bureau
// Veritas ("Rev. 14 - Ene. 2025"). No se usa Intl: `toLocaleDateString` con
// "es" devuelve "ago" sin punto y con la caja según el navegador, así que el
// pie cambiaría de aspecto de una máquina a otra.
const MESES = [
  "Ene.",
  "Feb.",
  "Mar.",
  "Abr.",
  "May.",
  "Jun.",
  "Jul.",
  "Ago.",
  "Sep.",
  "Oct.",
  "Nov.",
  "Dic.",
] as const;

/**
 * "2026-08-27" -> "Ago. 2026". Devuelve null si la fecha no es utilizable.
 *
 * Se parte el string a mano en vez de usar `new Date(iso)`: esa forma
 * interpreta una fecha sin hora como UTC medianoche, y al oeste de Greenwich
 * —acá, UTC-3— el 1 de septiembre se mostraría como agosto. Un mes de menos en
 * el pie de un documento controlado no es un detalle.
 */
export const formatearMesYAnio = (
  iso: string | null | undefined,
): string | null => {
  if (!iso) return null;
  const partes = /^(\d{4})-(\d{2})/.exec(iso);
  if (!partes) return null;
  const mes = Number(partes[2]);
  if (mes < 1 || mes > 12) return null;
  return `${MESES[mes - 1]} ${partes[1]}`;
};

export interface RevisionMostrada {
  numero: string;
  fecha: string;
}

/**
 * Qué revisión muestra el pie del sitio.
 *
 * El número lo lleva el backend, ya con su formato final ("01", "02", …): sube
 * solo, una revisión por cada día en que se cambió algo, y nadie lo edita a
 * mano. Eso es lo que lo hace válido ante un auditor.
 *
 * OJO SI VAS A MOSTRAR ESTE NÚMERO EN OTRO LADO: la etiqueta **da la vuelta**.
 * Después de la 99 vuelve a "01", así que la revisión 1 y la 100 se escriben
 * igual y lo único que las distingue es la fecha. Por eso el número nunca va
 * solo —ni en un encabezado, ni en un badge, ni en un tooltip—: siempre pegado
 * a su fecha. Dos revisiones que se ven idénticas y no se pueden distinguir
 * son un problema de verdad en un registro de auditoría.
 *
 * El contador interno del backend no da la vuelta y sigue siendo único, así
 * que el orden cronológico no depende de esta etiqueta.
 *
 * Los dos respaldos existen por motivos distintos:
 *
 * - Sin `revisionDate` (todavía no hubo ningún cambio registrado) se usa la
 *   fecha del despliegue, que es la constante local.
 * - Sin `revision` se usa la constante entera. Es el caso mientras el backend
 *   no publique los campos: el pie sigue mostrando lo de siempre en vez de
 *   quedar en blanco o con un "Rev. undefined".
 */
export const revisionMostrada = (
  settings: SiteSettings | undefined,
): RevisionMostrada => {
  if (!settings?.revision) {
    return { numero: SITE_REVISION.numero, fecha: SITE_REVISION.fecha };
  }
  return {
    numero: settings.revision,
    fecha: formatearMesYAnio(settings.revisionDate) ?? SITE_REVISION.fecha,
  };
};
