import { useMemo, useState, useCallback } from 'react'
import { WIRE_DATA, DEFAULT_WIRE_GAUGE } from './constants/wireData'
import { calculateMultiSegmentVoltageDrop, VoltageDropResult, VoltageDropStatus, WireSegment } from './utils/voltageDropCalculator'

interface SegmentState {
  id: number;
  gauge: string;
  length: string;
}

let nextId = 1;

// ── SystemVoltageToggle ────────────────────────────────────────────────────────
function SystemVoltageToggle({
  value,
  onChange,
}: {
  value: 12 | 24 | 120
  onChange: (v: 12 | 24 | 120) => void
}) {
  return (
    <div className="input-group">
      <span className="input-label">System Voltage</span>
      <div className="volt-toggle">
        {([12, 24, 120] as const).map((v) => (
          <button
            key={v}
            className={`volt-btn${value === v ? ' active' : ''}`}
            onClick={() => onChange(v)}
            type="button"
          >
            {v}V
          </button>
        ))}
      </div>
    </div>
  )
}

// ── NumericInput ──────────────────────────────────────────────────────────────
function NumericInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  unit,
  helpText,
}: {
  id: string
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  unit: string
  helpText?: string
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const filtered = raw.replace(/[^0-9.]/g, '')
    if (filtered.split('.').length > 2) return
    onChange(filtered)
  }

  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="input-wrap">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="off"
        />
        <span className="input-unit">{unit}</span>
      </div>
      {helpText && <p className="input-help">{helpText}</p>}
    </div>
  )
}

// ── SegmentCard ──────────────────────────────────────────────────────────────
function SegmentCard({
  segment,
  index,
  canRemove,
  onUpdate,
  onRemove,
}: {
  segment: SegmentState
  index: number
  canRemove: boolean
  onUpdate: (id: number, field: 'gauge' | 'length', value: string) => void
  onRemove: (id: number) => void
}) {
  return (
    <div className="segment-card">
      <div className="segment-header">
        <span className="segment-title">Segment {index + 1}</span>
        {canRemove && (
          <button
            className="segment-remove"
            onClick={() => onRemove(segment.id)}
            type="button"
            aria-label="Remove segment"
          >
            Remove
          </button>
        )}
      </div>
      <div className="segment-fields">
        <div className="segment-field">
          <label className="input-label" htmlFor={`gauge-${segment.id}`}>
            Wire Gauge
          </label>
          <select
            id={`gauge-${segment.id}`}
            className="gauge-select"
            value={segment.gauge}
            onChange={(e) => onUpdate(segment.id, 'gauge', e.target.value)}
          >
            {WIRE_DATA.map((wire) => (
              <option key={wire.awg} value={wire.awg}>
                {wire.label} — {wire.maxAmps}A max
              </option>
            ))}
          </select>
        </div>
        <div className="segment-field">
          <NumericInput
            id={`length-${segment.id}`}
            label="Length"
            value={segment.length}
            onChange={(v) => onUpdate(segment.id, 'length', v)}
            placeholder="ft"
            unit="ft"
          />
        </div>
      </div>
    </div>
  )
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<VoltageDropStatus, { label: string; icon: string; cls: string }> = {
  good:    { label: 'PASS — Under 3%',    icon: '✓', cls: 'good' },
  warning: { label: 'CAUTION — 3% to 5%', icon: '!', cls: 'warn' },
  fail:    { label: 'FAIL — Over 5%',     icon: '✕', cls: 'fail' },
}

function StatusBadge({ status }: { status: VoltageDropStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div className={`status-badge ${cfg.cls}`}>
      <span className="status-icon">{cfg.icon}</span>
      <span className="status-text">{cfg.label}</span>
    </div>
  )
}

// ── ResultsCard ───────────────────────────────────────────────────────────────
function ResultsCard({ result, multiSegment }: { result: VoltageDropResult | null; multiSegment: boolean }) {
  const empty = !result

  return (
    <div className="results-card">
      <div className="results-title">Results</div>
      <div className="results-divider" />

      {/* Per-segment breakdown when pigtailing */}
      {result && multiSegment && result.segments.length > 1 && (
        <>
          <div className="segment-breakdown-title">Per-Segment Breakdown</div>
          {result.segments.map((seg, i) => (
            <div key={i} className="segment-breakdown-row">
              <span className="segment-breakdown-label">
                Seg {i + 1}: {seg.label}, {seg.lengthFeet} ft
              </span>
              <span className="segment-breakdown-value">
                {seg.voltageDrop.toFixed(3)} V ({seg.voltageDropPercent.toFixed(2)}%)
              </span>
            </div>
          ))}
          <div className="results-divider" />
        </>
      )}

      <div className="result-row">
        <span className="result-label">{multiSegment ? 'Total ' : ''}Voltage Drop</span>
        <div className="result-value-wrap">
          <span className="result-value">
            {empty ? '—' : result.voltageDrop.toFixed(3)}
          </span>
          {!empty && <span className="result-unit">V</span>}
        </div>
      </div>

      <div className="result-row">
        <span className="result-label">Drop Percentage</span>
        <div className="result-value-wrap">
          <span className="result-value">
            {empty ? '—' : result.voltageDropPercent.toFixed(2)}
          </span>
          {!empty && <span className="result-unit">%</span>}
        </div>
      </div>

      <div className="result-row">
        <span className="result-label">Voltage at Load</span>
        <div className="result-value-wrap">
          <span className="result-value">
            {empty ? '—' : result.voltageAtLoad.toFixed(3)}
          </span>
          {!empty && <span className="result-unit">V</span>}
        </div>
      </div>

      {result && (
        <>
          <StatusBadge status={result.status} />
          {result.recommendation && (
            <p className="recommendation">{result.recommendation}</p>
          )}
        </>
      )}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [systemVoltage, setSystemVoltage] = useState<12 | 24 | 120>(12)
  const [segments, setSegments] = useState<SegmentState[]>([
    { id: nextId++, gauge: DEFAULT_WIRE_GAUGE, length: '' },
  ])
  const [current, setCurrent] = useState('')
  const [multiSegment, setMultiSegment] = useState(false)

  const addSegment = useCallback(() => {
    setMultiSegment(true)
    setSegments((prev) => {
      const lastGauge = prev[prev.length - 1]?.gauge ?? DEFAULT_WIRE_GAUGE
      // Default the new segment to one gauge smaller (thinner) for a typical pigtail
      const lastIdx = WIRE_DATA.findIndex((w) => w.awg === lastGauge)
      const smallerIdx = Math.max(0, lastIdx - 1)
      return [...prev, { id: nextId++, gauge: WIRE_DATA[smallerIdx].awg, length: '' }]
    })
  }, [])

  const removeSegment = useCallback((id: number) => {
    setSegments((prev) => {
      const next = prev.filter((s) => s.id !== id)
      if (next.length <= 1) setMultiSegment(false)
      return next
    })
  }, [])

  const updateSegment = useCallback((id: number, field: 'gauge' | 'length', value: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }, [])

  const result = useMemo(() => {
    const amps = parseFloat(current)
    if (isNaN(amps) || amps <= 0) return null

    const wireSegments: WireSegment[] = []
    for (const seg of segments) {
      const len = parseFloat(seg.length)
      if (isNaN(len) || len <= 0) return null
      wireSegments.push({ wireGaugeAwg: seg.gauge, lengthFeet: len })
    }

    return calculateMultiSegmentVoltageDrop({
      systemVoltage,
      segments: wireSegments,
      currentAmps: amps,
    })
  }, [systemVoltage, segments, current])

  return (
    <div className="app">
      <header className="header">
        <div className="header-title">VoltCalc</div>
        <div className="header-subtitle">Van Build Voltage Drop Calculator</div>
      </header>

      <SystemVoltageToggle value={systemVoltage} onChange={setSystemVoltage} />

      <div className="section-header">
        <span className="input-label">Wire Run</span>
        {!multiSegment && (
          <button className="pigtail-btn" onClick={addSegment} type="button">
            + Add Pigtail
          </button>
        )}
      </div>

      {!multiSegment ? (
        <>
          <div className="input-group">
            <select
              id="wire-gauge"
              className="gauge-select"
              value={segments[0].gauge}
              onChange={(e) => updateSegment(segments[0].id, 'gauge', e.target.value)}
            >
              {WIRE_DATA.map((wire) => (
                <option key={wire.awg} value={wire.awg}>
                  {wire.label} — {wire.maxAmps}A max
                </option>
              ))}
            </select>
          </div>
          <NumericInput
            id="wire-length"
            label="One-Way Wire Length"
            value={segments[0].length}
            onChange={(v) => updateSegment(segments[0].id, 'length', v)}
            placeholder="e.g. 15"
            unit="ft"
            helpText="Distance from battery/fuse box to device. Return path is calculated automatically."
          />
        </>
      ) : (
        <>
          <p className="input-help" style={{ marginBottom: 12 }}>
            Define each wire segment from source to load. The calculator sums the voltage drop across all segments.
          </p>
          {segments.map((seg, i) => (
            <SegmentCard
              key={seg.id}
              segment={seg}
              index={i}
              canRemove={segments.length > 1}
              onUpdate={updateSegment}
              onRemove={removeSegment}
            />
          ))}
          <button className="add-segment-btn" onClick={addSegment} type="button">
            + Add Segment
          </button>
        </>
      )}

      <NumericInput
        id="current"
        label="Current Draw"
        value={current}
        onChange={setCurrent}
        placeholder="e.g. 10"
        unit="A"
      />

      <ResultsCard result={result} multiSegment={multiSegment} />

      <p className="footer">
        For reference only. Always consult a qualified electrician and follow
        manufacturer specifications.
      </p>
    </div>
  )
}
