import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Toast as ToastType } from '@/hooks/useToast'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const variants = {
    default: "bg-white border-gray-200 text-gray-900",
    destructive: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={cn(
        "fixed top-4 right-4 z-50 w-96 p-4 border rounded-lg shadow-lg",
        variants[toast.variant || 'default']
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold">{toast.title}</h3>
          {toast.description && (
            <p className="text-sm opacity-80 mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="ml-4 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}

interface ToastProviderProps {
  toasts: ToastType[]
  onDismiss: (id: string) => void
}

export function ToastProvider({ toasts, onDismiss }: ToastProviderProps) {
  return (
    <AnimatePresence>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </AnimatePresence>
  )
}