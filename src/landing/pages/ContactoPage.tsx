import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MapPin, Phone, Mail } from "lucide-react";
import { PageHero } from "../components/PageHero";
import { SITE_IMAGE_SLOTS } from "@/site-settings/interfaces/site-images.interface"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SITE_INFO } from "@/constants/site";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/contact/schemas/contact.schema";
import { sendContactMessageAction } from "@/contact/actions/send-contact-message";
import { getApiErrorMessage } from "@/api/petrogasApi";

const CONTACT_INFO = [
  { icon: MapPin, label: "Dirección", value: SITE_INFO.address },
  { icon: Phone, label: "Teléfonos", value: SITE_INFO.phones },
  { icon: Mail, label: "Email", value: SITE_INFO.email },
];

export const ContactoPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    // El campo trampa arranca vacío y se resetea con el resto tras enviar.
    defaultValues: { referencia: "" },
  });

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: sendContactMessageAction,
    onSuccess: () => reset(),
  });

  const onSubmit = (values: ContactFormValues) => mutate(values);

  return (
    <>
      <PageHero
        eyebrow="Estamos para ayudarte"
        title="Contacto"
        slot={SITE_IMAGE_SLOTS.bannerContacto}
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl page-container grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <h2 className="font-heading uppercase font-semibold text-navy-800 text-2xl mb-6">
              Contactate con nosotros
            </h2>
            <div className="space-y-6">
              {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-lg bg-navy-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-heading uppercase text-navy-800 text-sm tracking-wide">
                      {label}
                    </p>
                    <p className="text-gray-600">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-xl overflow-hidden ring-1 ring-gray-200 h-64">
              <iframe
                title="Ubicación Petrogas S.A - Cutral-Có"
                src={SITE_INFO.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-gray-50 rounded-2xl ring-1 ring-gray-100 p-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">N° de teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="299-0000000"
                    {...register("phone")}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    placeholder="Motivo de tu consulta"
                    {...register("subject")}
                  />
                </div>
              </div>
              {/* Campo trampa (honeypot). Una persona no puede completarlo:
                  está fuera de la pantalla, no se llega con el tabulador y los
                  lectores de pantalla lo saltean. Los bots sí lo llenan, y ahí
                  el backend descarta el mensaje en silencio.

                  Cada atributo está por algo:
                  - type="text" y NO hidden: los bots saltean los hidden porque
                    saben que son del sistema.
                  - fuera de pantalla y no display:none, que es trivial de
                    detectar y muchos bots ignoran.
                  - tabIndex -1 y aria-hidden para que ninguna persona caiga
                    adentro sin verlo, ni con teclado ni con lector.
                  - autoComplete off para que no lo complete el navegador.
                  - el nombre "referencia" está elegido para no disparar el
                    autocompletado: nada de empresa, sitio-web o email2.
                  No lleva label ni validación, y nunca bloquea el envío. */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                }}
                {...register("referencia")}
              />

              <div className="mt-5">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  rows={6}
                  placeholder="Escribí tu mensaje..."
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg"
                >
                  {isPending ? "Enviando..." : "Enviar"}
                </Button>
                {isSuccess && (
                  <p className="text-green-600 text-sm">
                    ✓ ¡Gracias! Tu mensaje fue enviado correctamente.
                  </p>
                )}
                {isError && (
                  <p className="text-red-600 text-sm">
                    {getApiErrorMessage(
                      error,
                      "No pudimos enviar tu mensaje. Intentá de nuevo en unos minutos.",
                    )}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
