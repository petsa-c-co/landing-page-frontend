// Espeja la entidad Client del backend.
export interface Client {
  id: string
  name: string
  // URL absoluta ya resuelta por el backend.
  logoImage: string
  sortOrder: number
  isActive: boolean
  // Fecha de envío a la papelera; solo llega con valor en /admin/trash.
  deletedAt: string | null
}
