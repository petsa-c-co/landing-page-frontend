import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import type {
  ApiEnvelope,
  ApiErrorEnvelope,
  FieldErrors,
  Paginated,
  UniqueConflict,
} from "./types"

// El backend autentica con cookies HttpOnly (no hay token en localStorage),
// así que todas las peticiones tienen que mandar credenciales.
export const petrogasApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// Callback que dispara el interceptor cuando la sesión ya no se puede renovar.
// Se registra desde el store de auth para no acoplar este módulo con zustand.
let onSessionExpired: (() => void) | null = null

export const setOnSessionExpired = (callback: () => void): void => {
  onSessionExpired = callback
}

// Los roles cambian en caliente: si a alguien le sacan uno mientras trabaja, el
// primer aviso que recibe es un 403. Ahí conviene releer /auth/me y repintar el
// menú, o seguiría viendo entradas que ya no puede usar.
let onForbidden: (() => void) | null = null

export const setOnForbidden = (callback: () => void): void => {
  onForbidden = callback
}

interface RetriableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Un 401/403 es el backend diciendo "esta sesión no vale". Cualquier otra cosa
// (429, 5xx, se cayó la red) es transitoria y no debería costarle la sesión al
// usuario.
export const isAuthRejection = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false
  const status = error.response?.status
  return status === 401 || status === 403
}

// TODO el AuthController del backend comparte un límite de 10 peticiones por
// minuto, y /auth/me está adentro junto con login y refresh. Cada ciclo de
// "token vencido" ya gasta 3 (me → refresh → me), así que releer la sesión en
// cada 403 vacía el presupuesto en segundos; después falla el refresh con 429 y
// el usuario termina expulsado del panel sin haber hecho nada raro.
const SESSION_RECHECK_COOLDOWN_MS = 30_000
let lastSessionRecheck = 0

// Los endpoints de sesión se excluyen: releer /auth/me porque falló /auth/me
// (o el refresh) sería morderse la cola.
const SESSION_ENDPOINTS = [
  "/auth/me",
  "/auth/refresh",
  "/auth/login",
  "/auth/logout",
]

const shouldRecheckSession = (url: string | undefined): boolean =>
  !SESSION_ENDPOINTS.some((endpoint) => url?.includes(endpoint))

const requestSessionRecheck = (): void => {
  const now = Date.now()
  if (now - lastSessionRecheck < SESSION_RECHECK_COOLDOWN_MS) return
  lastSessionRecheck = now
  onForbidden?.()
}

// Endpoints donde un 401 es la respuesta esperada (credenciales incorrectas o
// refresh vencido): reintentar ahí sería un bucle.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh", "/auth/logout"]

// Refresh en curso, compartido por todas las peticiones que reciban 401 a la
// vez. Sin esto, una pantalla que lanza varias requests en paralelo dispara
// varios /auth/refresh: el primero rota el token y los demás presentan el
// anterior, que el backend detecta como REUTILIZACIÓN y revoca todas las
// sesiones del usuario (lo hace a propósito, es defensa contra robo de token).
let refreshPromise: Promise<void> | null = null

// El candado y la marca de tiempo se comparten entre TODAS las pestañas del
// mismo navegador; `refreshPromise` solo cubre una.
const REFRESH_LOCK = "petrogas-auth-refresh"
const LAST_REFRESH_KEY = "petrogas-last-refresh"
// Si otra pestaña renovó hace menos de esto, la cookie ya está fresca y volver
// a renovar solo gastaría cupo del rate limit.
const REFRESH_SKIP_MS = 5000

const readLastRefresh = (): number => {
  try {
    return Number(localStorage.getItem(LAST_REFRESH_KEY) ?? 0)
  } catch {
    // Modo incógnito o storage bloqueado: se sigue sin la optimización.
    return 0
  }
}

const markRefreshed = (): void => {
  try {
    localStorage.setItem(LAST_REFRESH_KEY, String(Date.now()))
  } catch {
    /* ídem */
  }
}

const doRefresh = async (): Promise<void> => {
  // Otra pestaña ya rotó el token mientras esperábamos el candado: la cookie
  // que tenemos ahora es la nueva, no hay nada que hacer.
  if (Date.now() - readLastRefresh() < REFRESH_SKIP_MS) return
  await petrogasApi.post("/auth/refresh")
  markRefreshed()
}

// El backend ROTA el refresh token en cada uso y, si le llega uno ya rotado, lo
// interpreta como robo y revoca todas las sesiones del usuario. Con varias
// pestañas abiertas eso se dispara solo: a los 15 minutos vencen todos los
// access token a la vez, todas piden refresh con la misma cookie y las que
// llegan segundas presentan un token ya consumido. Resultado: a todos afuera.
//
// Web Locks serializa el refresh entre pestañas, así solo una rota y el resto
// reusa el resultado. Si el navegador no lo soporta, se cae al comportamiento
// anterior (que ya deduplica dentro de una misma pestaña).
const refreshSession = (): Promise<void> => {
  refreshPromise ??= (async () => {
    try {
      if (typeof navigator !== "undefined" && "locks" in navigator) {
        await navigator.locks.request(REFRESH_LOCK, doRefresh)
      } else {
        await doRefresh()
      }
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

// El accessToken dura ~15 min. Ante un 401 se intenta renovar la sesión con la
// cookie de refresh y se repite la petición original una sola vez.
petrogasApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequest | undefined

    const isRetriable =
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      !AUTH_ENDPOINTS.some((endpoint) => request.url?.includes(endpoint))

    if (isRetriable) {
      request._retry = true
      try {
        await refreshSession()
        return await petrogasApi(request)
      } catch (refreshError) {
        // Solo se cierra la sesión si el backend RECHAZÓ el refresh (401/403).
        // Antes se cerraba ante cualquier falla, y eso incluía el 429 del rate
        // limit: pasar del límite te echaba del panel, cuando en realidad la
        // sesión seguía siendo válida y bastaba con esperar.
        if (isAuthRejection(refreshError)) onSessionExpired?.()
      }
    }

    if (error.response?.status === 403 && shouldRecheckSession(request?.url)) {
      requestSessionRecheck()
    }

    return Promise.reject(error)
  },
)

// Devuelve solo el payload del sobre estándar.
export const unwrap = <T>(envelope: ApiEnvelope<T>): T => envelope.data

// Igual que unwrap pero conservando la metadata de paginación.
export const unwrapPaginated = <T>(envelope: ApiEnvelope<T[]>): Paginated<T> => {
  if (!envelope.meta) {
    throw new Error("La respuesta no incluye metadata de paginación")
  }
  return { data: envelope.data, meta: envelope.meta }
}

// Mensaje de error listo para mostrarle al usuario. El backend ya responde en
// español, así que se prioriza su mensaje sobre el fallback.
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    // El throttler responde en inglés ("Too Many Requests"), que no le dice
    // nada a quien usa el panel. Va antes del mensaje del backend a propósito.
    if (error.response?.status === 429) {
      return "Hiciste demasiadas peticiones seguidas. Esperá un minuto y volvé a intentar."
    }
    const data = error.response?.data as ApiErrorEnvelope | undefined
    if (data?.message) return data.message
    if (!error.response) return "No pudimos conectarnos con el servidor."
  }
  return fallback
}

/**
 * Errores de validación por campo de un 422, o null si el error es de otro
 * tipo. Los devuelve Gestión Petrogas a través del backend y sirven para
 * marcar cada campo del formulario en vez de tirar todo en un solo cartel.
 *
 * Se descarta la forma de lista plana a propósito: esa la usan los errores
 * propios del backend, que no dicen a qué campo pertenecen.
 */
export const getFieldErrors = (error: unknown): FieldErrors | null => {
  if (!axios.isAxiosError(error)) return null
  if (error.response?.status !== 422) return null

  const data = error.response.data as ApiErrorEnvelope | undefined
  const errors = data?.errors
  if (!errors || Array.isArray(errors)) return null

  return errors
}

// Registro que bloquea la operación por valor único repetido, o null si el
// error es de otro tipo. Sirve para distinguir "hay algo que libera esto" de
// un error común, y para ofrecer restaurar/eliminar cuando está en la papelera.
export const getUniqueConflict = (error: unknown): UniqueConflict | null => {
  if (!axios.isAxiosError(error)) return null
  const data = error.response?.data as ApiErrorEnvelope | undefined
  return data?.conflict ?? null
}
