import { useMemo, useState, useCallback } from 'react'
import { WIRE_DATA, DEFAULT_WIRE_GAUGE } from './constants/wireData'
import { calculateMultiSegmentVoltageDrop, VoltageDropResult, VoltageDropStatus, WireSegment } from './utils/voltageDropCalculator'

interface SegmentState {
  id: number;
  gauge: string;
  length: string;
}

let nextId = 1;

// ── InfoBox ──────────────────────────────────────────────────────────────────
function InfoBox({ children }: { children: React.ReactNode }) {
  return <div className="info-box">{children}</div>
}

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
      <p className="input-help" style={{ marginBottom: 8 }}>
        The voltage your battery or power source provides. Most vans use 12V. Larger builds sometimes use 24V. 120V is for AC circuits (inverter, shore power).
      </p>
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
  total,
  canRemove,
  onUpdate,
  onRemove,
}: {
  segment: SegmentState
  index: number
  total: number
  canRemove: boolean
  onUpdate: (id: number, field: 'gauge' | 'length', value: string) => void
  onRemove: (id: number) => void
}) {
  const segLabel = index === 0
    ? 'Thicker wire (from battery/fuse box)'
    : index === total - 1
      ? 'Thinner wire (to device)'
      : `Middle section`

  return (
    <div className="segment-card">
      <div className="segment-header">
        <div>
          <span className="segment-title">Segment {index + 1}</span>
          <span className="segment-subtitle">{segLabel}</span>
        </div>
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
const STATUS_CONFIG: Record<VoltageDropStatus, { label: string; icon: string; cls: string; explain: string }> = {
  good: {
    label: 'PASS — Under 3%',
    icon: '✓',
    cls: 'good',
    explain: 'Your wiring is sized well for this circuit. Your device will get plenty of power.',
  },
  warning: {
    label: 'CAUTION — 3% to 5%',
    icon: '!',
    cls: 'warn',
    explain: 'This will work, but your device is getting noticeably less power than it should. Lights may dim, fans may run slower. Consider thicker wire.',
  },
  fail: {
    label: 'FAIL — Over 5%',
    icon: '✕',
    cls: 'fail',
    explain: 'Too much power is being lost as heat in the wire. This can cause dim lights, slow motors, or even overheating. Use thicker wire or shorten the run.',
  },
}

function StatusBadge({ status }: { status: VoltageDropStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <>
      <div className={`status-badge ${cfg.cls}`}>
        <span className="status-icon">{cfg.icon}</span>
        <span className="status-text">{cfg.label}</span>
      </div>
      <p className="status-explain">{cfg.explain}</p>
    </>
  )
}

// ── ResultsCard ───────────────────────────────────────────────────────────────
function ResultsCard({ result, multiSegment }: { result: VoltageDropResult | null; multiSegment: boolean }) {
  const empty = !result

  return (
    <div className="results-card">
      <div className="results-title">Results</div>
      {empty && (
        <p className="input-help" style={{ marginTop: 8 }}>
          Fill in the fields above to see your voltage drop calculation.
        </p>
      )}
      <div className="results-divider" />

      {/* Per-segment breakdown when pigtailing */}
      {result && multiSegment && result.segments.length > 1 && (
        <>
          <div className="segment-breakdown-title">Per-Segment Breakdown</div>
          <p className="input-help" style={{ marginBottom: 8 }}>
            How much voltage each section of wire loses.
          </p>
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
        <div>
          <span className="result-label">{multiSegment ? 'Total ' : ''}Voltage Drop</span>
          {!empty && <span className="result-sublabel">Power lost in the wire</span>}
        </div>
        <div className="result-value-wrap">
          <span className="result-value">
            {empty ? '—' : result.voltageDrop.toFixed(3)}
          </span>
          {!empty && <span className="result-unit">V</span>}
        </div>
      </div>

      <div className="result-row">
        <div>
          <span className="result-label">Drop Percentage</span>
          {!empty && <span className="result-sublabel">Keep this under 3%</span>}
        </div>
        <div className="result-value-wrap">
          <span className="result-value">
            {empty ? '—' : result.voltageDropPercent.toFixed(2)}
          </span>
          {!empty && <span className="result-unit">%</span>}
        </div>
      </div>

      <div className="result-row">
        <div>
          <span className="result-label">Voltage at Device</span>
          {!empty && <span className="result-sublabel">What your device actually receives</span>}
        </div>
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

      <InfoBox>
        Electricity loses some power as it travels through wire. Longer runs and thinner wire lose more. This tool checks if your wire is thick enough for the job.
      </InfoBox>

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
            <label className="input-label" htmlFor="wire-gauge">Wire Gauge (thickness)</label>
            <p className="input-help" style={{ marginBottom: 8 }}>
              Lower AWG number = thicker wire = less voltage drop. Check the writing printed on your wire to find the gauge.
            </p>
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
            helpText="Measure just the distance from your battery or fuse box to the device — don't double it. The calculator already accounts for the return wire (ground) automatically."
          />
        </>
      ) : (
        <>
          <p className="input-help" style={{ marginBottom: 12 }}>
            A pigtail is when you connect different wire sizes together — like running thick wire from your battery to a junction, then thinner wire to each device. Enter each section below.
          </p>
          {segments.map((seg, i) => (
            <SegmentCard
              key={seg.id}
              segment={seg}
              index={i}
              total={segments.length}
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
        label="Current Draw (Amps)"
        value={current}
        onChange={setCurrent}
        placeholder="e.g. 10"
        unit="A"
        helpText="How much power your device uses, in amps. Check the label on your device, or look up the spec sheet. Tip: Watts ÷ Volts = Amps."
      />

      <ResultsCard result={result} multiSegment={multiSegment} />

      <p className="footer">
        For reference only. Always consult a qualified electrician and follow
        manufacturer specifications.
      </p>
    </div>
  )
}
