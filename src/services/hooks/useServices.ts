import { useQuery } from "@tanstack/react-query"
import { getServiceBySlugAction, getServicesAction } from "../actions/get-services"

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: getServicesAction,
  })
}

export const useServiceBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["services", slug],
    queryFn: () => getServiceBySlugAction(slug),
    // Un slug inexistente devuelve 404: no tiene sentido reintentar.
    retry: false,
    enabled: Boolean(slug),
  })
}
