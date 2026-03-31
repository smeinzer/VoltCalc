export interface WireGaugeInfo {
  label: string;
  awg: string;
  resistancePer1000ft: number;
  maxAmps: number;
}

// Copper wire resistance at 75°C, NEC Chapter 9 Table 8
// Ordered from smallest (thinnest) to largest (thickest)
export const WIRE_DATA: WireGaugeInfo[] = [
  { label: '18 AWG', awg: '18', resistancePer1000ft: 7.77, maxAmps: 7 },
  { label: '16 AWG', awg: '16', resistancePer1000ft: 4.89, maxAmps: 10 },
  { label: '14 AWG', awg: '14', resistancePer1000ft: 3.07, maxAmps: 15 },
  { label: '12 AWG', awg: '12', resistancePer1000ft: 1.93, maxAmps: 20 },
  { label: '10 AWG', awg: '10', resistancePer1000ft: 1.21, maxAmps: 30 },
  { label: '8 AWG', awg: '8', resistancePer1000ft: 0.764, maxAmps: 40 },
  { label: '6 AWG', awg: '6', resistancePer1000ft: 0.491, maxAmps: 55 },
  { label: '4 AWG', awg: '4', resistancePer1000ft: 0.308, maxAmps: 70 },
  { label: '2 AWG', awg: '2', resistancePer1000ft: 0.194, maxAmps: 95 },
  { label: '1 AWG', awg: '1', resistancePer1000ft: 0.154, maxAmps: 110 },
  { label: '1/0 AWG', awg: '1/0', resistancePer1000ft: 0.122, maxAmps: 125 },
  { label: '2/0 AWG', awg: '2/0', resistancePer1000ft: 0.0967, maxAmps: 145 },
  { label: '3/0 AWG', awg: '3/0', resistancePer1000ft: 0.0766, maxAmps: 165 },
  { label: '4/0 AWG', awg: '4/0', resistancePer1000ft: 0.0608, maxAmps: 195 },
];

export const DEFAULT_WIRE_GAUGE = '10';
