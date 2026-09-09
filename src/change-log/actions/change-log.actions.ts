import axios from "axios";
import { petrogasApi, unwrapPaginated } from "@/api/petrogasApi";
import type { ApiEnvelope, ApiErrorEnvelope, Paginated } from "@/api/types";
import type {
  ChangeLogDetail,
  ChangeLogDetailApi,
  ChangeLogEntry,
  ChangeLogEntryApi,
  ChangeLogFilters,
} from "../interfaces/change-log.interface";

const BASE = "/change-log";

// --- La costura ------------------------------------------------------------
// Todo lo que dependa de cómo el backend nombra las cosas vive en estas dos
// funciones. Si el contrato cambia, se tocan acá y la pantalla ni se entera.

const mapearDetalle = (raw: ChangeLogDetailApi): ChangeLogDetail => ({
  campo: raw.fieldLabel ?? "",
  anterior: raw.previousValue ?? null,
  nuevo: raw.newValue ?? null,
  resumen: raw.summary ?? null,
  tipo: raw.valueKind ?? null,
});

export const mapearAsiento = (raw: ChangeLogEntryApi): ChangeLogEntry => ({
  id: raw.id ?? "",
  ocurrioEn: raw.occurredAt ?? "",
  revision: raw.revision ?? null,
  tipoEntidad: raw.entityType ?? null,
  etiquetaEntidad: raw.entityLabel ?? null,
  accion: raw.action ?? null,
  autor: raw.actorLabel ?? null,
  // `details` puede venir vacío o directamente ausente (un alta, por ejemplo).
  detalles: (raw.details ?? []).map(mapearDetalle),
});

// ---------------------------------------------------------------------------

// Los vacíos se omiten en vez de mandarse como cadena vacía: un `from=` pelado
// puede leerse como fecha inválida del otro lado.
const limpiar = (
  filtros: ChangeLogFilters,
): Record<string, string | number> => {
  const params: Record<string, string | number> = {};
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== "") {
      params[clave] = valor;
    }
  }
  return params;
};

export const getChangeLogAction = async (
  filtros: ChangeLogFilters = {},
): Promise<Paginated<ChangeLogEntry>> => {
  const { data } = await petrogasApi.get<ApiEnvelope<ChangeLogEntryApi[]>>(
    BASE,
    {
      params: { page: 1, limit: 20, ...limpiar(filtros) },
    },
  );
  const { data: crudos, meta } = unwrapPaginated(data);
  return { data: crudos.map(mapearAsiento), meta };
};

/**
 * Lee el nombre del archivo del Content-Disposition.
 *
 * Se prioriza `filename*` (RFC 5987), que es el que viaja con acentos
 * codificados; `filename` a secas queda de respaldo.
 */
const nombreDelHeader = (disposition: unknown): string | null => {
  if (typeof disposition !== "string") return null;
  const extendido = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (extendido) return decodeURIComponent(extendido[1].trim());
  const simple = /filename="?([^";]+)"?/i.exec(disposition);
  return simple ? simple[1].trim() : null;
};

/**
 * Cuando se pide un blob, el CUERPO DEL ERROR también llega como blob: el
 * `message` del 400 queda adentro y `getApiErrorMessage` no lo ve. Hay que
 * leerlo como texto para poder mostrar el "acotá el rango" del backend en vez
 * de un error genérico.
 */
const mensajeDeErrorBlob = async (error: unknown): Promise<string | null> => {
  if (!axios.isAxiosError(error)) return null;
  const cuerpo = error.response?.data as unknown;
  if (!(cuerpo instanceof Blob)) return null;
  try {
    const texto = await cuerpo.text();
    const json = JSON.parse(texto) as ApiErrorEnvelope;
    return json.message ?? null;
  } catch {
    // No era JSON: mejor el mensaje genérico de arriba que un volcado crudo.
    return null;
  }
};

export interface ExcelDescargado {
  blob: Blob;
  nombre: string;
}

/**
 * Trae el .xlsx. Se usa fetch autenticado y no un enlace directo porque hay
 * que poder mostrar el 400 de "el rango da demasiadas filas": abriendo la URL
 * en una pestaña, ese error terminaría como una página de JSON en blanco.
 */
export const exportChangeLogAction = async (
  filtros: ChangeLogFilters = {},
): Promise<ExcelDescargado> => {
  try {
    const respuesta = await petrogasApi.get<Blob>(`${BASE}/export`, {
      // page y limit no van: la exportación es del rango entero.
      params: limpiar({ ...filtros, page: undefined, limit: undefined }),
      responseType: "blob",
    });
    return {
      blob: respuesta.data,
      nombre:
        nombreDelHeader(respuesta.headers["content-disposition"]) ??
        "registro-de-cambios.xlsx",
    };
  } catch (error) {
    const mensaje = await mensajeDeErrorBlob(error);
    if (mensaje) throw new Error(mensaje);
    throw error;
  }
};
