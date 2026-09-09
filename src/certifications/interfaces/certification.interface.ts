// Espeja la entidad Certification del backend.
export interface Certification {
  id: string
  // Código/nombre de la norma, ej: "ISO 9001:2015".
  title: string
  // Categoría corta, ej: "Calidad", "Medio Ambiente".
  subtitle: string
  description: string
  // La destacada se muestra en la banda aparte (hoy: ISO 39001).
  isFeatured: boolean
  logoImage: string | null
  // URL absoluta del certificado en PDF (público), o null si no se cargó.
  certificatePdf: string | null
  sortOrder: number
  // Fecha de envío a la papelera; solo llega con valor en /admin/trash.
  deletedAt: string | null
}
