import { useQuery } from "@tanstack/react-query"
import { getNewsAction, getNewsBySlugAction } from "../actions/get-news"
import type { NewsQueryParams } from "../interfaces/news.interface"

export const useNews = (params: NewsQueryParams = {}) => {
  return useQuery({
    queryKey: ["news", params],
    queryFn: () => getNewsAction(params),
  })
}

/**
 * Si el sitio tiene alguna nota publicada.
 *
 * Sirve para no ofrecer "Novedades y Prensa" en la navegación cuando la
 * sección está vacía: un enlace que lleva a una página que dice "todavía no
 * hay nada" es una promesa incumplida.
 *
 * Devuelve `undefined` mientras carga, y quien lo use debe tratar esa
 * incertidumbre como "sí hay": lo normal es que haya notas, y ocultar el
 * enlace para después reponerlo movería el menú en cada carga. Al revés, el
 * parpadeo ocurre una sola vez y solo en el caso raro.
 *
 * Pide una sola nota porque lo único que interesa es `meta.totalItems`: es la
 * forma más barata de que cuente el backend.
 */
export const useHayNovedades = (): boolean | undefined => {
  const { data } = useQuery({
    queryKey: ["news", "existe-alguna"],
    queryFn: () => getNewsAction({ limit: 1 }),
    // El menú está en todas las páginas: sin esto se repreguntaría al navegar.
    staleTime: 5 * 60 * 1000,
  })
  return data ? data.meta.totalItems > 0 : undefined
}

export const useNewsBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["news", "detail", slug],
    queryFn: () => getNewsBySlugAction(slug),
    retry: false,
    enabled: Boolean(slug),
  })
}
