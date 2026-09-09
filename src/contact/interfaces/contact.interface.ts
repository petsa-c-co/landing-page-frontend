export type ContactMessageStatus = "nueva" | "leida"

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: ContactMessageStatus
  createdAt: string
  updatedAt: string
}

export interface ContactQueryParams {
  status?: ContactMessageStatus
  page?: number
  limit?: number
}
