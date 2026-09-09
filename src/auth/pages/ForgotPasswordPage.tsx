import { useState } from "react"
import { Link } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/api/petrogasApi"
import { forgotPasswordAction } from "../actions/auth.actions"
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/account.schema"

export const ForgotPasswordPage = () => {
  const [serverError, setServerError] = useState<string | null>(null)
  const [sentMessage, setSentMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  // El backend responde igual exista o no el correo (anti-enumeración): no se
  // puede -ni se debe- decir "ese email no está registrado".
  if (sentMessage) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-sky-50 flex items-center justify-center mb-5">
          <MailCheck className="w-7 h-7 text-sky-500" />
        </div>
        <h1 className="font-heading uppercase font-semibold text-navy-800 text-xl mb-2">
          Revisá tu correo
        </h1>
        <p className="text-gray-500 text-sm mb-6">{sentMessage}</p>
        <Button asChild variant="navy" className="w-full rounded-lg">
          <Link to="/acceder">Volver a iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null)
    try {
      const message = await forgotPasswordAction(values.email)
      setSentMessage(message)
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "No pudimos procesar tu pedido. Intentá de nuevo."),
      )
    }
  }

  return (
    <>
      <h1 className="font-heading uppercase font-semibold text-navy-800 text-2xl mb-1">
        Recuperar contraseña
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Ingresá tu correo y te enviamos un enlace para definir una nueva
        contraseña.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-6">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tucorreo@petrogassa.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {serverError && (
          <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-red-600 text-sm">
            {serverError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full rounded-lg">
          {isSubmitting ? "Enviando..." : "Enviar enlace"}
        </Button>
      </form>

      <Link
        to="/acceder"
        className="mt-6 inline-flex items-center gap-2 text-sky-500 text-sm hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a iniciar sesión
      </Link>
    </>
  )
}
