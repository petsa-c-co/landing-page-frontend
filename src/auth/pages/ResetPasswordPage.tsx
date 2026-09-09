import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/api/petrogasApi"
import { PasswordField } from "../components/PasswordField"
import { InvalidTokenNotice } from "../components/InvalidTokenNotice"
import { resetPasswordAction } from "../actions/auth.actions"
import { tokenSchema } from "../schemas/password.schema"
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/account.schema"

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const token = searchParams.get("token") ?? ""
  const isTokenValid = tokenSchema.safeParse(token).success

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  if (!isTokenValid) {
    return (
      <InvalidTokenNotice
        title="Enlace inválido o vencido"
        description="Los enlaces para restablecer la contraseña duran poco tiempo. Pedí uno nuevo desde la pantalla de acceso."
      />
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h1 className="font-heading uppercase font-semibold text-navy-800 text-xl mb-2">
          Contraseña actualizada
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Ya podés iniciar sesión con tu nueva contraseña.
        </p>
        <Button asChild className="w-full rounded-lg">
          <Link to="/acceder">Iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null)
    try {
      await resetPasswordAction({ token, newPassword: values.newPassword })
      setDone(true)
      setTimeout(() => void navigate("/acceder"), 4000)
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "No pudimos cambiar tu contraseña. Intentá de nuevo.",
        ),
      )
    }
  }

  return (
    <>
      <h1 className="font-heading uppercase font-semibold text-navy-800 text-2xl mb-1">
        Nueva contraseña
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Elegí una contraseña nueva para tu cuenta.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <PasswordField
          id="newPassword"
          label="Nueva contraseña"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          hint="Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo."
          {...register("newPassword")}
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
          {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
        </Button>
      </form>
    </>
  )
}
