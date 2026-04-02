import { WIRE_DATA } from '../constants/wireData';

export type VoltageDropStatus = 'good' | 'warning' | 'fail';

export interface WireSegment {
  wireGaugeAwg: string;
  lengthFeet: number;
}

export interface SegmentDetail {
  label: string;
  lengthFeet: number;
  voltageDrop: number;
  voltageDropPercent: number;
}

export interface VoltageDropResult {
  voltageDrop: number;
  voltageDropPercent: number;
  voltageAtLoad: number;
  status: VoltageDropStatus;
  recommendation: string | null;
  segments: SegmentDetail[];
}

export function calculateVoltageDrop(params: {
  systemVoltage: number;
  wireGaugeAwg: string;
  wireLengthFeet: number;
  currentAmps: number;
}): VoltageDropResult {
  return calculateMultiSegmentVoltageDrop({
    systemVoltage: params.systemVoltage,
    segments: [{ wireGaugeAwg: params.wireGaugeAwg, lengthFeet: params.wireLengthFeet }],
    currentAmps: params.currentAmps,
  });
}

export function calculateMultiSegmentVoltageDrop(params: {
  systemVoltage: number;
  segments: WireSegment[];
  currentAmps: number;
}): VoltageDropResult {
  const { systemVoltage, segments, currentAmps } = params;

  const segmentDetails: SegmentDetail[] = [];
  let totalDrop = 0;

  for (const seg of segments) {
    const wire = WIRE_DATA.find((w) => w.awg === seg.wireGaugeAwg);
    if (!wire) continue;

    const drop = (2 * seg.lengthFeet * currentAmps * wire.resistancePer1000ft) / 1000;
    const dropPercent = (drop / systemVoltage) * 100;

    segmentDetails.push({
      label: wire.label,
      lengthFeet: seg.lengthFeet,
      voltageDrop: Math.round(drop * 1000) / 1000,
      voltageDropPercent: Math.round(dropPercent * 100) / 100,
    });

    totalDrop += drop;
  }

  const voltageDropPercent = (totalDrop / systemVoltage) * 100;
  const voltageAtLoad = systemVoltage - totalDrop;

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
    // Find which segment contributes the most drop
    let worstIdx = 0;
    for (let i = 1; i < segmentDetails.length; i++) {
      if (segmentDetails[i].voltageDrop > segmentDetails[worstIdx].voltageDrop) {
        worstIdx = i;
      }
    }
    const worstSeg = segments[worstIdx];
    const worstWireIdx = WIRE_DATA.findIndex((w) => w.awg === worstSeg.wireGaugeAwg);

    // Try upgrading the worst segment to find a fix
    for (let i = worstWireIdx + 1; i < WIRE_DATA.length; i++) {
      const candidate = WIRE_DATA[i];
      const otherDrop = totalDrop - segmentDetails[worstIdx].voltageDrop;
      const newDrop = (2 * worstSeg.lengthFeet * currentAmps * candidate.resistancePer1000ft) / 1000;
      const newTotalPercent = ((otherDrop + newDrop) / systemVoltage) * 100;
      if (newTotalPercent < 3) {
        const segLabel = segmentDetails.length > 1 ? ` on segment ${worstIdx + 1}` : '';
        recommendation = `Consider using ${candidate.label}${segLabel} to keep total drop under 3%`;
        break;
      }
    }
    if (!recommendation) {
      recommendation = 'Consider shorter wire runs or reducing current draw';
    }
  }

  return {
    voltageDrop: Math.round(totalDrop * 1000) / 1000,
    voltageDropPercent: Math.round(voltageDropPercent * 100) / 100,
    voltageAtLoad: Math.round(voltageAtLoad * 1000) / 1000,
    status,
    recommendation,
    segments: segmentDetails,
  };
}
