// Configuración del sitio: un singleton, sin id (FRONTEND.md §3.6.2).
export interface SiteSettings {
  // UNA sola marca de Bureau Veritas, que lista adentro todas las normas
  // certificadas. No confundir con un logo por certificación.
  // URL absoluta ya resuelta por el backend, o null si no se cargó.
  certificationMarkImage: string | null
  // Alcance de la certificación. El manual de BV exige mostrarlo junto a la
  // marca y visible sin clics cuando el alcance no cubre toda la empresa.
  certificationScopeText: string | null
  // Revisión del sitio para el pie. La lleva el backend: sube sola, una por
  // cada día en que se cambió contenido, y no se edita a mano.
  //
  // Opcionales porque el backend todavía no las publica: mientras no vengan,
  // el pie usa la constante local (ver revisionMostrada). Cuando estén, esto
  // pasa a ser `string` y `string | null` a secas.
  revision?: string | null
  // Fecha ISO cruda ("2026-08-27"), sin formatear: el mes en castellano lo
  // arma el frontend. Es null hasta que se registre el primer cambio.
  revisionDate?: string | null
}

// En el PATCH, por campo: ausente = no se toca; null = limpia; string =
// reemplaza. La imagen va como key devuelta por POST /media/uploads.
export interface SiteSettingsPayload {
  certificationMarkImage?: string | null
  certificationScopeText?: string | null
}
