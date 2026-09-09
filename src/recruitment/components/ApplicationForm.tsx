import { useRef, useState, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FileText, Paperclip, X } from "lucide-react";
import { Link } from "react-router";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionError, SectionLoader } from "@/components/custom/QueryStates";
import { getApiErrorMessage, getFieldErrors } from "@/api/petrogasApi";
import type { FieldErrors } from "@/api/types";
import { cn } from "@/lib/utils";
import {
  applicationFormSchema,
  MAX_PUESTOS,
  validateCvFile,
  type ApplicationFormValues,
} from "../schemas/application.schema";
import { submitApplicationAction } from "../actions/public.actions";
import {
  useGroupedDegreeTitles,
  useJobProfiles,
} from "../hooks/useRecruitmentCatalogs";
import { DEGREE_TITLE_LEVEL_LABELS } from "../interfaces/recruitment.interface";

// Valor centinela del desplegable de títulos: no es un id, activa el campo de
// texto libre.
const OTHER_TITLE = "__otro__";

// Se declaran TODOS los campos, no solo el array: `reset` limpia lo que figura
// en los valores por defecto, así que dejar afuera los de texto hacía que
// siguieran con lo escrito después de enviar.
const EMPTY_FORM: ApplicationFormValues = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  jobProfileIds: [],
  degreeTitleId: "",
  degreeTitleName: "",
  degreeTitleOther: "",
};

// Campos que el formulario dibuja y puede marcar por su cuenta. Lo que venga
// fuera de esta lista se muestra igual en el resumen: un mensaje de Gestión que
// no sepamos ubicar no puede desaparecer sin que el postulante lo vea.
const CAMPOS_CONOCIDOS = [
  "fullName",
  "email",
  "phone",
  "location",
  "jobProfileIds",
  "degreeTitleId",
  "degreeTitleName",
  "degreeTitleOther",
  "cv",
];

const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
};

const FieldError = ({ mensaje }: { mensaje?: string }) =>
  mensaje ? <p className="text-red-500 text-xs mt-1">{mensaje}</p> : null;

export const ApplicationForm = () => {
  const jobProfiles = useJobProfiles();
  const degreeTitles = useGroupedDegreeTitles();

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Candado sincrónico contra envíos duplicados. Gestión NO deduplica por
  // email: cada envío le crea otro registro a RRHH. Deshabilitar el botón no
  // alcanza —lo medí: cinco clics en el mismo tick disparaban cinco peticiones,
  // porque React no repinta entre clics y `isPending` todavía es false. Un ref
  // se actualiza en el acto, sin esperar al render.
  const enviandoRef = useRef(false);
  const [cv, setCv] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  // El <select> va controlado: `reset` no alcanza a un input no controlado, así
  // que tras enviar seguiría mostrando el título elegido.
  const [titleChoice, setTitleChoice] = useState("");
  const usesOtherTitle = titleChoice === OTHER_TITLE;
  const [enviada, setEnviada] = useState(false);
  // Detalle por campo del último 422 de Gestión.
  const [serverErrors, setServerErrors] = useState<FieldErrors | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: EMPTY_FORM,
  });

  // useWatch en vez de watch(): devuelve el valor, no una función, así el
  // React Compiler puede memoizar el componente.
  const selectedProfiles = useWatch({ control, name: "jobProfileIds" });
  const elegidos = selectedProfiles?.length ?? 0;
  const enElTope = elegidos >= MAX_PUESTOS;

  const clearCv = () => {
    setCv(null);
    setCvError(null);
    // El input file mantiene el archivo elegido aunque se limpie el estado: sin
    // esto, volver a elegir el MISMO archivo no dispara el change.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: (values: ApplicationFormValues) => {
      // El schema no valida el CV (no vive en el form), así que se comprueba
      // acá y se corta antes de subir nada.
      const problem = validateCvFile(cv);
      if (problem) throw new Error(problem);
      return submitApplicationAction(values, cv as File);
    },
    onSuccess: () => {
      setEnviada(true);
      reset(EMPTY_FORM);
      setTitleChoice("");
      clearCv();
    },
    onError: (mutationError) => {
      if (!axios.isAxiosError(mutationError)) {
        // Error de validación local del CV: no llegó a viajar.
        setCvError(mutationError.message);
        return;
      }
      setServerErrors(getFieldErrors(mutationError));
    },
  });

  const toggleProfile = (id: number) => {
    // getValues y no `selectedProfiles`: este último es el valor del render, y
    // si llegan dos cambios antes de repintar, el segundo trabaja sobre una
    // lista vieja y pisa al primero. getValues lee el estado vivo del
    // formulario, así que el tope se cuenta siempre sobre lo que hay ahora.
    const current = getValues("jobProfileIds") ?? [];
    const yaEstaba = current.includes(id);
    // La segunda guarda: el checkbox deshabilitado ya lo impide, pero si el
    // evento llega igual (teclado, extensión, devtools) tampoco se pasa.
    if (!yaEstaba && current.length >= MAX_PUESTOS) return;
    setValue(
      "jobProfileIds",
      yaEstaba ? current.filter((value) => value !== id) : [...current, id],
      { shouldValidate: true },
    );
  };

  const onFileChange = (file: File | null) => {
    setCv(file);
    setCvError(validateCvFile(file));
  };

  const onSubmit = async (values: ApplicationFormValues) => {
    setEnviada(false);
    setServerErrors(null);
    try {
      // mutateAsync y no mutate: así el ciclo de handleSubmit no termina hasta
      // que la petición responde, y el candado de abajo cubre todo el trayecto.
      await mutateAsync(values);
    } catch {
      // onError ya dejó el mensaje en pantalla; acá solo se evita que la
      // promesa quede rechazada sin atender.
    }
  };

  // El candado se consulta Y se marca acá, en el mismo instante: si se marcara
  // dentro de onSubmit llegaría tarde, porque la validación es asíncrona y en
  // esa ventana varios clics pasan el chequeo antes de que se levante (lo medí:
  // cinco clics seguidos disparaban cinco peticiones).
  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (enviandoRef.current) {
      event.preventDefault();
      return;
    }
    enviandoRef.current = true;
    // Se libera al cerrar el ciclo completo, valga o no la validación: si
    // quedara trabado, el postulante no podría corregir un campo y reintentar.
    void handleSubmit(onSubmit)(event).finally(() => {
      enviandoRef.current = false;
    });
  };

  // Mensaje del servidor para un campo, si Gestión lo marcó.
  const delServidor = (campo: string): string | undefined =>
    serverErrors?.[campo]?.[0];

  // Mensajes de campos que este formulario no dibuja: van al pie para que no se
  // pierdan.
  const sueltos = Object.entries(serverErrors ?? {})
    .filter(([campo]) => !CAMPOS_CONOCIDOS.includes(campo))
    .flatMap(([, mensajes]) => mensajes);

  // Si el mensaje ya quedó debajo de su input, la caja de abajo no lo repite:
  // el de contenido activo ocupa dos renglones y salia dos veces con diez
  // pixeles de diferencia. Avisa en corto y el detalle queda donde hay que
  // corregir. Lo que Gestion marque en un campo que no dibujamos sigue
  // saliendo entero en `sueltos`.
  const yaUbicado = Object.keys(serverErrors ?? {}).some((campo) =>
    CAMPOS_CONOCIDOS.includes(campo),
  );

  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  // 502/503 = Gestión no contestó. No se guardó en ningún lado, así que lo
  // importante es que pueda reintentar sin perder lo que cargó.
  const gestionCaida = status === 502 || status === 503;

  if (jobProfiles.isPending) return <SectionLoader />;
  if (jobProfiles.isError) {
    return <SectionError onRetry={() => void jobProfiles.refetch()} />;
  }

  // Sin puestos no hay formulario posible: elegir al menos uno es obligatorio.
  if (!jobProfiles.data?.length) {
    return (
      <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-8 text-center">
        <h2 className="font-heading uppercase font-semibold text-navy-800 text-xl mb-2">
          No hay búsquedas abiertas en este momento
        </h2>
        <p className="text-gray-600 text-sm">
          Volvé a intentarlo en unos días. Si querés, escribinos y te
          contestamos.
        </p>
        <Link
          to="/contacto"
          className="inline-block mt-5 font-heading uppercase tracking-wide text-sm text-sky-600 hover:underline"
        >
          Ir a Contacto →
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={onFormSubmit}
      className="bg-gray-50 rounded-2xl ring-1 ring-gray-100 p-8"
      noValidate
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="fullName">Nombre y apellido</Label>
          <Input
            id="fullName"
            placeholder="Tu nombre y apellido"
            autoComplete="name"
            maxLength={120}
            {...register("fullName")}
          />
          <FieldError
            mensaje={errors.fullName?.message ?? delServidor("fullName")}
          />
        </div>
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            maxLength={254}
            {...register("email")}
          />
          <FieldError mensaje={errors.email?.message ?? delServidor("email")} />
        </div>
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="299-0000000"
            autoComplete="tel"
            maxLength={30}
            {...register("phone")}
          />
          <FieldError mensaje={errors.phone?.message ?? delServidor("phone")} />
        </div>
        <div>
          <Label htmlFor="location">Localidad</Label>
          <Input
            id="location"
            placeholder="Ej: Cutral-Có"
            autoComplete="address-level2"
            maxLength={120}
            {...register("location")}
          />
          <FieldError
            mensaje={errors.location?.message ?? delServidor("location")}
          />
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="font-heading uppercase tracking-wide text-navy-800 text-sm mb-1">
          ¿A qué puestos te postulás?
        </legend>
        {/* El contador y el bloqueo van juntos: el tope se ve ANTES de
            chocarlo. Que el backend rechace el cuarto no alcanza — significaría
            completar el formulario entero, adjuntar el CV y recién ahí
            enterarse de que hay que volver atrás. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 mb-3">
          {/* Al llegar al tope la ayuda cambia de texto en vez de sumar un
              aviso aparte: la lista tiene medio centenar de filas, así que un
              cartel debajo queda lejos de donde se está tildando. Y es aviso,
              no error —llegar al límite es esperable—, por eso el tono neutro
              y no el rojo. */}
          <p className="text-gray-500 text-xs">
            {enElTope
              ? "Llegaste al máximo. Destildá uno si querés elegir otro."
              : `Podés elegir hasta ${MAX_PUESTOS}.`}
          </p>
          <p
            aria-live="polite"
            className={cn(
              "text-xs tabular-nums",
              enElTope ? "text-sky-600 font-medium" : "text-gray-400",
            )}
          >
            {elegidos} de {MAX_PUESTOS} seleccionados
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {jobProfiles.data.map((profile) => {
            const checked = selectedProfiles?.includes(profile.id) ?? false;
            // Al llegar al tope se deshabilitan las NO tildadas. Las tildadas
            // siguen activas para poder cambiar de idea sin empezar de cero.
            const bloqueado = enElTope && !checked;
            return (
              <label
                key={profile.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors",
                  checked && "bg-sky-50 ring-1 ring-sky-200",
                  bloqueado
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer hover:bg-white",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={bloqueado}
                  onChange={() => toggleProfile(profile.id)}
                  className="w-4 h-4 accent-sky-600 disabled:cursor-not-allowed"
                />
                <span className="text-gray-700 text-sm">{profile.name}</span>
              </label>
            );
          })}
        </div>
        <FieldError
          mensaje={
            errors.jobProfileIds?.message ?? delServidor("jobProfileIds")
          }
        />
      </fieldset>

      <div className="mt-6">
        <Label htmlFor="degreeTitleId">Título</Label>
        {degreeTitles.isPending ? (
          <p className="text-gray-400 text-sm py-2">Cargando títulos...</p>
        ) : (
          <select
            id="degreeTitleId"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-400"
            value={titleChoice}
            onChange={(event) => {
              const value = event.target.value;
              const isOther = value === OTHER_TITLE;
              setTitleChoice(value);
              // Del catálogo viajan id y nombre; si escribe el suyo, ninguno de
              // los dos. Nunca las dos opciones juntas.
              setValue("degreeTitleId", isOther ? "" : value);
              setValue(
                "degreeTitleName",
                isOther
                  ? ""
                  : (degreeTitles.data?.find((t) => t.id === value)?.name ??
                      ""),
              );
              if (!isOther) setValue("degreeTitleOther", "");
            }}
          >
            <option value="">Elegí tu título</option>
            {degreeTitles.groups.map((group) => (
              <optgroup
                key={group.level}
                label={DEGREE_TITLE_LEVEL_LABELS[group.level]}
              >
                {group.titles.map((title) => (
                  <option key={title.id} value={title.id}>
                    {title.name}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={OTHER_TITLE}>Mi título no está en la lista</option>
          </select>
        )}
        {/* Los registrados van ocultos: el visible es el <select>, que escribe
            en el formulario con setValue. */}
        <input type="hidden" {...register("degreeTitleId")} />
        <input type="hidden" {...register("degreeTitleName")} />
        <FieldError
          mensaje={
            errors.degreeTitleId?.message ?? delServidor("degreeTitleId")
          }
        />

        {usesOtherTitle && (
          <div className="mt-3">
            <Label htmlFor="degreeTitleOther">Escribí tu título</Label>
            <Input
              id="degreeTitleOther"
              placeholder="Ej: Técnico en Seguridad e Higiene"
              maxLength={150}
              {...register("degreeTitleOther")}
            />
          </div>
        )}
        <FieldError
          mensaje={
            errors.degreeTitleOther?.message ?? delServidor("degreeTitleOther")
          }
        />
      </div>

      <div className="mt-6">
        <Label htmlFor="cv">Curriculum en PDF</Label>
        <input
          ref={fileInputRef}
          id="cv"
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        {cv ? (
          <div className="flex items-center gap-3 rounded-lg bg-white ring-1 ring-gray-200 px-4 py-3">
            <FileText className="w-5 h-5 text-sky-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-gray-700 text-sm truncate">{cv.name}</p>
              <p className="text-gray-400 text-xs">{formatFileSize(cv.size)}</p>
            </div>
            <button
              type="button"
              onClick={clearCv}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-50 transition"
              aria-label="Quitar el archivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-gray-500 text-sm hover:border-sky-400 hover:text-sky-600 transition"
          >
            <Paperclip className="w-4 h-4" />
            Elegí tu CV (PDF, hasta 5 MB)
          </button>
        )}
        <FieldError mensaje={cvError ?? delServidor("cv")} />
      </div>

      {/* Los DOS flags, no solo isPending: Gestión no deduplica por email, así
          que un doble clic le deja dos postulaciones iguales a RRHH.
          `handleSubmit` valida con zod ANTES de llamar a mutate(), y en esa
          ventana isPending todavía es false; isSubmitting cubre justo ese
          tramo. Juntos tapan desde el clic hasta la respuesta. */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          disabled={isPending || isSubmitting}
          className="rounded-lg"
        >
          {isPending || isSubmitting ? "Enviando..." : "Enviar postulación"}
        </Button>

        {enviada && (
          <p className="text-green-600 text-sm">
            ✓ ¡Recibimos tu postulación! Te vamos a contactar.
          </p>
        )}
      </div>

      {isError && axios.isAxiosError(error) && (
        <div className="mt-4 rounded-lg bg-red-50 ring-1 ring-red-100 p-4">
          <p className="text-red-700 text-sm">
            {gestionCaida
              ? "No pudimos enviar tu postulación. Intentá de nuevo en unos minutos: no perdiste nada de lo que cargaste."
              : status === 413
                ? "El CV no puede pesar más de 5 MB."
                : yaUbicado
                  ? "Revisá lo que quedó marcado en rojo y volvé a intentarlo."
                  : getApiErrorMessage(
                      error,
                      "No pudimos enviar tu postulación. Intentá de nuevo en unos minutos.",
                    )}
          </p>
          {sueltos.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-red-700 text-xs space-y-0.5">
              {sueltos.map((mensaje) => (
                <li key={mensaje}>{mensaje}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* La Ley 25.326 pide informar para qué se recolectan los datos, y acá se
          piden datos personales y un CV. El enlace va en el punto de
          recolección y no solo en el pie: es donde la persona está por
          entregar el dato. */}
      <p className="text-gray-400 text-xs mt-4">
        Usamos tus datos y tu CV solo para procesos de selección de Petrogas
        S.A. Podés leer el{" "}
        <Link to="/privacidad" className="text-sky-600 hover:underline">
          aviso de privacidad
        </Link>
        .
      </p>
    </form>
  );
};
