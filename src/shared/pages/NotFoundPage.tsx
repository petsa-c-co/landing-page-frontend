import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Seo } from "@/shared/components/Seo";

export const NotFoundPage = () => {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-navy-900 text-center px-4">
      {/* Fuera del layout público, así que pone su propio título: si no, la
          pestaña queda en blanco. */}
      <Seo
        titulo="Página no encontrada"
        descripcion="La dirección que buscabas no existe o cambió de lugar."
      />
      <div>
        <p className="font-heading text-sky-400 text-sm uppercase tracking-[.2em] mb-3">
          Error 404
        </p>
        <h1 className="font-heading uppercase font-bold text-white text-4xl md:text-5xl mb-6">
          Página no encontrada
        </h1>
        <Button asChild>
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
};
