import { WIRE_DATA } from '../constants/wireData';

export type VoltageDropStatus = 'good' | 'warning' | 'fail';

export interface VoltageDropResult {
  voltageDrop: number;
  voltageDropPercent: number;
  voltageAtLoad: number;
  status: VoltageDropStatus;
  recommendation: string | null;
}

export function calculateVoltageDrop(params: {
  systemVoltage: number;
  wireGaugeAwg: string;
  wireLengthFeet: number;
  currentAmps: number;
}): VoltageDropResult {
  const { systemVoltage, wireGaugeAwg, wireLengthFeet, currentAmps } = params;

  const wireIndex = WIRE_DATA.findIndex((w) => w.awg === wireGaugeAwg);
  const wire = WIRE_DATA[wireIndex];

  if (!wire) {
    return {
      voltageDrop: 0,
      voltageDropPercent: 0,
      voltageAtLoad: systemVoltage,
      status: 'good',
      recommendation: null,
    };
  }

  // VD = (2 × L × I × R_per_1000ft) / 1000
  const voltageDrop =
    (2 * wireLengthFeet * currentAmps * wire.resistancePer1000ft) / 1000;

  const voltageDropPercent = (voltageDrop / systemVoltage) * 100;
  const voltageAtLoad = systemVoltage - voltageDrop;

  let status: VoltageDropStatus;
  if (voltageDropPercent < 3) {
    status = 'good';
  } else if (voltageDropPercent < 5) {
    status = 'warning';
  } else {
    status = 'fail';
  }

  let recommendation: string | null = null;
  if (status !== 'good') {
    // Find smallest larger gauge that brings drop under 3%
    for (let i = wireIndex + 1; i < WIRE_DATA.length; i++) {
      const candidate = WIRE_DATA[i];
      const candidateDrop =
        (2 * wireLengthFeet * currentAmps * candidate.resistancePer1000ft) /
        1000;
      const candidatePercent = (candidateDrop / systemVoltage) * 100;
      if (candidatePercent < 3) {
        recommendation = `Consider using ${candidate.label} to keep voltage drop under 3%`;
        break;
      }
    }
    if (!recommendation) {
      recommendation = 'Consider shorter wire runs or reducing current draw';
    }
  }

  return {
    voltageDrop: Math.round(voltageDrop * 1000) / 1000,
    voltageDropPercent: Math.round(voltageDropPercent * 100) / 100,
    voltageAtLoad: Math.round(voltageAtLoad * 1000) / 1000,
    status,
    recommendation,
  };
}
