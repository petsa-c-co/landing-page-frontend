import { Bus, CircleDot, Truck, Van } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ServiceItem, ServiceItemsLayout } from "@/services/interfaces/service.interface"

// El backend guarda un identificador de ícono por item ('pickup', 'combi',
// 'minibus'); acá se resuelve al componente concreto.
const ICONS: Record<string, LucideIcon> = {
  pickup: Truck,
  combi: Van,
  minibus: Bus,
}

interface ServiceItemsListProps {
  items: ServiceItem[]
  layout: ServiceItemsLayout
}

export const ServiceItemsList = ({ items, layout }: ServiceItemsListProps) => {
  if (layout === "icons") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = (item.icon && ICONS[item.icon]) || CircleDot
          return (
            <div
              key={item.id}
              className="text-center bg-gray-50 rounded-lg p-5 ring-1 ring-gray-100"
            >
              <Icon className="w-8 h-8 mx-auto text-sky-500 mb-2" strokeWidth={1.5} />
              <p className="font-heading uppercase text-navy-800 text-sm">
                {item.label}
              </p>
              {item.spec && (
                <p className="text-gray-500 text-xs mt-1">{item.spec}</p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (layout === "numbered") {
    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-start gap-4 bg-gray-50 rounded-lg p-5 ring-1 ring-gray-100"
          >
            <span className="font-heading text-sky-500 text-2xl leading-none">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-heading uppercase text-navy-800">{item.label}</p>
              {item.spec && <p className="text-gray-500 text-sm">{item.spec}</p>}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 ring-1 ring-gray-100"
        >
          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
          <span className="text-navy-800 font-medium">{item.label}</span>
          {item.spec && (
            <span className="text-gray-500 text-sm ml-auto">{item.spec}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
