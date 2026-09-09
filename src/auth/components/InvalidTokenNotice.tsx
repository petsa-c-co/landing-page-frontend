import { Link } from "react-router"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InvalidTokenNoticeProps {
  title: string
  description: string
}

export const InvalidTokenNotice = ({
  title,
  description,
}: InvalidTokenNoticeProps) => (
  <div className="text-center">
    <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-5">
      <AlertTriangle className="w-7 h-7 text-amber-500" />
    </div>
    <h1 className="font-heading uppercase font-semibold text-navy-800 text-xl mb-2">
      {title}
    </h1>
    <p className="text-gray-500 text-sm mb-6">{description}</p>
    <Button asChild variant="navy" className="w-full rounded-lg">
      <Link to="/acceder">Ir a iniciar sesión</Link>
    </Button>
  </div>
)
