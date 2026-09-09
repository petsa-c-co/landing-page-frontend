import type { PaginationMeta } from "@/api/types"

interface PaginationProps {
  meta: PaginationMeta
  onChange: (page: number) => void
}

export const Pagination = ({ meta, onChange }: PaginationProps) => {
  if (meta.totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-gray-100 dark:border-navy-800">
      <p className="text-gray-500 dark:text-navy-400 text-xs">
        {meta.totalItems} resultado{meta.totalItems === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(meta.currentPage - 1)}
          disabled={!meta.hasPrevPage}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-navy-700 text-navy-700 dark:text-navy-200 text-xs font-heading uppercase tracking-wide hover:bg-gray-50 dark:hover:bg-navy-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
        >
          Anterior
        </button>
        <span className="text-gray-500 dark:text-navy-400 text-xs">
          {meta.currentPage} / {meta.totalPages}
        </span>
        <button
          type="button"
          onClick={() => onChange(meta.currentPage + 1)}
          disabled={!meta.hasNextPage}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-navy-700 text-navy-700 dark:text-navy-200 text-xs font-heading uppercase tracking-wide hover:bg-gray-50 dark:hover:bg-navy-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
