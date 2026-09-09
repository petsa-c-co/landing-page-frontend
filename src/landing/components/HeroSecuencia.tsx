import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CertificationBadges } from "./CertificationBadges";

// Las cinco líneas de servicio del hero original. Van acá y no en la página
// porque son parte del bloque de texto del encabezado.
const SERVICIOS = [
  "Operación, Mantenimiento y Reparación Integral de Plantas de Tratamiento de Gas e Instalaciones de Captación, Tratamiento y Producción de Hidrocarburos.",
  "Seguridad de Procesos.",
  "Instalaciones Complementarias.",
  "Mantenimiento y calibración de válvulas PSV.",
  "Servicio de Transporte Terrestre de Personal.",
];
import camionLema from "@/assets/fotos/camion-lema.webp";
import {
  SITE_IMAGE_DEFAULTS,
  SITE_IMAGE_SLOTS,
} from "@/site-settings/interfaces/site-images.interface";
import camionGrua from "@/assets/fotos/camion-grua.webp";
import flotaBase from "@/assets/fotos/flota-base.webp";
import equipoNoche from "@/assets/fotos/equipo-noche.webp";
import equipoAtardecer from "@/assets/fotos/equipo-atardecer.webp";
import balancin from "@/assets/fotos/balancin.webp";
import micros from "@/assets/fotos/micros.webp";
import melex from "@/assets/fotos/melex.webp";
import zonaNoche from "@/assets/fotos/zona-2.webp";
import antorcha from "@/assets/fotos/zona-1.webp";
import salaControl from "@/assets/fotos/operacion-1.webp";
import capacitacion1 from "@/assets/fotos/capacitacion-1.webp";
import capacitacion2 from "@/assets/fotos/capacitacion-2.webp";
import rcp from "@/assets/fotos/rcp-1.webp";
import seguridad from "@/assets/fotos/seguridad-1.webp";

interface Pieza {
  src: string;
  alt: string;
  // Clases de grilla: así cada foto ocupa la celda que le queda bien según sea
  // vertical u horizontal.
  celda?: string;
  // Qué parte de la foto se conserva al recortar. Por defecto el centro, pero
  // en las fotos con gente hay que subir el encuadre: en una celda apaisada el
  // recorte centrado corta las cabezas.
  foco?: string;
}

type Cuadro =
  | { tipo: "foto"; src: string; alt: string }
  | { tipo: "collage"; id: string; grilla: string; piezas: Pieza[] };

// Las fotos chicas y verticales (pasaron por WhatsApp) no aguantan pantalla
// completa: se ven borrosas y mal recortadas. En collage ocupan un tercio o un
// cuarto del ancho, quedan en su proporción original y se ven bien.
// Tres verticales, una por columna. El collage ocupa solo la mitad derecha:
// además de dejar el texto despejado, angosta las celdas hasta una proporción
// parecida a la de las fotos (~0,5), así `cover` casi no recorta. A todo el
// ancho las celdas quedaban apaisadas y se comían medio alto de cada foto.
// Seis verticales, una por columna, a todo el ancho. Con seis celdas cada una
// mide ~260px de ancho: una proporción alta, parecida a la de las fotos, así
// que casi no se recortan. Y al cubrir toda la pantalla no queda ningún bloque
// azul plano, que era lo que se veía como relleno.
// CUATRO columnas, no seis. Las fotos verticales rondan la relación 0,45-0,56;
// con cuatro celdas cada una mide 392×774 (0,51) y se ve casi entera. Con seis
// la celda bajaba a 0,34 y las recortaba de más. Menos fotos por cuadro, pero
// se aprecian.
const COLLAGE_OPERACION: Cuadro = {
  tipo: "collage",
  id: "operacion",
  grilla: "grid-cols-2 md:grid-cols-4",
  piezas: [
    { src: equipoNoche, alt: "Equipo de pulling operando de noche" },
    { src: salaControl, alt: "Operador en la sala de control" },
    { src: balancin, alt: "Balancín en operación" },
    { src: antorcha, alt: "Antorcha encendida en planta" },
  ],
};

// Mixto: dos verticales a la izquierda y dos horizontales apiladas a la
// derecha. Cada mitad respeta la forma de sus fotos en vez de forzarlas todas
// al mismo molde.
const COLLAGE_MIXTO: Cuadro = {
  tipo: "collage",
  id: "mixto",
  grilla: "grid-cols-2 md:grid-cols-4 grid-rows-2",
  piezas: [
    {
      src: equipoAtardecer,
      alt: "Cuadrilla en la plataforma al atardecer",
      celda: "row-span-2",
    },
    {
      src: melex,
      alt: "Vehículos de mantenimiento en planta",
      celda: "row-span-2",
    },
    {
      src: zonaNoche,
      alt: "Planta de tratamiento operando de noche",
      celda: "col-span-2",
    },
    {
      src: micros,
      alt: "Micros de transporte de personal",
      celda: "col-span-2",
    },
  ],
};

// Nueve horizontales en grilla de 3×3. Acá entran TODAS las que no aguantan
// pantalla completa: cualquiera de menos de 1900px de ancho se agranda y se le
// nota la compresión. En celda chica no se agrandan y el defecto desaparece.
const COLLAGE_EQUIPO: Cuadro = {
  tipo: "collage",
  id: "equipo",
  grilla: "grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2",
  piezas: [
    {
      src: capacitacion1,
      // Al tope: las cabezas están en el 14% superior de la foto y con 28% el
      // recorte arrancaba recién en el 11%, justo por encima de la frente.
      alt: "Personal de Petrogas con sus certificados",
      foco: "center top",
    },
    {
      src: capacitacion2,
      alt: "Capacitación sobre Vaca Muerta",
      foco: "center 35%",
    },
    {
      src: rcp,
      alt: "Capacitación en primeros auxilios",
      foco: "center 30%",
    },
    { src: seguridad, alt: "Charla de seguridad", foco: "center 35%" },
    { src: camionGrua, alt: "Camión con grúa hidráulica" },
    { src: flotaBase, alt: "Flota de camionetas en la base de Cutral-Có" },
  ],
};

// El orden cuenta algo: la escala de la operación, el lema pintado en la
// unidad, el trabajo en yacimiento, el territorio, la flota y la base. Cierra
// donde empieza el día.
const SECUENCIA: Cuadro[] = [
  {
    tipo: "foto",
    // Sale de SITE_IMAGE_DEFAULTS y no de un import propio: el panel muestra
    // esta misma foto como "la que se ve al entrar", así que si acá se cambia
    // el primer cuadro, allá acompaña solo.
    src: SITE_IMAGE_DEFAULTS[SITE_IMAGE_SLOTS.homeHero],
    alt: "Flota de Petrogas operando en yacimiento",
  },
  {
    tipo: "foto",
    src: camionLema,
    alt: "Camión de Petrogas con el lema pintado en la puerta",
  },
  COLLAGE_OPERACION,
  COLLAGE_MIXTO,
  COLLAGE_EQUIPO,
];

const MS_POR_CUADRO = 5000;
const MS_FUNDIDO = 1600;
const MS_ZOOM = 7000;
// Apenas un 2%: alcanza para que la imagen no se sienta congelada y no se nota
// como un zoom. Con 6% el movimiento tapaba la foto en vez de acompañarla.
const ZOOM = 1.02;

// Un video de fondo pesaría varios megas y trae problemas de autoplay en
// celulares. Una secuencia de fotos con fundido logra el mismo efecto pesando
// una fracción, y cada imagen se cachea por separado.
// Devuelve el cuadro activo y hasta dónde hay que tener las fotos cargadas.
// Sin esto los siete cuadros son divs montados con background-image y el
// navegador se baja los ~3,5 MB de una al abrir la página, aunque el visitante
// solo llegue a ver el primero.
const useSecuencia = (cantidad: number) => {
  const [indice, setIndice] = useState(0);
  // Se reinicia el reloj cuando alguien elige un cuadro a mano: si no, el
  // automático podía pasar de largo medio segundo después del clic.
  const [reinicio, setReinicio] = useState(0);

  useEffect(() => {
    if (cantidad < 2) return;
    // Quien pidió menos movimiento en su sistema se queda con la primera foto.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reloj = setInterval(
      () => setIndice((i) => (i + 1) % cantidad),
      MS_POR_CUADRO,
    );
    return () => clearInterval(reloj);
  }, [cantidad, reinicio]);

  const ir = (i: number) => {
    setIndice(i);
    setReinicio((n) => n + 1);
  };

  return { indice, ir };
};

const Foto = ({
  src,
  alt,
  visible,
  cargar,
}: {
  src: string;
  alt: string;
  visible: boolean;
  cargar: boolean;
}) => (
  <div
    role="img"
    aria-label={visible ? alt : undefined}
    aria-hidden={visible ? undefined : true}
    className="absolute inset-0 bg-cover bg-center"
    style={cargar ? { backgroundImage: `url('${src}')` } : undefined}
  />
);

const MS_ENTRADA = 1900;
const MS_ESCALON = 190;
// Cuánto se queda el cuadro en negro antes de que entre la primera foto. Sin
// esta pausa las fotos empiezan a aparecer mientras el negro todavía se está
// fundiendo sobre el cuadro anterior y se ven las dos cosas encimadas.
const MS_ESPERA_NEGRO = 700;
// De cuánto arranca cada foto antes de acomodarse en su celda. Un 18%: con 35%
// el recorrido era tan largo que la foto llegaba frenando de golpe y se leía
// como un rebote, aunque la curva no rebotara.
const ZOOM_ENTRADA = 1.18;
// Desaceleración pura, sin tramo de arranque ni frenada brusca al final. La
// curva anterior (.22,.9,.3,1) cubría el 90% del recorrido en el primer 22% del
// tiempo: la imagen se clavaba y después reptaba, y eso era el salto.
const CURVA_ENTRADA = "cubic-bezier(0, 0, .3, 1)";

// El orden de entrada NO sigue la lectura. Si las celdas aparecen 1-2-3-4 se
// lee como una persiana; salteando posiciones el cuadro se arma desde varios
// puntos a la vez y se siente natural. Es fijo, no al azar: al azar cambiaría
// en cada vuelta y se notaría inestable.
const ORDEN_ENTRADA = [0, 3, 1, 5, 2, 4, 7, 6, 8];
const turno = (i: number) => {
  const puesto = ORDEN_ENTRADA.indexOf(i);
  return puesto === -1 ? i : puesto;
};

const Collage = ({
  cuadro,
  cargar,
  visible,
}: {
  cuadro: Extract<Cuadro, { tipo: "collage" }>;
  cargar: boolean;
  visible: boolean;
}) => (
  <div
    className={cn(
      // Negro, no navy: el cuadro arranca en oscuro total y las fotos van
      // apareciendo encima. Cualquier color de por medio se lee como relleno.
      // Sin juntas: a 1px parpadeaban (el ancho de la grilla no se divide
      // exacto entre las columnas y unas caían en un píxel y otras en dos) y a
      // 3px se marcaban tanto que la vista iba a la grilla en vez de a las
      // fotos. El negro se sigue viendo donde importa: en las celdas que
      // todavía no entraron.
      "absolute inset-0 grid bg-black",
      cuadro.grilla,
    )}
  >
    {cuadro.piezas.map((pieza, i) => (
      // La celda queda negra desde el principio: es el fondo sobre el que la
      // foto hace el zoom, y lo que se ve en las celdas que todavía no entraron.
      <div
        key={pieza.src}
        className={cn("overflow-hidden bg-black", pieza.celda)}
      >
        <div
          role="img"
          aria-label={pieza.alt}
          className="h-full w-full bg-cover"
          style={{
            ...(cargar
              ? {
                  backgroundImage: `url('${pieza.src}')`,
                  backgroundPosition: pieza.foco ?? "center",
                }
              : {}),
            // Cada foto entra por su cuenta: aparece y se acomoda dentro de su
            // celda. Antes el collage entero se fundía de una y no se veía el
            // negro debajo.
            opacity: visible ? 1 : 0,
            // translateZ fuerza que la escala la resuelva la placa de video en
            // una sola capa. Sin eso el navegador vuelve a rasterizar la foto en
            // cada fotograma y los bordes tiemblan contra la junta negra.
            // Ya sin junta, las columnas de ancho fraccionario podían dejar
            // asomar una hebra de negro entre foto y foto. El 0,4% de más tapa
            // ese medio píxel y no se percibe como recorte.
            transform: visible
              ? "scale(1.004) translateZ(0)"
              : `scale(${ZOOM_ENTRADA}) translateZ(0)`,
            backfaceVisibility: "hidden",
            transitionProperty: "opacity, transform",
            // Al salir desaparece sin animar y con retraso, cuando el cuadro ya
            // se desvaneció: si no, se ve deshacerse. Los 200ms extra son
            // margen: con el reinicio justo al filo del fundido, un fotograma
            // de más dejaba ver la foto volviendo de golpe a su tamaño inicial.
            transitionDuration: visible ? `${MS_ENTRADA}ms` : "0ms",
            transitionDelay: visible
              ? `${MS_ESPERA_NEGRO + turno(i) * MS_ESCALON}ms`
              : `${MS_FUNDIDO + 200}ms`,
            transitionTimingFunction: CURVA_ENTRADA,
          }}
        />
      </div>
    ))}
  </div>
);

interface HeroSecuenciaProps {
  // Foto cargada desde el panel. Si hay una, manda ella sola: quien la subió
  // eligió esa imagen, no una rotación.
  imagenDelPanel?: string;
}

export const HeroSecuencia = ({ imagenDelPanel }: HeroSecuenciaProps) => {
  const cuadros: Cuadro[] = imagenDelPanel
    ? [{ tipo: "foto", src: imagenDelPanel, alt: "Petrogas S.A" }]
    : SECUENCIA;
  const { indice: activo, ir } = useSecuencia(cuadros.length);
  // Marca de agua del recorrido: una vez que un cuadro se mostró, su foto ya
  // está en caché y no tiene sentido descargarla de nuevo al dar la vuelta.
  // Se ajusta durante el render en vez de en un efecto: React admite este
  // patrón y evita el repintado extra que trae el efecto.
  const [alcanzado, setAlcanzado] = useState(0);
  if (activo > alcanzado) setAlcanzado(activo);

  return (
    // Fondo negro: es el que se ve entre cuadro y cuadro y detrás de cada foto
    // mientras entra. Altura mínima, no fija: con el subtítulo, las insignias,
    // las cinco líneas de servicio y los dos botones, un alto cerrado recortaba
    // el contenido en pantallas bajas. El padding inferior deja libre la franja
    // de los botones de la secuencia.
    <section className="relative min-h-[640px] md:min-h-[88vh] flex items-center overflow-hidden bg-black py-20 pb-24 md:py-24 md:pb-28">
      {cuadros.map((cuadro, i) => {
        const visible = i === activo;
        // Se carga el cuadro actual y el siguiente; el resto espera su turno.
        // Así la primera pantalla pesa una foto y no siete.
        const cargar = i <= alcanzado + 1;
        // Los collages no se mueven: son composiciones armadas y el zoom las
        // desencuadra, además de recortar más de lo que ya recorta cada celda.
        const escala = cuadro.tipo === "collage" ? 1 : visible ? ZOOM : 1;
        return (
          <div
            key={cuadro.tipo === "foto" ? cuadro.src : cuadro.id}
            className="absolute inset-0"
            style={{
              opacity: visible ? 1 : 0,
              transform: `scale(${escala})`,
              transitionProperty: "opacity, transform",
              // Cada propiedad lleva su propio tiempo. El fundido siempre dura
              // lo mismo: si comparte duración con el zoom, la que entra tarda
              // 7 segundos en aparecer y queda un bache oscuro en el medio. El
              // zoom solo corre al entrar; al salir se reinicia de golpe pero
              // con retraso, cuando ya es invisible — si no, se ve encogerse
              // mientras se desvanece.
              transitionDuration: visible
                ? `${MS_FUNDIDO}ms, ${MS_ZOOM}ms`
                : `${MS_FUNDIDO}ms, 0ms`,
              transitionDelay: visible ? "0ms, 0ms" : `0ms, ${MS_FUNDIDO}ms`,
              transitionTimingFunction: "ease-in-out, linear",
            }}
          >
            {cuadro.tipo === "collage" ? (
              <Collage cuadro={cuadro} cargar={cargar} visible={visible} />
            ) : (
              <Foto
                src={cuadro.src}
                alt={cuadro.alt}
                visible={visible}
                cargar={cargar}
              />
            )}
          </div>
        );
      })}

      {/* Velo negro, no navy: con el fondo en negro un degradado azul encima
          volvía a teñir todo de azul, que es justo lo que se leía como relleno.
          Está solo para que el texto contraste contra la foto. */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/15" />

      <div className="relative max-w-7xl page-container w-full">
        <div className="max-w-3xl">
          {/* "En cada servicio" + el título son, palabra por palabra, lo que
              va pintado en la puerta de los camiones. Cambiarlo rompía esa
              conexión, que es lo más valioso que tiene el hero. */}
          <p className="font-heading uppercase tracking-[.2em] text-sky-400 text-sm mb-4">
            En cada servicio
          </p>
          <h1 className="font-heading uppercase font-bold text-white text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-6">
            Un equipo que responde por usted
          </h1>
          <div className="w-24 h-1 rounded-full bg-gradient-to-r from-sky-400 to-petrogas-red-500 mb-5" />
          <p className="text-navy-100 text-lg mb-4">
            Petrogas S.A | Servicios Petroleros — Alto nivel profesional
          </p>

          <CertificationBadges />

          <ul className="text-navy-100 space-y-1.5 mb-8 text-sm sm:text-base max-w-2xl">
            {SERVICIOS.map((linea) => (
              <li key={linea} className="flex gap-2">
                <span className="text-sky-400 shrink-0">▸</span>
                {linea}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link to="/servicios">Conocé nuestros servicios</Link>
            </Button>
            <Button asChild variant="outline-light">
              <Link to="/contacto">Contactanos</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Botones reales, no adornos: dicen que hay más cuadros y además dejan
          elegir. El área clickeable es más alta que la línea visible, para que
          se pueda pegar sin apuntar a un pelo de grosor. */}
      {cuadros.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0">
          <div
            className="max-w-7xl page-container flex gap-2"
            role="tablist"
            aria-label="Fotos del encabezado"
          >
            {cuadros.map((cuadro, i) => (
              <button
                key={cuadro.tipo === "foto" ? cuadro.src : cuadro.id}
                type="button"
                role="tab"
                aria-selected={i === activo}
                aria-label={`Ver foto ${i + 1} de ${cuadros.length}`}
                onClick={() => ir(i)}
                className="group py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded"
              >
                <span
                  className={cn(
                    "block h-0.5 w-10 rounded-full transition-colors duration-500",
                    i === activo
                      ? "bg-sky-400"
                      : "bg-white/25 group-hover:bg-white/60",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
