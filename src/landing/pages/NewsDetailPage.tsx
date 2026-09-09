import { Link, useParams } from "react-router"
import { ArrowLeft, ExternalLink, Linkedin } from "lucide-react"
import { CTASection } from "../components/CTASection"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SectionError, SectionLoader } from "@/components/custom/QueryStates"
import { useNewsBySlug } from "@/news/hooks/useNews"
import { formatDate } from "@/lib/format-date"
import { Backdrop } from "@/components/custom/Backdrop"
import { Seo } from "@/shared/components/Seo"

export const NewsDetailPage = () => {
  const { slug = "" } = useParams()
  const { data: post, isPending, isError, refetch } = useNewsBySlug(slug)

  // Las salidas tempranas también ponen título. Sin esto, mientras carga o si la
  // nota no existe la pestaña queda en blanco y Google ve una página sin título:
  // el <Seo> de más abajo nunca llega a renderizarse en esos casos.
  if (isPending)
    return (
      <>
        <Seo titulo="Novedades y Prensa" descripcion="Cargando la publicación." />
        <SectionLoader className="py-32" />
      </>
    )

  if (isError || !post) {
    return (
      <div className="py-24 text-center px-4">
        <Seo
          titulo="Publicación no encontrada"
          descripcion="La publicación que buscabas cambió de dirección o ya no está disponible."
        />
        <h1 className="font-heading uppercase font-semibold text-navy-800 text-2xl mb-3">
          No encontramos esta publicación
        </h1>
        <SectionError
          message="Puede que haya cambiado de dirección o ya no esté disponible."
          onRetry={() => void refetch()}
          className="py-6"
        />
        <Button asChild variant="navy">
          <Link to="/novedades-y-prensa">Ver todas las novedades</Link>
        </Button>
      </div>
    )
  }

  // El cuerpo llega como texto plano desde el CMS: se parte en párrafos por
  // líneas en blanco (no se inyecta HTML).
  const paragraphs = post.body.split(/\n\s*\n/).filter(Boolean)

  return (
    <>
      {/* tipo="article" en vez de "website": es lo que hace que LinkedIn la
          muestre como nota y no como una página suelta del sitio. */}
      <Seo
        titulo={post.title}
        descripcion={post.excerpt}
        imagen={post.coverImage ?? undefined}
        tipo="article"
      />
      <Backdrop
        as="section"
        image={post.coverImage}
        seed={`petrogas-${post.slug}`}
        width={1920}
        height={600}
        overlay="linear-gradient(rgba(13,21,48,.85),rgba(28,47,107,.7))"
        className="relative h-80 flex items-end"
      >
        <div className="max-w-4xl page-container pb-10 w-full">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant={post.category === "prensa" ? "amber" : "sky"}>
              {post.category === "prensa" ? "Prensa" : "Novedades"}
            </Badge>
            {post.source === "linkedin" && (
              <span className="inline-flex items-center gap-1 text-navy-200 text-xs">
                <Linkedin className="w-3.5 h-3.5" />
                Desde LinkedIn
              </span>
            )}
            <span className="text-navy-200 text-xs">
              {formatDate(post.publishedAt)}
            </span>
          </div>
          <h1 className="font-heading uppercase font-bold text-white text-3xl md:text-4xl">
            {post.title}
          </h1>
        </div>
      </Backdrop>

      <article className="py-16 bg-white">
        <div className="max-w-4xl page-container">
          <Link
            to="/novedades-y-prensa"
            className="inline-flex items-center gap-2 text-sky-500 font-heading uppercase tracking-wide text-sm mb-8 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Novedades y Prensa
          </Link>

          <p className="text-gray-700 text-lg leading-relaxed mb-8">{post.excerpt}</p>

          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-gray-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {post.externalUrl && (
            <a
              href={post.externalUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 mt-8 text-sky-500 font-heading uppercase tracking-wide text-sm hover:underline"
            >
              Ver publicación original
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </article>

      <CTASection
        title="¿Consultas de prensa?"
        description="Escribinos y nuestro equipo de comunicación te responderá a la brevedad."
        buttonLabel="Contactanos"
        to="/contacto"
      />
    </>
  )
}
