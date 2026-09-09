import { useQuery } from "@tanstack/react-query";
import { getChangeLogAction } from "../actions/change-log.actions";
import type { ChangeLogFilters } from "../interfaces/change-log.interface";

export const CHANGE_LOG_KEY = ["admin", "change-log"] as const;

/**
 * El registro es inmutable: un asiento no se edita ni se borra. Por eso el
 * staleTime es alto —lo ya traído no puede haber cambiado— y lo único que
 * puede aparecer son asientos nuevos, que se ven al recargar o al cambiar de
 * filtro.
 */
export const useChangeLog = (filtros: ChangeLogFilters) =>
  useQuery({
    queryKey: [...CHANGE_LOG_KEY, filtros],
    queryFn: () => getChangeLogAction(filtros),
    staleTime: 5 * 60 * 1000,
  });
