import { useToastStore } from '../store/toastStore'
import './ToastContainer.css'

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          <span>{toast.message}</span>
          <button type="button" className="toast-close" aria-label="Fermer" onClick={() => dismiss(toast.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
