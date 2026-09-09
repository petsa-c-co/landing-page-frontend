// Datos estructurados: la ficha de la empresa en el formato que Google entiende
// sin tener que adivinarlo leyendo el texto de la página. Es lo que habilita que
// aparezcan la dirección, el teléfono y el mapa en el panel lateral del buscador
// cuando alguien busca "Petrogas Cutral Có".
//
// Va una sola vez en todo el sitio, montado en el layout público. Repetirlo en
// cada página no suma nada y puede leerse como contenido duplicado.
const FICHA = {
  "@context": "https://schema.org",
  // LocalBusiness y no Organization: la empresa atiende en una dirección física
  // concreta, y ese subtipo es el que habilita la ficha con mapa.
  "@type": "LocalBusiness",
  name: "Petrogas S.A",
  description:
    "Servicios petroleros: operación y mantenimiento de plantas de tratamiento de gas, seguridad de procesos y transporte de personal en la cuenca Neuquina.",
  url: "https://petrogassa.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Chubut 850",
    addressLocality: "Cutral-Có",
    addressRegion: "Neuquén",
    addressCountry: "AR",
  },
  telephone: ["+542995573812", "+542994960901"],
  foundingDate: "1992-12",
  areaServed: "Cuenca Neuquina",
  // Las ISO no tienen un campo propio en schema.org, así que van como
  // credenciales: es la forma prevista para certificaciones de terceros.
  hasCredential: [
    { "@type": "EducationalOccupationalCredential", name: "ISO 9001:2015" },
    { "@type": "EducationalOccupationalCredential", name: "ISO 14001:2015" },
    { "@type": "EducationalOccupationalCredential", name: "ISO 45001:2018" },
  ],
}

export const DatosDeLaEmpresa = () => (
  <script
    type="application/ld+json"
    // El contenido es una constante escrita acá al lado, no entra nada de la
    // API ni del usuario: no hay dónde inyectar.
    dangerouslySetInnerHTML={{ __html: JSON.stringify(FICHA) }}
  />
)
