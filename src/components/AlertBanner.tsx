'use client'

interface AlertBannerProps {
  type: 'warning' | 'danger' | 'success' | 'info'
  title: string
  message: string
  onDismiss?: () => void
}

const alertStyles = {
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/30',
    icon: 'text-amber-400',
    title: 'text-amber-300',
    text: 'text-amber-200/80',
    iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  },
  danger: {
    bg: 'bg-red-500/10 border-red-500/30',
    icon: 'text-red-400',
    title: 'text-red-300',
    text: 'text-red-200/80',
    iconPath: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z',
  },
  success: {
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    icon: 'text-emerald-400',
    title: 'text-emerald-300',
    text: 'text-emerald-200/80',
    iconPath: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  info: {
    bg: 'bg-sky-500/10 border-sky-500/30',
    icon: 'text-sky-400',
    title: 'text-sky-300',
    text: 'text-sky-200/80',
    iconPath: 'M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
  },
}

export default function AlertBanner({ type, title, message, onDismiss }: AlertBannerProps) {
  const styles = alertStyles[type]

  return (
    <div className={`rounded-xl border p-3 ${styles.bg} flex items-start gap-3`}>
      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={styles.iconPath} />
      </svg>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${styles.title}`}>{title}</p>
        <p className={`text-xs mt-0.5 ${styles.text}`}>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
