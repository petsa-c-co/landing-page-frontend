import { useEffect } from "react"
import { RouterProvider } from "react-router"
import { appRouter } from "./router/router.app"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuthStore } from "./auth/store/auth.store"
import { Toaster } from "./components/ui/sonner"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      // Con los 3 reintentos por defecto (más el backoff del navegador ante
      // conexiones rechazadas) el visitante se come un spinner largo antes de
      // ver el error. Un reintento alcanza.
      retry: 1,
      // Por defecto ('online') React Query PAUSA la petición si el navegador
      // se reporta sin conexión: la query queda en pending para siempre y el
      // visitante ve un spinner eterno en lugar de un mensaje. Preferimos
      // intentar siempre y mostrar el error si falla.
      networkMode: "always",
    },
    mutations: {
      networkMode: "always",
    },
  },
})

export const PetrogasApp = () => {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus)

  // Revalida la sesión guardada contra el backend. Si no hay usuario
  // persistido no hace ninguna petición: la landing es pública.
  useEffect(() => {
    void checkAuthStatus()
  }, [checkAuthStatus])

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <RouterProvider router={appRouter} />
    </QueryClientProvider>
  )
}
