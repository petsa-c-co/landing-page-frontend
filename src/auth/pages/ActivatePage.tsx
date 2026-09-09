import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/api/petrogasApi"
import { PasswordField } from "../components/PasswordField"
import { InvalidTokenNotice } from "../components/InvalidTokenNotice"
import { activateAccountAction } from "../actions/auth.actions"
import { tokenSchema } from "../schemas/password.schema"
import {
  activateAccountSchema,
  type ActivateAccountFormValues,
} from "../schemas/account.schema"

export const ActivatePage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [activated, setActivated] = useState(false)

  const token = searchParams.get("token") ?? ""
  const isTokenValid = tokenSchema.safeParse(token).success

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivateAccountFormValues>({
    resolver: zodResolver(activateAccountSchema),
  })

  if (!isTokenValid) {
    return (
      <InvalidTokenNotice
        title="Enlace de activación inválido"
        description="El enlace está incompleto o ya no es válido. Pedile al administrador que te reenvíe la invitación."
      />
    )
  }

  if (activated) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h1 className="font-heading uppercase font-semibold text-navy-800 text-xl mb-2">
          ¡Cuenta activada!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Ya podés iniciar sesión con tu correo y la contraseña que definiste.
        </p>
        <Button asChild className="w-full rounded-lg">
          <Link to="/acceder">Iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  const onSubmit = async (values: ActivateAccountFormValues) => {
    setServerError(null)
    try {
      await activateAccountAction({
        token,
        name: values.name,
        surname: values.surname,
        password: values.password,
      })
      setActivated(true)
      // Deja ver el mensaje de éxito antes de mandar al login.
      setTimeout(() => void navigate("/acceder"), 4000)
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "No pudimos activar tu cuenta. Intentá de nuevo."),
      )
    }
  }

  return (
    <>
      <h1 className="font-heading uppercase font-semibold text-navy-800 text-2xl mb-1">
        Activá tu cuenta
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Completá tus datos y definí una contraseña para empezar a usar tu cuenta.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              autoComplete="given-name"
              placeholder="Juan"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="surname">Apellido</Label>
            <Input
              id="surname"
              autoComplete="family-name"
              placeholder="Pérez"
              aria-invalid={Boolean(errors.surname)}
              {...register("surname")}
            />
            {errors.surname && (
              <p className="text-red-500 text-xs mt-1">{errors.surname.message}</p>
            )}
          </div>
        </div>

        <PasswordField
          id="password"
          label="Contraseña"
          autoComplete="new-password"
          error={errors.password?.message}
          hint="Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo."
          {...register("password")}
        />

        <PasswordField
          id="confirmPassword"
          label="Repetir contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {serverError && (
          <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-red-600 text-sm">
            {serverError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full rounded-lg">
          {isSubmitting ? "Activando..." : "Activar cuenta"}
        </Button>
      </form>
    </>
  )
}
