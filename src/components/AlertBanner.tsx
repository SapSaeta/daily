'use client'

interface AlertBannerProps {
  type: 'warning' | 'danger' | 'success' | 'info'
  title: string
  message: string
  onDismiss?: () => void
}

const alertStyles = {
  warning: {
    bg: '#fffbeb',
    border: '#fde68a',
    bar: '#d97706',
    icon: '#d97706',
    title: '#92400e',
    text: '#78350f',
    iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  },
  danger: {
    bg: '#fef2f2',
    border: '#fecaca',
    bar: '#dc2626',
    icon: '#dc2626',
    title: '#991b1b',
    text: '#7f1d1d',
    iconPath: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z',
  },
  success: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    bar: '#059669',
    icon: '#059669',
    title: '#14532d',
    text: '#166534',
    iconPath: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  info: {
    bg: '#f0f9ff',
    border: '#bae6fd',
    bar: '#0284c7',
    icon: '#0284c7',
    title: '#0c4a6e',
    text: '#075985',
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
