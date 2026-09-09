import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/api/petrogasApi";
import { PasswordField } from "../components/PasswordField";
import { useAuthStore } from "../store/auth.store";
import { hasPanelAccess } from "../constants/roles";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState<string | null>(null);

  // ProtectedRoute guarda acá la pantalla que la persona quiso abrir antes de
  // que la mandaran al login. Se acepta solo una ruta interna: un valor con
  // dominio propio sería un redirect abierto.
  const attempted = (location.state as { from?: string } | null)?.from;
  const from =
    attempted?.startsWith("/") && !attempted.startsWith("//")
      ? attempted
      : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const user = await login(values);
      // Si la sesión se cortó en medio del trabajo, se vuelve exactamente a esa
      // pantalla. Si el login fue por voluntad propia, al panel o al sitio
      // según lo que la cuenta alcance. `replace` evita que "atrás" traiga de
      // vuelta el formulario de login ya usado.
      const target = from ?? (hasPanelAccess(user.roles) ? "/admin" : "/");
      void navigate(target, { replace: true });
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "No pudimos iniciar sesión. Intentá de nuevo.",
        ),
      );
    }
  };

  return (
    <>
      <h1 className="font-heading uppercase font-semibold text-navy-800 text-2xl mb-1">
        Acceder
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Ingresá con tu cuenta de Petrogas S.A
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-5">
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

        <PasswordField
          id="password"
          label="Contraseña"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="mb-6 text-right">
          <Link
            to="/recuperar-clave"
            className="text-sky-500 text-sm hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {serverError && (
          <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-red-600 text-sm">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg"
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>

      <p className="text-gray-400 text-xs text-center mt-6">
        El acceso es solo para personal de Petrogas S.A. Si no tenés cuenta,
        pedísela al administrador.
      </p>
    </>
  );
};
