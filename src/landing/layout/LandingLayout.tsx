import { Outlet, ScrollRestoration } from "react-router";
import { CustomHeader } from "../components/CustomHeader";
import { CustomFooter } from "../components/CustomFooter";
import { SeoDeRuta } from "@/shared/components/SeoDeRuta";
import { DatosDeLaEmpresa } from "@/shared/components/DatosDeLaEmpresa";

export const LandingLayout = () => {
  return (
    // Pie pegado al fondo. Sin esto el pie queda donde termine el contenido,
    // y mientras una página carga —o si es corta, como un 404— sube y aparece
    // pegado al header por unos cuadros, hasta que llegan los datos y lo
    // empujan de golpe. Medido: con el contenido vacío quedaban 0px entre el
    // header y el pie.
    //
    // `min-h-dvh` y no `min-h-screen`: en los celulares la barra del navegador
    // se pliega al scrollear, y con `vh` —que es la altura SIN plegar— queda
    // una franja de más abajo del pie.
    <div className="min-h-dvh flex flex-col bg-gray-50 text-gray-800 font-body">
      {/* Sin esto la SPA conserva el scroll al cambiar de ruta: si venías del
          footer, entrabas a la página nueva por la mitad. Además restaura la
          posición al volver con atrás/adelante, y respeta los enlaces #hash. */}
      <ScrollRestoration />
      {/* Cubre las páginas de contenido fijo. Las de detalle no figuran en el
          mapa y ponen su propio título con el dato que traen de la API. */}
      <SeoDeRuta />
      <DatosDeLaEmpresa />
      <CustomHeader />
      {/* flex-1: se estira para ocupar lo que sobre, así el pie nunca sube. */}
      <main className="flex-1">
        <Outlet />
      </main>
      <CustomFooter />
    </div>
  );
};
