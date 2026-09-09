import { useState } from "react";
import { Link, Navigate } from "react-router";
import { PageHero } from "../components/PageHero";
import { SITE_IMAGE_SLOTS } from "@/site-settings/interfaces/site-images.interface"
import { CTASection } from "../components/CTASection";
import { Badge } from "@/components/ui/badge";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-date";
import { Backdrop } from "@/components/custom/Backdrop";
import { useHayNovedades, useNews } from "@/news/hooks/useNews";
import type { NewsCategory } from "@/news/interfaces/news.interface";

type Filter = "all" | NewsCategory;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "novedades", label: "Novedades" },
  { value: "prensa", label: "Prensa / Comunicados" },
];

const PAGE_SIZE = 9;

export const NovedadesPrensaPage = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  // El filtro por categoría y la paginación los resuelve el backend.
  const { data, isPending, isError, refetch } = useNews({
    category: filter === "all" ? undefined : filter,
    page,
    limit: PAGE_SIZE,
  });

  // Si no hay ninguna nota publicada, la sección no existe para el visitante:
  // el enlace ya no está en el menú y entrar por URL guardada o por buscador
  // lleva al inicio. Se consulta sin filtros a propósito —el `data` de arriba
  // puede venir vacío solo porque la categoría elegida no tiene notas— y se
  // espera a tener el dato: redirigir mientras carga sacaría de la página a
  // quien sí tiene notas para ver.
  const hayNovedades = useHayNovedades();

  const posts = data?.data ?? [];
  const meta = data?.meta;

  if (hayNovedades === false) return <Navigate to="/" replace />;

  // La nota destacada solo encabeza la primera página.
  const featured =
    page === 1 ? posts.find((post) => post.isFeatured) : undefined;
  const rest = featured
    ? posts.filter((post) => post.id !== featured.id)
    : posts;

  const changeFilter = (value: Filter) => {
    setFilter(value);
    setPage(1);
  };

  return (
    <>
      <PageHero
        eyebrow="Mantenete informado"
        title="Novedades y Prensa"
        slot={SITE_IMAGE_SLOTS.bannerNovedades}
      />

      <section className="py-12 bg-white">
        <div className="max-w-7xl page-container">
          <p className="text-gray-600 max-w-2xl mb-8">
            En esta sección podrás encontrar parte de los acontecimientos más
            importantes de la empresa y nuestros comunicados oficiales, en el
            marco de la mejora continua.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => changeFilter(f.value)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-heading uppercase tracking-wide transition",
                  filter === f.value
                    ? "bg-navy-600 text-white"
                    : "bg-gray-100 text-navy-700 hover:bg-navy-50",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isPending && <SectionLoader />}
          {isError && <SectionError onRetry={() => void refetch()} />}

          {featured && (
            <Link
              to={`/novedades-y-prensa/${featured.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition ring-1 ring-gray-100 mb-12"
            >
              <Backdrop
                image={featured.coverImage}
                seed={`petrogas-${featured.slug}`}
                width={1000}
                height={700}
                className="h-64 lg:h-auto min-h-[260px]"
              />
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <Badge
                    variant={featured.category === "prensa" ? "amber" : "sky"}
                  >
                    {featured.category === "prensa" ? "Prensa" : "Novedades"}
                  </Badge>
                  <span className="text-gray-400 text-xs">
                    {formatDate(featured.publishedAt)}
                  </span>
                </div>
                <h2 className="font-heading uppercase font-semibold text-navy-800 text-2xl md:text-3xl mb-3 group-hover:text-sky-500 transition">
                  {featured.title}
                </h2>
                <p className="text-gray-600 mb-5">{featured.excerpt}</p>
                <span className="text-sky-500 font-heading uppercase tracking-wide text-sm">
                  Leer más →
                </span>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((post) => (
                <Link
                  key={post.id}
                  to={`/novedades-y-prensa/${post.slug}`}
                  className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition ring-1 ring-gray-100"
                >
                  <Backdrop
                    image={post.coverImage}
                    seed={`petrogas-${post.slug}`}
                    width={700}
                    height={450}
                    className="h-44"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge
                        variant={post.category === "prensa" ? "amber" : "sky"}
                      >
                        {post.category === "prensa" ? "Prensa" : "Novedades"}
                      </Badge>
                      <span className="text-gray-400 text-xs">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-navy-800 text-lg mb-2 group-hover:text-sky-500 transition">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {data && posts.length === 0 && (
            <p className="text-center text-gray-500 py-12">
              No hay publicaciones en esta categoría.
            </p>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!meta.hasPrevPage}
                className="px-5 py-2 rounded-full text-sm font-heading uppercase tracking-wide bg-gray-100 text-navy-700 transition hover:bg-navy-50 disabled:opacity-40 disabled:hover:bg-gray-100"
              >
                ← Anterior
              </button>
              <span className="text-gray-500 text-sm">
                Página {meta.currentPage} de {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
                className="px-5 py-2 rounded-full text-sm font-heading uppercase tracking-wide bg-gray-100 text-navy-700 transition hover:bg-navy-50 disabled:opacity-40 disabled:hover:bg-gray-100"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="¿Consultas de prensa?"
        description="Escribinos y nuestro equipo de comunicación te responderá a la brevedad."
        buttonLabel="Contactanos"
        to="/contacto"
      />
    </>
  );
};
