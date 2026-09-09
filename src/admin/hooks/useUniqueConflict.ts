import { useState } from "react"
import { getApiErrorMessage, getUniqueConflict } from "@/api/petrogasApi"
import type { UniqueConflict } from "@/api/types"

interface CapturedConflict {
  conflict: UniqueConflict
  message: string
}

// Captura los 409 por valor único para mostrarlos como un aviso con acciones
// dentro del formulario, en vez de un toast que se va solo.
export const useUniqueConflict = () => {
  const [captured, setCaptured] = useState<CapturedConflict | null>(null)

  // Devuelve true si el error era un conflicto y ya quedó mostrado acá; el
  // llamador solo tiene que hacer el toast cuando devuelve false.
  const capture = (error: unknown, fallback: string): boolean => {
    const conflict = getUniqueConflict(error)
    if (!conflict) return false
    setCaptured({ conflict, message: getApiErrorMessage(error, fallback) })
    return true
  }

  return { captured, capture, clear: () => setCaptured(null) }
}
