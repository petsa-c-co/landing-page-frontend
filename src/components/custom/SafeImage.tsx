import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react"

// `src` se reescribe para aceptar null: los campos de imagen del backend son
// nullables y así el componente cubre "sin imagen" y "archivo perdido" igual.
interface SafeImageProps extends Omit<ComponentPropsWithoutRef<"img">, "src"> {
  src?: string | null
  // Qué mostrar si el archivo no está. Por defecto no se dibuja nada: el ícono
  // de imagen rota del navegador no comunica nada y ensucia la grilla.
  fallback?: ReactNode
}

// <img> que se reemplaza a sí mismo cuando la url da 404. Hace falta porque una
// clave puede quedar viva en la base con el archivo perdido, y el backend
// publica la url igual.
export const SafeImage = ({
  src,
  fallback = null,
  ...rest
}: SafeImageProps) => {
  const [broken, setBroken] = useState<string | null>(null)

  if (!src || broken === src) return <>{fallback}</>

  return <img src={src} onError={() => setBroken(src)} {...rest} />
}
