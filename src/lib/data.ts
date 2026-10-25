export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (path: string) => `${basePath}${path}`;
export const presets = [
  {
    id: "impeller",
    name: "Turbine Impeller v2",
    material: "Stainless steel · SS 316L",
    code: "IMP-SS316-042",
    diameter: "120.00",
    height: "38.50",
    bore: "20.00",
    tolerance: "±0.05",
    blades: 11,
  },
  {
    id: "rotor",
    name: "Compressor Rotor v1",
    material: "Aluminium · Al 6061-T6",
    code: "RTR-AL6061-018",
    diameter: "96.00",
    height: "30.00",
    bore: "16.00",
    tolerance: "±0.05",
    blades: 8,
  },
] as const;
export type Preset = (typeof presets)[number];
export type Inspection = {
  presetId: string;
  id: string;
  timestamp: string;
  source: string;
  fileCount: number;
  mode: "sample" | "upload";
};
export const defaultInspection: Inspection = {
  presetId: "impeller",
  id: "PP-2026-0042",
  timestamp: "2026-10-25T09:42:00.000Z",
  source: "Demo capture · 64 calibrated frames",
  fileCount: 64,
  mode: "sample",
};
export const qualityChecks = [
  {
    label: "ChArUco board detected",
    detail: "Grid calibration OK · DICT_4X4_50",
    value: "Calibrated",
  },
  {
    label: "Motion blur index",
    detail: "0.04 · threshold < 0.10",
    value: "Passed",
  },
  {
    label: "Specular glare / reflection",
    detail: "Minimal · surface features visible",
    value: "Passed",
  },
  {
    label: "Orbit angular coverage",
    detail: "310° / 360° · threshold > 300°",
    value: "Passed",
  },
];
export function getPreset(id: string) {
  return presets.find((p) => p.id === id) || presets[0];
}
export function formatTime(value: string) {
  return (
    new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    }) + " IST"
  );
}
