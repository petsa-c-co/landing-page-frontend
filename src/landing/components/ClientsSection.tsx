import { useClients } from "@/clients/hooks/useClients"
import { SafeImage } from "@/components/custom/SafeImage"
import { AccentBar } from "./AccentBar"

export const ClientsSection = () => {
  const { data: clients } = useClients()

  // Sin clientes cargados la sección no aporta nada: se oculta entera.
  if (!clients || clients.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl page-container">
        <p className="font-heading uppercase tracking-[.2em] text-sky-500 text-sm mb-2 text-center">
          Confían en nosotros
        </p>
        <h2 className="font-heading uppercase font-semibold text-navy-800 text-[2rem] md:text-[2.5rem] text-center mb-6">
          Algunos de nuestros clientes
        </h2>
        <AccentBar className="mx-auto mb-12" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-10 gap-y-12 items-center justify-items-center">
          {clients.map((client) => (
            // Si el logo no está, se muestra el nombre: deja la grilla pareja y
            // el cliente sigue figurando.
            <SafeImage
              key={client.id}
              src={client.logoImage}
              alt={client.name}
              title={client.name}
              loading="lazy"
              className="max-h-14 max-w-[150px] w-auto object-contain transition-transform duration-200 hover:scale-105"
              fallback={
                <span className="font-heading uppercase text-navy-700 text-sm tracking-wide text-center">
                  {client.name}
                </span>
              }
            />
          ))}
        </div>
      </div>
    </section>
  )
}
