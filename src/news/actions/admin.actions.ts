import { petrogasApi, unwrap, unwrapPaginated } from "@/api/petrogasApi"
import type { ApiEnvelope, Paginated } from "@/api/types"
import type {
  NewsCategory,
  NewsPost,
  NewsQueryParams,
} from "../interfaces/news.interface"

export interface AdminNewsQueryParams extends NewsQueryParams {
  // Solo en el panel: filtra publicadas vs borradores.
  published?: boolean
}

export const getNewsAdminAction = async (
  params: AdminNewsQueryParams = {},
): Promise<Paginated<NewsPost>> => {
  const { data } = await petrogasApi.get<ApiEnvelope<NewsPost[]>>("/news/admin", {
    params: { page: 1, limit: 20, ...params },
  })
  return unwrapPaginated(data)
}

export const getNewsByIdAction = async (id: string): Promise<NewsPost> => {
  const { data } = await petrogasApi.get<ApiEnvelope<NewsPost>>(
    `/news/admin/${id}`,
  )
  return unwrap(data)
}

export interface NewsPayload {
  title: string
  slug?: string
  category: NewsCategory
  publishedAt?: string
  // Key devuelta por POST /media/uploads.
  coverImage?: string | null
  excerpt: string
  body: string
  isFeatured?: boolean
  isPublished?: boolean
  externalUrl?: string
}

export const createNewsAction = async (
  payload: NewsPayload,
): Promise<NewsPost> => {
  const { data } = await petrogasApi.post<ApiEnvelope<NewsPost>>("/news", payload)
  return unwrap(data)
}

export const updateNewsAction = async (
  id: string,
  payload: Partial<NewsPayload>,
): Promise<NewsPost> => {
  const { data } = await petrogasApi.patch<ApiEnvelope<NewsPost>>(
    `/news/${id}`,
    payload,
  )
  return unwrap(data)
}

export const deleteNewsAction = async (id: string): Promise<void> => {
  await petrogasApi.delete(`/news/${id}`)
}
