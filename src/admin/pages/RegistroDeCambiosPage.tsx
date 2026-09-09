import { useState } from "react";
import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { ChevronRight, Download, Info } from "lucide-react";
import { toast } from "sonner";
import {
  AdminCard,
  AdminPageHeader,
  AdminTable,
  EmptyState,
  Td,
  Th,
} from "../components/AdminUi";
import { AdminSelect } from "../components/AdminSelect";
import { ListShell } from "../components/ListShell";
import { Pagination } from "../components/Pagination";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { getApiErrorMessage } from "@/api/petrogasApi";
import { cn } from "@/lib/utils";
import { exportChangeLogAction } from "@/change-log/actions/change-log.actions";
import { useChangeLog } from "@/change-log/hooks/useChangeLog";
import {
  ACCION_DESCONOCIDA,
  ACCION_INFO,
  TIPOS_DE_ENTIDAD,
  etiquetaDeTipo,
} from "@/change-log/constants/change-log.constants";
import type {
  ChangeLogDetail,
  ChangeLogEntry,
} from "@/change-log/interfaces/change-log.interface";

// Fecha y hora local. El asiento viene con timestamp completo y la hora
// importa: puede haber varios cambios el mismo día.
const formatearMomento = (iso: string): string => {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Etiqueta = ({ accion }: { accion: string | null }) => {
  const info = accion ? ACCION_INFO[accion] : undefined;
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 whitespace-nowrap",
        info?.clase ?? ACCION_DESCONOCIDA.clase,
      )}
    >
      {info?.label ?? accion ?? "—"}
    </span>
  );
};

/**
 * Una fecha suelta se muestra en formato local, pero SOLO si llega en ISO
 * estricto.
 *
 * El contrato no aclara si los valores de `valueKind: "fecha"` vienen crudos o
 * ya formateados —de los booleanos sí aclara que llegan como "Sí"/"No"—, así
 * que cualquier cosa que no calce con AAAA-MM-DD pasa de largo sin tocarse. Si
 * mañana mandan "01/01/2027", se muestra tal cual en vez de romperse.
 *
 * Se parte a mano por lo mismo que en el pie del sitio: `new Date("2027-01-01")`
 * es UTC medianoche y en UTC-3 se dibuja como el 31 de diciembre.
 */
const formatearFechaSuelta = (texto: string): string => {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : texto;
};

const Valor = ({
  texto,
  tipo,
}: {
  texto: string | null;
  tipo: string | null;
}) => {
  // Un valor ausente se dibuja como guion y no como celda vacía: en un registro
  // de auditoría, "acá no había nada" es un dato, no un hueco.
  if (!texto) {
    return <span className="text-gray-400 dark:text-navy-500">—</span>;
  }
  // Los booleanos llegan ya como "Sí"/"No": como chip se leen de un vistazo al
  // recorrer una columna, que es justo lo que se hace auditando.
  if (tipo === "booleano") {
    return (
      <span className="inline-block rounded px-1.5 py-0.5 bg-gray-100 dark:bg-navy-800 text-[11px]">
        {texto}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "break-words",
        // Alinea las cifras entre sí para poder compararlas de un vistazo.
        (tipo === "numero" || tipo === "fecha") && "tabular-nums",
      )}
    >
      {tipo === "fecha" ? formatearFechaSuelta(texto) : texto}
    </span>
  );
};

const Detalle = ({ detalle }: { detalle: ChangeLogDetail }) => {
  // Un campo largo (el cuerpo de una nota) trae resumen y NADA de valores: no
  // se guardan 100.000 caracteres por edición. Un archivo trae las dos cosas,
  // y ahí los nombres son el dato útil.
  const hayValores = detalle.anterior !== null || detalle.nuevo !== null;

  return (
    <div className="py-2.5 first:pt-0 last:pb-0">
      <p className="font-medium text-navy-800 dark:text-navy-100 text-xs mb-1">
        {detalle.campo || "—"}
      </p>
      {detalle.resumen && (
        <p className="text-gray-600 dark:text-navy-300 text-xs">
          {detalle.resumen}
        </p>
      )}
      {hayValores &&
        (detalle.resumen ? (
          // Con resumen, los valores pasan a ser el apoyo: una línea al pie con
          // el "de esto a esto", que en los archivos son los dos nombres.
          <p className="text-gray-500 dark:text-navy-400 text-[11px] mt-1 break-all">
            {detalle.anterior ?? "—"} → {detalle.nuevo ?? "—"}
          </p>
        ) : (
          // Acotado: a lo ancho de una pantalla grande, "Después" terminaba a
          // medio metro de "Antes" y había que barrer la vista para comparar
          // dos textos que suelen diferir en una palabra.
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs max-w-3xl">
            <div>
              <span className="text-gray-400 dark:text-navy-500">Antes: </span>
              <span className="text-gray-600 dark:text-navy-300">
                <Valor texto={detalle.anterior} tipo={detalle.tipo} />
              </span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-navy-500">
                Después:{" "}
              </span>
              <span className="text-navy-800 dark:text-navy-100">
                <Valor texto={detalle.nuevo} tipo={detalle.tipo} />
              </span>
            </div>
          </div>
        ))}
    </div>
  );
};

interface GrupoDeRevision {
  revision: string | null;
  asientos: ChangeLogEntry[];
}

// El número de revisión da la vuelta: después de la 99 vuelve a "01". Dos
// revisiones con la MISMA etiqueta quedan a 99 días de distancia como mínimo,
// así que este margen las separa sin ambigüedad. Y como una revisión cubre un
// solo día, adentro de una los asientos nunca se alejan tanto —ni contando el
// desfasaje de zona horaria—, así que tampoco parte una revisión al medio.
const MARGEN_MISMA_REVISION_MS = 48 * 60 * 60 * 1000;

/**
 * Parte la página en bloques por revisión.
 *
 * Se agrupan los CONSECUTIVOS, no por clave: el listado viene ordenado por
 * fecha, así que los de una misma revisión ya llegan juntos. Agrupar por clave
 * podría juntar bloques separados y romper el orden cronológico, que en un
 * registro de auditoría es el dato principal.
 *
 * Además del número se mira la CERCANÍA EN EL TIEMPO, por la vuelta a "01":
 * con un filtro puesto, el asiento de la revisión 1 puede quedar pegado al de
 * la 100 si nada del medio pasa el filtro. Sin esto, los dos caerían bajo una
 * misma cabecera "Rev. 01" con 99 días de diferencia adentro.
 *
 * Un grupo puede quedar partido entre dos páginas. Es correcto: cada página
 * muestra su cabecera con el mismo número, igual que un listado impreso.
 */
const agruparPorRevision = (asientos: ChangeLogEntry[]): GrupoDeRevision[] =>
  asientos.reduce<GrupoDeRevision[]>((grupos, asiento) => {
    const ultimo = grupos.at(-1);
    const previo = ultimo?.asientos.at(-1);
    const cerca =
      previo !== undefined &&
      Math.abs(
        new Date(previo.ocurrioEn).getTime() -
          new Date(asiento.ocurrioEn).getTime(),
      ) < MARGEN_MISMA_REVISION_MS;

    if (ultimo && ultimo.revision === asiento.revision && cerca) {
      ultimo.asientos.push(asiento);
    } else {
      grupos.push({ revision: asiento.revision, asientos: [asiento] });
    }
    return grupos;
  }, []);

// Solo el día: la hora exacta es de cada asiento, no de la revisión.
const formatearDia = (iso: string): string => {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Una revisión, plegable, con sus cambios adentro.
 *
 * Arranca abierta solo la primera. Con todo desplegado la página vuelve a ser
 * el muro de filas de antes; con todo plegado hay que hacer dos clics para ver
 * algo. Abrir la más reciente muestra en qué se está trabajando y deja el
 * historial anterior a un clic.
 */
const GrupoDesplegable = ({
  grupo,
  inicialmenteAbierto,
}: {
  grupo: GrupoDeRevision;
  inicialmenteAbierto: boolean;
}) => {
  const [abierto, setAbierto] = useState(inicialmenteAbierto);

  return (
    <>
      <tr
        className="cursor-pointer bg-navy-50 dark:bg-navy-800 border-t-2 border-navy-200 dark:border-navy-700 hover:bg-navy-100 dark:hover:bg-navy-700"
        onClick={() => setAbierto((v) => !v)}
      >
        <Td colSpan={5} className="py-2.5">
          <div className="flex flex-wrap items-center gap-x-3">
            <ChevronRight
              aria-hidden="true"
              className={cn(
                "w-4 h-4 shrink-0 text-navy-400 transition-transform",
                abierto && "rotate-90",
              )}
            />
            <span className="font-heading uppercase tracking-wide text-navy-800 dark:text-white text-xs tabular-nums">
              Rev. {grupo.revision ?? "—"}
            </span>
            <span className="text-gray-500 dark:text-navy-400 text-[11px] tabular-nums">
              {formatearDia(grupo.asientos[0].ocurrioEn)}
            </span>
            <span className="text-gray-500 dark:text-navy-400 text-[11px]">
              {grupo.asientos.length}{" "}
              {grupo.asientos.length === 1 ? "cambio" : "cambios"}
            </span>
          </div>
        </Td>
      </tr>
      {abierto &&
        grupo.asientos.map((asiento, indice) => (
          <Fila key={asiento.id} asiento={asiento} indice={indice} />
        ))}
    </>
  );
};

const Fila = ({
  asiento,
  indice,
}: {
  asiento: ChangeLogEntry;
  indice: number;
}) => {
  const [abierto, setAbierto] = useState(false);
  const tieneDetalle = asiento.detalles.length > 0;

  return (
    <>
      <tr
        className={cn(
          // El borde gris claro casi no se veía en modo claro y las filas se
          // confundían entre sí. La cebra hace el trabajo pesado y el borde
          // acompaña. Va por índice y no con odd:/even: de CSS porque entre
          // fila y fila se intercala la del detalle, que rompería la
          // alternancia.
          "border-t border-gray-200 dark:border-navy-800",
          // Los dos tonos están medidos con getComputedStyle, no elegidos a
          // ojo: gray-50 estaba a un 1,5% del blanco y no se distinguía, y
          // navy-900/40 sobre la tarjeta —que ES navy-900— daba exactamente
          // navy-900, o sea nada. El claro sube a gray-100 y el oscuro pasa a
          // navy-950, que es más oscuro que la tarjeta en vez de igual.
          indice % 2 === 1 && "bg-gray-100 dark:bg-navy-950/70",
          tieneDetalle &&
            "cursor-pointer hover:bg-sky-50/70 dark:hover:bg-navy-800/60",
        )}
        onClick={tieneDetalle ? () => setAbierto((v) => !v) : undefined}
      >
        <Td className="whitespace-nowrap tabular-nums text-xs">
          {formatearMomento(asiento.ocurrioEn)}
        </Td>
        <Td>
          <p className="font-medium">{asiento.etiquetaEntidad ?? "—"}</p>
          <p className="text-gray-500 dark:text-navy-400 text-xs">
            {etiquetaDeTipo(asiento.tipoEntidad)}
          </p>
        </Td>
        <Td>
          <Etiqueta accion={asiento.accion} />
        </Td>
        <Td className="text-xs text-gray-600 dark:text-navy-300 break-all">
          {asiento.autor ?? "—"}
        </Td>
        <Td className="w-10">
          {tieneDetalle ? (
            <ChevronRight
              aria-hidden="true"
              className={cn(
                "w-4 h-4 text-gray-400 transition-transform",
                abierto && "rotate-90",
              )}
            />
          ) : null}
        </Td>
      </tr>
      {abierto && (
        <tr className="bg-sky-50/60 dark:bg-sky-500/10">
          <Td colSpan={5} className="px-4 py-3">
            {/* El riel y el título vuelven a nombrar el elemento. Sin esto el
                detalle queda flotando y un campo llamado "Categoría" no dice
                categoría DE QUÉ: la respuesta está una línea más arriba, pero
                con varias filas abiertas a la vez deja de ser evidente. */}
            <div className="border-l-2 border-sky-400 dark:border-sky-500 pl-4">
              <p className="font-heading uppercase tracking-wide text-[10px] text-gray-400 dark:text-navy-500 mb-2">
                Campos modificados en{" "}
                <span className="text-gray-600 dark:text-navy-300">
                  {asiento.etiquetaEntidad ?? "este elemento"}
                </span>
              </p>
              <div className="divide-y divide-gray-200 dark:divide-navy-800">
                {asiento.detalles.map((detalle, indice) => (
                  <Detalle
                    // No hay id por detalle: el campo puede repetirse dentro de
                    // un mismo asiento, así que el índice es la única clave
                    // estable. La lista no se reordena ni se filtra.
                    key={`${detalle.campo}-${indice}`}
                    detalle={detalle}
                  />
                ))}
              </div>
            </div>
          </Td>
        </tr>
      )}
    </>
  );
};

const CLAVES_DE_FILTRO = ["from", "to", "entityType", "action"] as const;

type Filtros = Record<(typeof CLAVES_DE_FILTRO)[number], string>;

const FILTROS_VACIOS: Filtros = {
  from: "",
  to: "",
  entityType: "",
  action: "",
};

export const RegistroDeCambiosPage = () => {
  /**
   * Los filtros y la página viven en la URL, no en un useState.
   *
   * El filtrado lo hace el backend —cada cambio dispara un pedido nuevo con
   * sus parámetros—, pero si el estado quedaba solo en React, la barra de
   * direcciones no se enteraba: recargar perdía los filtros, y no había forma
   * de pasarle a otra persona "mirá este rango". En un registro de auditoría,
   * que un hallazgo se pueda compartir por su enlace no es un lujo.
   *
   * Va con `replace` para no dejar una entrada de historial por cada tecla de
   * una fecha; el enlace igual queda copiable y la recarga lo respeta.
   */
  const [searchParams, setSearchParams] = useSearchParams();

  const filtros: Filtros = {
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
    entityType: searchParams.get("entityType") ?? "",
    action: searchParams.get("action") ?? "",
  };
  // Un ?page=0 o ?page=hola escritos a mano no tienen que romper la pantalla.
  const page = Math.max(1, Math.trunc(Number(searchParams.get("page"))) || 1);

  const { data, isPending, isError, refetch } = useChangeLog({
    page,
    ...filtros,
  });

  // Lo vacío no se escribe: la URL queda limpia y legible en vez de arrastrar
  // `?from=&to=&entityType=`.
  const escribirEnLaUrl = (siguientes: Filtros, pagina: number) => {
    const params = new URLSearchParams();
    for (const clave of CLAVES_DE_FILTRO) {
      if (siguientes[clave]) params.set(clave, siguientes[clave]);
    }
    if (pagina > 1) params.set("page", String(pagina));
    setSearchParams(params, { replace: true });
  };

  // Cambiar un filtro vuelve a la primera página: si estabas en la 7 y filtrás,
  // la 7 del resultado nuevo puede no existir y quedarías mirando una tabla
  // vacía sin entender por qué.
  //
  // Y el rango se mantiene coherente arrastrando el otro extremo. El `min` y
  // el `max` de los inputs sirven para el calendario, pero la fecha igual se
  // puede TIPEAR: poniendo un "Desde" posterior al "Hasta" el pedido salía
  // invertido y devolvía cero resultados, que en pantalla se lee como "no hay
  // nada" en vez de "el rango está al revés".
  const cambiarFiltro = (clave: keyof Filtros, valor: string) => {
    const siguientes = { ...filtros, [clave]: valor };
    if (clave === "from" && siguientes.to && valor > siguientes.to) {
      siguientes.to = valor;
    }
    if (clave === "to" && siguientes.from && valor < siguientes.from) {
      siguientes.from = valor;
    }
    escribirEnLaUrl(siguientes, 1);
  };

  const hayFiltros = Object.values(filtros).some(Boolean);

  const { mutate: exportar, isPending: exportando } = useMutation({
    mutationFn: () => exportChangeLogAction(filtros),
    onSuccess: ({ blob, nombre }) => {
      // El navegador no descarga un blob sin un enlace: se crea uno, se
      // dispara y se suelta la URL en el acto para no dejar el archivo
      // retenido en memoria.
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    },
    onError: (error) =>
      toast.error(
        // El 400 de "el rango da demasiadas filas" viene con su mensaje ya
        // redactado; la action lo saca del blob y lo relanza como Error.
        error instanceof Error && !("config" in error)
          ? error.message
          : getApiErrorMessage(error, "No pudimos generar el Excel"),
      ),
  });

  return (
    <ListShell
      header={
        <AdminPageHeader
          title="Registro de cambios"
          description="Cada cambio de contenido del sitio, con su revisión, quién lo hizo y qué tocó."
          action={
            <Button
              type="button"
              onClick={() => exportar()}
              disabled={exportando}
              className="rounded-lg"
            >
              <Download className="w-4 h-4" />
              {exportando ? "Generando..." : "Exportar a Excel"}
            </Button>
          }
        />
      }
      toolbar={
        <AdminCard className="p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="from" className="text-xs">
                Desde
              </Label>
              <Input
                id="from"
                type="date"
                value={filtros.from}
                max={filtros.to || undefined}
                onChange={(event) => cambiarFiltro("from", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="to" className="text-xs">
                Hasta
              </Label>
              <Input
                id="to"
                type="date"
                value={filtros.to}
                min={filtros.from || undefined}
                onChange={(event) => cambiarFiltro("to", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="entityType" className="text-xs">
                Sección
              </Label>
              <AdminSelect
                id="entityType"
                value={filtros.entityType}
                onChange={(event) =>
                  cambiarFiltro("entityType", event.target.value)
                }
              >
                <option value="">Todas</option>
                {Object.entries(TIPOS_DE_ENTIDAD).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div>
              <Label htmlFor="action" className="text-xs">
                Acción
              </Label>
              <AdminSelect
                id="action"
                value={filtros.action}
                onChange={(event) =>
                  cambiarFiltro("action", event.target.value)
                }
              >
                <option value="">Todas</option>
                {Object.entries(ACCION_INFO).map(([valor, info]) => (
                  <option key={valor} value={valor}>
                    {info.label}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>
          {hayFiltros && (
            <button
              type="button"
              onClick={() => escribirEnLaUrl(FILTROS_VACIOS, 1)}
              className="mt-3 text-sky-600 dark:text-sky-400 text-xs hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </AdminCard>
      }
      pagination={
        data ? (
          <Pagination
            meta={data.meta}
            onChange={(pagina) => escribirEnLaUrl(filtros, pagina)}
          />
        ) : undefined
      }
    >
      {isPending ? (
        <SectionLoader />
      ) : isError ? (
        <SectionError onRetry={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <EmptyState
          message={
            hayFiltros
              ? "No hay cambios registrados con esos filtros."
              : "Todavía no hay cambios registrados."
          }
        />
      ) : (
        <>
          <AdminTable>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Elemento</Th>
                <Th>Acción</Th>
                <Th>Autor</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {agruparPorRevision(data.data).map((grupo, indice) => (
                <GrupoDesplegable
                  key={`${grupo.revision}-${grupo.asientos[0].id}`}
                  grupo={grupo}
                  inicialmenteAbierto={indice === 0}
                />
              ))}
            </tbody>
          </AdminTable>

          {/* Las dos cosas que parecen errores y no lo son. Van en la pantalla
              y no en un manual aparte: se leen justo donde generan la duda. */}
          <div className="flex gap-2.5 px-4 py-4 border-t border-gray-100 dark:border-navy-800">
            <Info className="w-4 h-4 shrink-0 text-sky-500 mt-0.5" />
            <p className="text-gray-500 dark:text-navy-400 text-xs leading-relaxed">
              Cada asiento guarda el nombre que el elemento tenía en ese
              momento: si después se lo renombró, los asientos anteriores siguen
              mostrando el nombre viejo. Y un elemento eliminado definitivamente
              sigue figurando acá. Las dos cosas son a propósito: el registro
              dice qué pasó, no cómo están las cosas hoy.
            </p>
          </div>
        </>
      )}
    </ListShell>
  );
};
