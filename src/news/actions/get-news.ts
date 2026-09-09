import { petrogasApi, unwrap, unwrapPaginated } from "@/api/petrogasApi"
import type { ApiEnvelope, Paginated } from "@/api/types"
import type { NewsPost, NewsQueryParams } from "../interfaces/news.interface"

export const getNewsAction = async ({
  category,
  featured,
  page = 1,
  limit = 10,
}: NewsQueryParams = {}): Promise<Paginated<NewsPost>> => {
  const { data } = await petrogasApi.get<ApiEnvelope<NewsPost[]>>("/news", {
    // El filtrado y la paginación los resuelve el backend.
    params: { category, featured, page, limit },
  })
  return unwrapPaginated(data)
}

export const getNewsBySlugAction = async (slug: string): Promise<NewsPost> => {
  const { data } = await petrogasApi.get<ApiEnvelope<NewsPost>>(`/news/${slug}`)
  return unwrap(data)
}
