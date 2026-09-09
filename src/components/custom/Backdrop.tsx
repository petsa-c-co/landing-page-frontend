import type { ComponentPropsWithoutRef } from "react"
import { placeholder } from "@/lib/images"
import { useLoadableImage } from "@/lib/useLoadableImage"
import { cn } from "@/lib/utils"

interface BackdropProps extends ComponentPropsWithoutRef<"div"> {
  // Foto del CMS. Si es null —o si el archivo no está— se usa el degradado.
  image: string | null | undefined
  // Identificador de la sección: fija el degradado de reemplazo, así el mismo
  // bloque muestra siempre el mismo fondo entre recargas.
  seed: string
  width?: number
  height?: number
  // Capas que van delante de la foto (velo oscuro, degradado de lectura).
  overlay?: string
  as?: "div" | "section"
}

// Bloque con foto de fondo. Es un componente y no un hook porque varias de
// estas fotos se pintan dentro de un .map() (tarjetas de servicios, de notas) y
// ahí no se puede llamar a un hook: cada tarjeta necesita su propia instancia.
export const Backdrop = ({
  image,
  seed,
  width,
  height,
  overlay,
  as: Tag = "div",
  className,
  style,
  children,
  ...rest
}: BackdropProps) => {
  const src = useLoadableImage(image) ?? placeholder(seed, width, height)

  return (
    <Tag
      className={cn("bg-cover bg-center", className)}
      style={{
        ...style,
        backgroundImage: overlay
          ? `${overlay}, url('${src}')`
          : `url('${src}')`,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
