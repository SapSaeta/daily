'use client'

interface AlertBannerProps {
  type: 'warning' | 'danger' | 'success' | 'info'
  title: string
  message: string
  onDismiss?: () => void
}

const alertStyles = {
  warning: {
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.2)',
    bar: '#fbbf24',
    icon: '#fbbf24',
    title: '#fde68a',
    text: 'rgba(253,230,138,0.7)',
    iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  },
  danger: {
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.2)',
    bar: '#f87171',
    icon: '#f87171',
    title: '#fca5a5',
    text: 'rgba(252,165,165,0.7)',
    iconPath: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z',
  },
  success: {
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.2)',
    bar: '#34d399',
    icon: '#34d399',
    title: '#6ee7b7',
    text: 'rgba(110,231,183,0.7)',
    iconPath: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  info: {
    bg: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.2)',
    bar: '#38bdf8',
    icon: '#38bdf8',
    title: '#7dd3fc',
    text: 'rgba(125,211,252,0.7)',
    iconPath: 'M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
  },
}

export default function AlertBanner({ type, title, message, onDismiss }: AlertBannerProps) {
  const s = alertStyles[type]

  return (
    <div
      className="rounded-2xl flex items-start gap-3 p-3.5 overflow-hidden relative"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      {/* Left color bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: s.bar }}
      />
      <div className="pl-1 flex items-start gap-3 flex-1">
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ color: s.icon }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={s.iconPath} />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: s.title }}>{title}</p>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: s.text }}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 transition-opacity hover:opacity-60"
            style={{ color: s.icon }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
