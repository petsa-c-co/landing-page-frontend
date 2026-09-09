import { useEffect, useState } from "react"

// Una clave guardada en la base puede quedar sin archivo detrás: pasó al migrar
// el almacenamiento a disco, donde los objetos viejos no se copiaron. El backend
// publica la URL igual, el navegador se come un 404 y el bloque queda en blanco
// — peor que no tener imagen, porque cuando el campo es null sí se dibuja el
// degradado de marca.
//
// Esto prueba la url y devuelve null si no carga, para que quien la use caiga en
// su propio reemplazo (el degradado en las tarjetas, el banner de marca en las
// cabeceras). No sirve un onError del <img> porque la mayoría de estas fotos se
// pintan como background-image, que no emite ningún evento al fallar.
// Núcleo: dice si la url no cargó. Ojo con el nombre: "rota" acá significa "no
// se pudo cargar", no necesariamente "el archivo no existe". El navegador no
// expone el código de estado en el onerror de una imagen, y un fetch a otro
// origen vuelve opaco, así que un 404 y un servidor caído son indistinguibles
// desde acá. Quien muestre esto al usuario tiene que redactarlo en consecuencia.
export const useImageIsBroken = (image: string | null | undefined): boolean => {
  const [broken, setBroken] = useState<string | null>(null)

  useEffect(() => {
    if (!image) return
    // El navegador cachea el resultado, así que esta prueba no duplica la
    // descarga que dispara el background-image con la misma url.
    const probe = new Image()
    probe.onerror = () => setBroken(image)
    probe.src = image
    return () => {
      probe.onerror = null
    }
  }, [image])

  // Se compara contra `image` y no con un booleano para que, al cambiar de foto,
  // la marca de rota no se arrastre a la nueva. El `Boolean(image)` no sobra:
  // sin él, `image` en null coincidiría con el estado inicial y todo campo
  // vacío se reportaría como roto.
  return Boolean(image) && broken === image
}

export const useLoadableImage = (image: string | null | undefined) => {
  const broken = useImageIsBroken(image)
  return !image || broken ? null : image
}
