import { useMemo, useRef, useState } from 'react'
import { WIRE_DATA, DEFAULT_WIRE_GAUGE } from './constants/wireData'
import { calculateVoltageDrop, VoltageDropResult, VoltageDropStatus } from './utils/voltageDropCalculator'

// ── SystemVoltageToggle ────────────────────────────────────────────────────────
function SystemVoltageToggle({
  value,
  onChange,
}: {
  value: 12 | 24
  onChange: (v: 12 | 24) => void
}) {
  return (
    <div className="input-group">
      <span className="input-label">System Voltage</span>
      <div className="volt-toggle">
        <button
          className={`volt-btn${value === 12 ? ' active' : ''}`}
          onClick={() => onChange(12)}
          type="button"
        >
          12V
        </button>
        <button
          className={`volt-btn${value === 24 ? ' active' : ''}`}
          onClick={() => onChange(24)}
          type="button"
        >
          24V
        </button>
      </div>
    </div>
  )
}

// ── WireGaugeSelect ───────────────────────────────────────────────────────────
function WireGaugeSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="input-group">
      <label className="input-label" htmlFor="wire-gauge">
        Wire Gauge
      </label>
      <select
        id="wire-gauge"
        className="gauge-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {WIRE_DATA.map((wire) => (
          <option key={wire.awg} value={wire.awg}>
            {wire.label} — {wire.maxAmps}A max
          </option>
        ))}
      </select>
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
  inputRef,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  unit: string
  helpText?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const filtered = raw.replace(/[^0-9.]/g, '')
    if (filtered.split('.').length > 2) return
    onChange(filtered)
  }

  return (
    <div className="input-group">
      <label className="input-label" htmlFor={id}>
        {label}
      </label>
      <div className="input-wrap">
        <input
          id={id}
          ref={inputRef as React.RefObject<HTMLInputElement>}
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
function ResultsCard({ result }: { result: VoltageDropResult | null }) {
  const empty = !result

  return (
    <div className="results-card">
      <div className="results-title">Results</div>
      <div className="results-divider" />

      <div className="result-row">
        <span className="result-label">Voltage Drop</span>
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
  const [systemVoltage, setSystemVoltage] = useState<12 | 24>(12)
  const [wireGauge, setWireGauge] = useState(DEFAULT_WIRE_GAUGE)
  const [wireLength, setWireLength] = useState('')
  const [current, setCurrent] = useState('')

  const currentRef = useRef<HTMLInputElement>(null)

  const result = useMemo(() => {
    const len = parseFloat(wireLength)
    const amps = parseFloat(current)
    if (isNaN(len) || isNaN(amps) || len <= 0 || amps <= 0) return null
    return calculateVoltageDrop({
      systemVoltage,
      wireGaugeAwg: wireGauge,
      wireLengthFeet: len,
      currentAmps: amps,
    })
  }, [systemVoltage, wireGauge, wireLength, current])

  return (
    <div className="app">
      <header className="header">
        <div className="header-title">⚡ VoltCalc</div>
        <div className="header-subtitle">Van Build Voltage Drop Calculator</div>
      </header>

      <SystemVoltageToggle value={systemVoltage} onChange={setSystemVoltage} />
      <WireGaugeSelect value={wireGauge} onChange={setWireGauge} />
      <NumericInput
        id="wire-length"
        label="One-Way Wire Length"
        value={wireLength}
        onChange={setWireLength}
        placeholder="e.g. 15"
        unit="ft"
        helpText="Distance from battery/fuse box to device. Return path is calculated automatically."
      />
      <NumericInput
        id="current"
        label="Current Draw"
        value={current}
        onChange={setCurrent}
        placeholder="e.g. 10"
        unit="A"
        inputRef={currentRef}
      />

      <ResultsCard result={result} />

      <p className="footer">
        For reference only. Always consult a qualified electrician and follow
        manufacturer specifications.
      </p>
    </div>
  )
}
