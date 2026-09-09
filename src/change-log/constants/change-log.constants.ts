// Los endpoints ya responden. Quedó el interruptor por si hay que apagar la
// sección sin revertir el resto.
export const REGISTRO_DE_CAMBIOS_ACTIVO = true;

/**
 * Etiqueta y color de cada acción.
 *
 * Los cinco matices están repartidos a propósito, sin vecinos cerca: verde
 * 154°, ámbar 91°, rojo 19°, celeste 230°, violeta 293°. `restauracion` está
 * en violeta y no en índigo porque el índigo quedaba a 44° del celeste de
 * `modificacion` y, sobre un panel que ya es azul marino, las dos se
 * confundían al recorrer la columna.
 *
 * `eliminacion` es el borrado definitivo y va en rojo para que nunca se
 * confunda con `baja`, que es la papelera y se deshace.
 *
 * En oscuro el relleno va al 20% y el texto al tono 300, no al 400: sobre el
 * navy-900 de la tarjeta, un relleno al 10% es indistinguible del fondo y la
 * etiqueta deja de leerse como etiqueta.
 */
export const ACCION_INFO: Record<string, { label: string; clase: string }> = {
  creacion: {
    label: "Creación",
    clase:
      "bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/20 dark:text-green-300 dark:ring-green-500/40",
  },
  modificacion: {
    label: "Modificación",
    clase:
      "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:ring-sky-500/40",
  },
  baja: {
    label: "Baja",
    clase:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/40",
  },
  restauracion: {
    label: "Restauración",
    clase:
      "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:ring-violet-500/40",
  },
  eliminacion: {
    label: "Eliminación definitiva",
    clase:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-500/40",
  },
};

// Gris para cualquier acción que el backend agregue después: el asiento se
// muestra igual. Esconderlo sería lo peor que puede hacer un registro de
// auditoría.
export const ACCION_DESCONOCIDA = {
  clase:
    "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-navy-700 dark:text-navy-100 dark:ring-navy-600",
};

/**
 * Tipos de entidad para el desplegable del filtro. Los siete que documenta el
 * backend.
 *
 * En la tabla no se usa este mapa como filtro: ahí se muestra lo que venga,
 * traducido si está acá y crudo si no. Un tipo nuevo del backend aparece igual
 * en el listado; lo único que le faltaría es la opción del desplegable.
 */
export const TIPOS_DE_ENTIDAD: Record<string, string> = {
  certificacion: "Certificaciones",
  novedad: "Novedades y Prensa",
  servicio: "Servicios",
  cliente: "Clientes",
  titulo: "Títulos",
  configuracion: "Configuración del sitio",
  "imagen-del-sitio": "Imágenes del sitio",
};

export const etiquetaDeTipo = (tipo: string | null): string =>
  (tipo && TIPOS_DE_ENTIDAD[tipo]) || tipo || "—";
