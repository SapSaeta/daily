'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AlertBanner from '@/components/AlertBanner'

type SessionTab = 'swim' | 'band' | 'weight'

const swimSessionTypes = [
  { value: 'TECHNIQUE', label: 'Técnica', desc: 'Drills y técnica de crol' },
  { value: 'AEROBIC_BASE', label: 'Fondo aeróbico', desc: 'Ritmo constante y cómodo' },
  { value: 'INTERVALS', label: 'Series', desc: 'Velocidad e intensidad' },
  { value: 'RECOVERY', label: 'Recuperación', desc: 'Nado suave de recuperación' },
  { value: 'CONTROLLED_PACE', label: 'Ritmo controlado', desc: 'Series a ritmo objetivo' },
]

function PainScale({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (v: number) => void
  label: string
}) {
  const getPainColor = (v: number) => {
    if (v === 0) return 'bg-slate-700 text-slate-400'
    if (v <= 2) return 'bg-emerald-500 text-white'
    if (v <= 4) return 'bg-amber-500 text-white'
    if (v <= 6) return 'bg-orange-500 text-white'
    if (v <= 8) return 'bg-red-500 text-white'
    return 'bg-red-700 text-white'
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: 11 }, (_, i) => i).map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-100 ${
              value === i
                ? getPainColor(i) + ' scale-110 shadow-lg'
                : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 mt-1">
        {value === 0 ? 'Sin dolor' : value <= 2 ? 'Muy leve' : value <= 4 ? 'Leve' : value <= 6 ? 'Moderado' : value <= 8 ? 'Intenso' : 'Muy intenso'}
      </p>
    </div>
  )
}

function EffortScale({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (v: number) => void
  label: string
}) {
  const effortLabels = ['', 'Muy suave', 'Suave', 'Moderado', 'Intenso', 'Máximo']
  const effortColors = ['', 'bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500']

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all duration-100 ${
              value === i
                ? effortColors[i] + ' text-white scale-105 shadow-lg'
                : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-[10px] text-slate-500 mt-1">{effortLabels[value]}</p>
      )}
    </div>
  )
}

function RegistroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('type') as SessionTab) || 'swim'

  const [activeTab, setActiveTab] = useState<SessionTab>(initialTab)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  // Swim form state
  const [swimForm, setSwimForm] = useState({
    date: new Date().toISOString().split('T')[0],
    distanceMeters: '',
    durationMinutes: '',
    sessionType: 'AEROBIC_BASE',
    effort1to5: 3,
    shoulderPainBefore0to10: 0,
    shoulderPainAfter0to10: 0,
    fatigue1to5: 3,
    notes: '',
  })

  // Weight form state
  const [weightForm, setWeightForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: '',
    notes: '',
  })

  // Band form state
  const [bandForm, setBandForm] = useState({
    date: new Date().toISOString().split('T')[0],
    durationMinutes: '30',
    effort1to5: 2,
    shoulderPain0to10: 0,
    notes: '',
  })

  const handleSwimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!swimForm.distanceMeters || !swimForm.durationMinutes) {
      setMessage({ type: 'danger', text: 'Por favor completa distancia y duración.' })
      return
    }
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swimForm),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: '¡Sesión de natación registrada correctamente!' })
        setSwimForm({
          date: new Date().toISOString().split('T')[0],
          distanceMeters: '',
          durationMinutes: '',
          sessionType: 'AEROBIC_BASE',
          effort1to5: 3,
          shoulderPainBefore0to10: 0,
          shoulderPainAfter0to10: 0,
          fatigue1to5: 3,
          notes: '',
        })
        setTimeout(() => router.push('/historial'), 1500)
      } else {
        const err = await res.json()
        setMessage({ type: 'danger', text: err.error || 'Error al guardar la sesión.' })
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión. Inténtalo de nuevo.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!weightForm.weightKg) {
      setMessage({ type: 'danger', text: 'Por favor introduce tu peso.' })
      return
    }
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weightForm),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: '¡Peso registrado correctamente!' })
        setWeightForm({
          date: new Date().toISOString().split('T')[0],
          weightKg: '',
          notes: '',
        })
      } else {
        const err = await res.json()
        setMessage({ type: 'danger', text: err.error || 'Error al guardar el peso.' })
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión. Inténtalo de nuevo.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleBandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/band-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bandForm),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: '¡Sesión de bandas registrada correctamente!' })
        setBandForm({
          date: new Date().toISOString().split('T')[0],
          durationMinutes: '30',
          effort1to5: 2,
          shoulderPain0to10: 0,
          notes: '',
        })
        setTimeout(() => router.push('/historial'), 1500)
      } else {
        const err = await res.json()
        setMessage({ type: 'danger', text: err.error || 'Error al guardar la sesión.' })
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión. Inténtalo de nuevo.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">Registrar sesión</h1>
        <p className="text-sm text-slate-400 mt-0.5">Añade tu entrenamiento de hoy</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => { setActiveTab('swim'); setMessage(null) }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
            activeTab === 'swim'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Natación
        </button>
        <button
          onClick={() => { setActiveTab('band'); setMessage(null) }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
            activeTab === 'band'
              ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Bandas
        </button>
        <button
          onClick={() => { setActiveTab('weight'); setMessage(null) }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
            activeTab === 'weight'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Peso
        </button>
      </div>

      {/* Message */}
      {message && (
        <AlertBanner
          type={message.type}
          title={message.type === 'success' ? '¡Guardado!' : 'Error'}
          message={message.text}
          onDismiss={() => setMessage(null)}
        />
      )}

      {/* Swim form */}
      {activeTab === 'swim' && (
        <form onSubmit={handleSwimSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="label">Fecha</label>
            <input
              type="date"
              value={swimForm.date}
              onChange={(e) => setSwimForm({ ...swimForm, date: e.target.value })}
              className="input-field"
              required
            />
          </div>

          {/* Session type */}
          <div>
            <label className="label">Tipo de sesión</label>
            <div className="space-y-2">
              {swimSessionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSwimForm({ ...swimForm, sessionType: type.value })}
                  className={`w-full p-3 rounded-xl border text-left transition-all duration-150 ${
                    swimForm.sessionType === type.value
                      ? 'bg-sky-500/10 border-sky-500/50 text-sky-100'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <p className="text-sm font-semibold">{type.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Distance and duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Distancia (m)</label>
              <input
                type="number"
                placeholder="2000"
                value={swimForm.distanceMeters}
                onChange={(e) => setSwimForm({ ...swimForm, distanceMeters: e.target.value })}
                className="input-field"
                min={100}
                max={10000}
                required
              />
            </div>
            <div>
              <label className="label">Duración (min)</label>
              <input
                type="number"
                placeholder="60"
                value={swimForm.durationMinutes}
                onChange={(e) => setSwimForm({ ...swimForm, durationMinutes: e.target.value })}
                className="input-field"
                min={10}
                max={300}
                required
              />
            </div>
          </div>

          {/* Effort */}
          <EffortScale
            value={swimForm.effort1to5}
            onChange={(v) => setSwimForm({ ...swimForm, effort1to5: v })}
            label="Esfuerzo percibido (RPE)"
          />

          {/* Fatigue */}
          <EffortScale
            value={swimForm.fatigue1to5}
            onChange={(v) => setSwimForm({ ...swimForm, fatigue1to5: v })}
            label="Fatiga post-sesión"
          />

          {/* Shoulder pain before */}
          <PainScale
            value={swimForm.shoulderPainBefore0to10}
            onChange={(v) => setSwimForm({ ...swimForm, shoulderPainBefore0to10: v })}
            label="Dolor de hombro ANTES (0-10)"
          />

          {/* Shoulder pain after */}
          <PainScale
            value={swimForm.shoulderPainAfter0to10}
            onChange={(v) => setSwimForm({ ...swimForm, shoulderPainAfter0to10: v })}
            label="Dolor de hombro DESPUÉS (0-10)"
          />

          {/* Pain increase warning */}
          {swimForm.shoulderPainAfter0to10 > swimForm.shoulderPainBefore0to10 + 2 && (
            <AlertBanner
              type="warning"
              title="Aumento de dolor"
              message="El dolor aumentó significativamente durante la sesión. Considera una sesión de recuperación mañana."
            />
          )}

          {swimForm.shoulderPainAfter0to10 >= 7 && (
            <AlertBanner
              type="danger"
              title="Dolor elevado"
              message="Dolor >= 7/10. Recomendamos consultar con tu fisioterapeuta antes de la próxima sesión."
            />
          )}

          {/* Notes */}
          <div>
            <label className="label">Notas (opcional)</label>
            <textarea
              placeholder="Cómo fue la sesión, sensaciones, observaciones..."
              value={swimForm.notes}
              onChange={(e) => setSwimForm({ ...swimForm, notes: e.target.value })}
              className="input-field resize-none h-20"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : 'Guardar sesión de natación'}
          </button>
        </form>
      )}

      {/* Weight form */}
      {activeTab === 'weight' && (
        <form onSubmit={handleWeightSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="label">Fecha</label>
            <input
              type="date"
              value={weightForm.date}
              onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })}
              className="input-field"
              required
            />
          </div>

          {/* Weight input */}
          <div>
            <label className="label">Peso (kg)</label>
            <div className="relative">
              <input
                type="number"
                placeholder="75.5"
                value={weightForm.weightKg}
                onChange={(e) => setWeightForm({ ...weightForm, weightKg: e.target.value })}
                className="input-field pr-12"
                step="0.1"
                min="20"
                max="300"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">kg</span>
            </div>
          </div>

          {/* Quick weight buttons */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Ajuste rápido</p>
            <div className="flex gap-2">
              {[-1, -0.5, +0.5, +1].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => {
                    const current = parseFloat(weightForm.weightKg) || 0
                    const next = Math.round((current + delta) * 10) / 10
                    setWeightForm({ ...weightForm, weightKg: String(next > 0 ? next : '') })
                  }}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-400 hover:bg-slate-700 transition-all"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notas (opcional)</label>
            <input
              type="text"
              placeholder="Ej: en ayunas, después de entrenar..."
              value={weightForm.notes}
              onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Info */}
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
            <p className="text-xs text-emerald-400 font-semibold mb-1">Consejo</p>
            <p className="text-xs text-slate-400">Para mayor consistencia, pésate siempre en las mismas condiciones: por la mañana, en ayunas y después de ir al baño.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-150 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : 'Guardar peso'}
          </button>
        </form>
      )}

      {/* Band form */}
      {activeTab === 'band' && (
        <form onSubmit={handleBandSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="label">Fecha</label>
            <input
              type="date"
              value={bandForm.date}
              onChange={(e) => setBandForm({ ...bandForm, date: e.target.value })}
              className="input-field"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="label">Duración (minutos)</label>
            <div className="flex gap-2 mb-2">
              {[20, 30, 45, 60].map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setBandForm({ ...bandForm, durationMinutes: String(min) })}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    bandForm.durationMinutes === String(min)
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Otros minutos"
              value={bandForm.durationMinutes}
              onChange={(e) => setBandForm({ ...bandForm, durationMinutes: e.target.value })}
              className="input-field"
              min={10}
              max={120}
              required
            />
          </div>

          {/* Effort */}
          <EffortScale
            value={bandForm.effort1to5}
            onChange={(v) => setBandForm({ ...bandForm, effort1to5: v })}
            label="Esfuerzo percibido (RPE)"
          />

          {/* Pain */}
          <PainScale
            value={bandForm.shoulderPain0to10}
            onChange={(v) => setBandForm({ ...bandForm, shoulderPain0to10: v })}
            label="Dolor de hombro durante sesión (0-10)"
          />

          {bandForm.shoulderPain0to10 >= 5 && (
            <AlertBanner
              type="warning"
              title="Dolor moderado-alto"
              message="Si el dolor persiste o supera 5/10 durante los ejercicios, detén la sesión y descansa."
            />
          )}

          {/* Notes */}
          <div>
            <label className="label">Notas (opcional)</label>
            <textarea
              placeholder="Ejercicios realizados, sensaciones, progresiones..."
              value={bandForm.notes}
              onChange={(e) => setBandForm({ ...bandForm, notes: e.target.value })}
              className="input-field resize-none h-20"
              rows={3}
            />
          </div>

          {/* Exercise hint */}
          <div className="card-sm border-violet-500/20">
            <p className="text-xs font-semibold text-violet-400 mb-1">Recordatorio de ejercicios</p>
            <ul className="text-xs text-slate-400 space-y-0.5">
              <li>• Rotación externa con banda (3×15)</li>
              <li>• Retracción escapular (3×15)</li>
              <li>• Remo con banda (3×15)</li>
              <li>• Elevación lateral reducida (3×12)</li>
              <li>• Estiramientos finales (5 min)</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-150 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : 'Guardar sesión de bandas'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="px-4 pt-6"><div className="h-8 shimmer rounded-xl w-48 mb-2" /><div className="h-4 shimmer rounded-xl w-32" /></div>}>
      <RegistroContent />
    </Suspense>
  )
}
