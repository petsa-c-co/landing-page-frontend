import { useState, type ComponentProps } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PasswordFieldProps extends ComponentProps<"input"> {
  id: string
  label: string
  error?: string
  hint?: string
}

export const PasswordField = ({
  id,
  label,
  error,
  hint,
  ...props
}: PasswordFieldProps) => {
  const [show, setShow] = useState(false)

  return (
    <div className="mb-5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder="••••••••"
          className="pr-12"
          aria-invalid={Boolean(error)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-700 transition"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error ? (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      ) : (
        hint && <p className="text-gray-400 text-xs mt-1">{hint}</p>
      )}
    </div>
  )
}
