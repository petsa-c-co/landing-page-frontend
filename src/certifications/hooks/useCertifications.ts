import { useQuery } from "@tanstack/react-query"
import { getCertificationsAction } from "../actions/get-certifications"

export const useCertifications = () => {
  return useQuery({
    queryKey: ["certifications"],
    queryFn: getCertificationsAction,
  })
}
