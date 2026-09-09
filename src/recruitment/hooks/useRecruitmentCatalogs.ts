import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  getDegreeTitlesAction,
  getJobProfilesAction,
} from "../actions/public.actions"
import {
  DEGREE_TITLE_LEVELS,
  type DegreeTitle,
  type DegreeTitleLevel,
} from "../interfaces/recruitment.interface"

// Los catálogos cambian muy de vez en cuando y el formulario los pide enteros:
// no tiene sentido volver a bajarlos cada vez que el visitante toca un campo.
const CATALOG_STALE_TIME = 10 * 60 * 1000

export const useJobProfiles = () =>
  useQuery({
    queryKey: ["recruitment", "job-profiles"],
    queryFn: getJobProfilesAction,
    staleTime: CATALOG_STALE_TIME,
  })

export const useDegreeTitles = () =>
  useQuery({
    queryKey: ["recruitment", "degree-titles"],
    queryFn: getDegreeTitlesAction,
    staleTime: CATALOG_STALE_TIME,
  })

export interface DegreeTitleGroup {
  level: DegreeTitleLevel
  titles: DegreeTitle[]
}

/**
 * Agrupa los títulos por nivel educativo respetando el orden de la escalera
 * (primario → formación profesional). Son 140+: sin agrupar, el desplegable
 * del formulario es una lista imposible de recorrer.
 */
export const groupDegreeTitlesByLevel = (
  titles: DegreeTitle[] | undefined,
): DegreeTitleGroup[] => {
  if (!titles?.length) return []

  return DEGREE_TITLE_LEVELS.map((level) => ({
    level,
    titles: titles.filter((title) => title.level === level),
  })).filter((group) => group.titles.length > 0)
}

export const useGroupedDegreeTitles = () => {
  const query = useDegreeTitles()
  const groups = useMemo(
    () => groupDegreeTitlesByLevel(query.data),
    [query.data],
  )
  return { ...query, groups }
}
