import type { PropsWithChildren } from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "@/auth/store/auth.store";
import type { UserRole } from "@/auth/interfaces/user.interface";
import { ADMIN_MENU } from "../constants/menu";

const INICIO = "/admin";

/**
 * Qué se muestra en `/admin` según el rol.
 *
 * No todos los roles ven Inicio: el auditor, por ejemplo, no lo tiene en el
 * menú. Sin esto igual aterrizaría ahí después de entrar —es la ruta índice—
 * y vería un tablero de métricas de secciones que no puede abrir, con dos 403
 * en la consola: el tablero pide los totales de Novedades y de LinkedIn, que
 * son de admin y rrhh.
 *
 * A dónde se lo manda sale del propio ADMIN_MENU: su primera entrada visible.
 * Así, si mañana cambia lo que ve un rol, esto acompaña sin tocarse.
 */
export const AdminHome = ({ children }: PropsWithChildren) => {
  const roles = useAuthStore((state) => state.user?.roles);
  const puede = (permitidos: UserRole[]) =>
    permitidos.some((role) => roles?.includes(role));

  const entradas = ADMIN_MENU.flatMap((group) => group.items);
  const veInicio = entradas.some(
    (item) => item.to === INICIO && puede(item.roles),
  );
  if (veInicio) return children;

  const primera = entradas.find(
    (item) => item.to !== INICIO && puede(item.roles),
  );
  // Sin ninguna entrada visible no se llega hasta acá: el layout muestra antes
  // la pantalla de "sin permisos". El children queda de red por las dudas.
  return primera ? <Navigate to={primera.to} replace /> : children;
};
