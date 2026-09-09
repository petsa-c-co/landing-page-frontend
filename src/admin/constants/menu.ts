import {
  Award,
  History,
  Building2,
  GraduationCap,
  LayoutDashboard,
  Linkedin,
  Mail,
  Newspaper,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/auth/interfaces/user.interface";
import { REGISTRO_DE_CAMBIOS_ACTIVO } from "@/change-log/constants/change-log.constants";

// Contadores que puede dibujar una entrada al lado de su etiqueta. El valor lo
// resuelve el layout: acá solo se declara cuál corresponde, para que el menú
// siga siendo una lista de datos y no tenga que saber de queries.
export type MenuBadge = "mensajesSinLeer";

export interface MenuItem {
  to: string;
  label: string;
  icon: LucideIcon;
  // Roles que ven la entrada (ver tabla de permisos en FRONTEND.md §2).
  roles: UserRole[];
  badge?: MenuBadge;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const ADMIN_MENU: MenuGroup[] = [
  {
    title: "General",
    items: [
      {
        to: "/admin",
        label: "Inicio",
        icon: LayoutDashboard,
        roles: ["admin", "rrhh"],
      },
    ],
  },
  {
    title: "Contenido",
    items: [
      {
        to: "/admin/novedades",
        label: "Novedades y Prensa",
        icon: Newspaper,
        roles: ["admin", "rrhh"],
      },
      {
        to: "/admin/linkedin",
        label: "LinkedIn",
        icon: Linkedin,
        roles: ["admin", "rrhh"],
      },
      {
        to: "/admin/servicios",
        label: "Servicios",
        icon: Wrench,
        roles: ["admin"],
      },
      // El rol auditor existe para esta entrada y la de Sitio: es quien
      // mantiene las normas y la marca de Bureau Veritas.
      {
        to: "/admin/certificaciones",
        label: "Certificaciones",
        icon: Award,
        roles: ["admin", "auditor"],
      },
      {
        to: "/admin/clientes",
        label: "Clientes",
        icon: Building2,
        roles: ["admin"],
      },
      // Va con el contenido y no con administración: son las fotos y datos que
      // se ven en el sitio, no ajustes del sistema.
      {
        to: "/admin/sitio",
        label: "Sitio",
        icon: Settings,
        roles: ["admin", "auditor"],
      },
    ],
  },
  // Es un catálogo, pero va acá y no con el resto del contenido porque son las
  // opciones del formulario de postulación. Las postulaciones y los puestos se
  // administran en Gestión Petrogas: RRHH los ve allá, no en este panel.
  {
    title: "RRHH",
    items: [
      {
        to: "/admin/titulos",
        label: "Títulos",
        icon: GraduationCap,
        roles: ["admin", "rrhh"],
      },
    ],
  },
  {
    title: "Administración",
    items: [
      {
        to: "/admin/mensajes",
        label: "Mensajes",
        icon: Mail,
        roles: ["admin"],
        badge: "mensajesSinLeer",
      },
      {
        to: "/admin/usuarios",
        label: "Usuarios",
        icon: Users,
        roles: ["admin"],
      },
      // Detrás del interruptor hasta que los endpoints estén vivos: ofrecer la
      // entrada antes de tiempo le mostraría una pantalla de error justo a
      // quien viene a auditar.
      ...(REGISTRO_DE_CAMBIOS_ACTIVO
        ? [
            {
              to: "/admin/registro-de-cambios",
              label: "Registro de cambios",
              icon: History,
              roles: ["admin", "auditor"] as UserRole[],
            },
          ]
        : []),
    ],
  },
];
