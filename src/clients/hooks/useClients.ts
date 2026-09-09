import { useQuery } from "@tanstack/react-query"
import { getClientsAction } from "../actions/get-clients"

export const useClients = () => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: getClientsAction,
  })
}
