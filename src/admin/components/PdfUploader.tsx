import { useRef, useState } from "react"
import { ExternalLink, FileText, Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/api/petrogasApi"
import {
  MAX_DOCUMENT_SIZE_BYTES,
  uploadDocumentAction,
} from "../actions/media.actions"

interface PdfUploaderProps {
  label: string
  // URL absoluta actual del PDF ya guardado (para el enlace de "ver").
  previewUrl?: string | null
  // Devuelve la key a mandar en el campo de la entidad, o null si se quita.
  onUploaded: (key: string | null) => void
  className?: string
}

// Mismo flujo en dos pasos que las imágenes: se sube el PDF, se obtiene la key
// y esa key se manda al guardar la entidad. Endpoint POST /media/documents.
export const PdfUploader = ({
  label,
  previewUrl,
  onUploaded,
  className,
}: PdfUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  // Nombre del archivo recién subido (el previewUrl guardado no lo trae).
  const [uploadedName, setUploadedName] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(previewUrl ?? null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return

    if (file.type !== "application/pdf") {
      toast.error("El certificado debe ser un archivo PDF")
      return
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      toast.error("El PDF no puede superar los 10 MB")
      return
    }

    setUploading(true)
    try {
      const media = await uploadDocumentAction(file)
      setUrl(media.url)
      setUploadedName(file.name)
      onUploaded(media.key)
      toast.success("Certificado subido")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No pudimos subir el certificado"))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const clear = () => {
    setUrl(null)
    setUploadedName(null)
    onUploaded(null)
  }

  return (
    <div className={className}>
      <p className="block font-heading text-sm uppercase tracking-wide text-navy-700 dark:text-navy-200 mb-1.5">
        {label}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {url ? (
        <div className="flex items-center gap-3 rounded-lg border border-gray-300 dark:border-navy-700 bg-gray-50 dark:bg-navy-950 px-4 py-3">
          <FileText className="w-6 h-6 text-sky-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <a
              href={url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-sm truncate hover:underline"
            >
              {uploadedName ?? "Ver certificado cargado"}
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
            <p className="text-gray-400 dark:text-navy-400 text-xs">PDF</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 text-xs font-heading uppercase text-navy-600 dark:text-navy-300 hover:text-sky-500"
          >
            Cambiar
          </button>
          <button
            type="button"
            onClick={clear}
            aria-label="Quitar el certificado"
            className="shrink-0 text-gray-400 hover:text-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition",
            uploading
              ? "border-gray-200 dark:border-navy-800 bg-gray-50 dark:bg-navy-950"
              : "border-gray-300 dark:border-navy-700 hover:border-sky-400 hover:bg-sky-50/40 dark:hover:bg-navy-800/40",
          )}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-sky-500" />
              <span className="text-gray-400 dark:text-navy-400 text-xs">
                Certificado en PDF · hasta 10 MB
              </span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
