import { useQuery } from "@tanstack/react-query"
import { getContactMessagesAction } from "../actions/admin.actions"

// Comparte prefijo con la queryKey del listado a propósito: así el
// invalidateQueries(["admin", "contact-messages"]) que ya hace la pantalla al
// marcar leído o borrar refresca también este contador, sin tener que
// acordarse de invalidarlo aparte.
export const UNREAD_MESSAGES_KEY = [
  "admin",
  "contact-messages",
  "unread",
] as const

/**
 * Cuántas consultas sin leer hay, para el contador del menú.
 *
 * No hay endpoint de conteo: se pide la primera página filtrada por `nueva`
 * con `limit: 1` y se lee `meta.totalItems`. Traer un solo registro es la
 * forma más barata de que el backend cuente por nosotros.
 *
 * `enabled` existe porque el menú lo dibuja el layout, que también monta para
 * el rol rrhh: sin eso, cada carga del panel de un usuario de RRHH dispararía
 * un 403 contra un endpoint que no le corresponde.
 */
export const useUnreadMessagesCount = (enabled: boolean) =>
  useQuery({
    queryKey: UNREAD_MESSAGES_KEY,
    queryFn: async () => {
      const { meta } = await getContactMessagesAction({
        status: "nueva",
        limit: 1,
      })
      return meta.totalItems
    },
    enabled,
    staleTime: 60_000,
    // Los dos overrides son necesarios y ninguno alcanza solo.
    //
    // El contador lo dibuja el layout, que NO se vuelve a montar al cambiar de
    // página del panel: sin esto la query se pide una vez al entrar y no se
    // pide nunca más. Quedaba clavada hasta recargar el navegador.
    //
    // `refetchOnWindowFocus` está en false para TODA la app (ver PetrogasApp):
    // es lo correcto para el sitio público, donde nada cambia mientras mirás,
    // pero acá justamente lo que se espera es enterarse de algo que pasó
    // afuera. Se reactiva solo para esta query.
    refetchOnWindowFocus: true,
    // Y el intervalo cubre el caso de dejar el panel abierto en primer plano
    // sin tocar nada. Un minuto es de sobra para una consulta de contacto, y
    // el pedido es de un registro. React Query lo pausa solo cuando la
    // pestaña queda oculta, así que no corre de fondo toda la noche.
    refetchInterval: 60_000,
  })
