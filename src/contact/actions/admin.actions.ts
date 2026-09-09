import { petrogasApi, unwrap, unwrapPaginated } from "@/api/petrogasApi"
import type { ApiEnvelope, Paginated } from "@/api/types"
import type {
  ContactMessage,
  ContactMessageStatus,
  ContactQueryParams,
} from "../interfaces/contact.interface"

export const getContactMessagesAction = async (
  params: ContactQueryParams = {},
): Promise<Paginated<ContactMessage>> => {
  const { data } = await petrogasApi.get<ApiEnvelope<ContactMessage[]>>(
    "/contact/messages",
    { params: { page: 1, limit: 20, ...params } },
  )
  return unwrapPaginated(data)
}

export const updateContactMessageStatusAction = async (
  id: string,
  status: ContactMessageStatus,
): Promise<ContactMessage> => {
  const { data } = await petrogasApi.patch<ApiEnvelope<ContactMessage>>(
    `/contact/messages/${id}`,
    { status },
  )
  return unwrap(data)
}

export const deleteContactMessageAction = async (id: string): Promise<void> => {
  await petrogasApi.delete(`/contact/messages/${id}`)
}
