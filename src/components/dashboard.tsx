"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  ScanLine,
  ShieldCheck,
  Clock3,
  Printer,
  ChevronRight,
  CircleCheck,
  Target,
  Layers3,
  Smartphone,
} from "lucide-react";
import Viewer from "./viewer";
import CaptureModal from "./capture-modal";
import { presets, getPreset, formatTime } from "@/lib/data";
import { useInspection } from "./provider";
export default function Dashboard() {
  const [presetId, setPresetId] = useState("impeller");
  const [capture, setCapture] = useState(false);
  const preset = getPreset(presetId);
  const { inspection } = useInspection();
  const closeCapture = useCallback(() => setCapture(false), []);
  return (
    <div className="page overview-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-line" /> QUALITY, WITH CLARITY
          </div>
          <h1>
            Precision starts here<span className="mint">.</span>
          </h1>
          <p>From a phone capture to a confident next step.</p>
        </div>
        <span className="date-chip">
          <Clock3 size={14} /> Shop floor · Demo workspace
        </span>
      </div>
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-icon">
            <ScanLine size={19} />
          </span>
          <span className="metric-label">Sample inspections</span>
          <strong>
            01<span className="metric-context">Ready to review</span>
          </strong>
          <span className="metric-foot">Your first digital quality gate</span>
        </div>
        <div className="metric-card">
          <span className="metric-icon">
            <Target size={19} />
          </span>
          <span className="metric-label">Spatial coverage</span>
          <strong>
            94.2<span className="unit">%</span>
          </strong>
          <span className="metric-foot">
            <span className="mint">Above threshold</span> · target ≥ 90%
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-icon amber">
            <ShieldCheck size={19} />
          </span>
          <span className="metric-label">Anomalies flagged</span>
          <strong>
            02<span className="metric-context amber">Review required</span>
          </strong>
          <span className="metric-foot">1 dimensional · 1 surface</span>
        </div>
        <div className="metric-card">
          <span className="metric-icon">
            <Clock3 size={19} />
          </span>
          <span className="metric-label">Capture duration</span>
          <strong>
            20<span className="unit">sec</span>
          </strong>
          <span className="metric-foot">A single guided orbit</span>
        </div>
      </div>
      <div className="setup-grid">
        <section className="panel setup-panel">
          <div className="panel-heading">
            <div className="section-index">01</div>
            <div>
              <h2>Set up your inspection</h2>
              <p>Start with the part you want to understand.</p>
            </div>
            <Box size={20} />
          </div>
          <div className="setup-content">
            <label className="field-label" htmlFor="component">
              COMPONENT PRESET
            </label>
            <select
              id="component"
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} —{" "}
                  {p.id === "impeller" ? "Stainless Steel" : "Aluminium"}
                </option>
              ))}
            </select>
            <div className="material-row">
              <span className="material-dot" />
              {preset.material}
              <span className="mono">{preset.code}</span>
            </div>
            <div className="cad-file">
              <span className="file-icon">
                <Layers3 size={23} />
              </span>
              <div>
                <strong>
                  {preset.id === "impeller"
                    ? "impeller_v2_nominal.stl"
                    : "compressor_rotor_v1.stl"}
                </strong>
                <small>Nominal CAD reference · procedural demo model</small>
              </div>
              <CircleCheck size={18} className="mint" />
            </div>
            <div className="dimensions">
              <div>
                <span>Outer diameter</span>
                <strong>
                  Ø {preset.diameter}
                  <small>mm</small>
                </strong>
              </div>
              <div>
                <span>Overall height</span>
                <strong>
                  {preset.height}
                  <small>mm</small>
                </strong>
              </div>
              <div>
                <span>Bore diameter</span>
                <strong>
                  Ø {preset.bore}
                  <small>mm</small>
                </strong>
              </div>
              <div>
                <span>Design tolerance</span>
                <strong className="mint">
                  {preset.tolerance}
                  <small>mm</small>
                </strong>
              </div>
            </div>
            <Link href="/calibration/" className="calibration-link">
              <span className="calibration-mini">▦</span>
              <div>
                <strong>Prepare your calibration board</strong>
                <small>ChArUco · A4 printable · 20 mm squares</small>
              </div>
              <Printer size={18} />
            </Link>
            <button
              className="button primary full start-button"
              onClick={() => setCapture(true)}
            >
              <ScanLine size={18} /> Start new inspection{" "}
              <ArrowRight size={18} />
            </button>
            <p className="setup-note">
              <ShieldCheck size={13} /> Your capture stays on your device.
            </p>
          </div>
        </section>
        <section className="panel cad-preview">
          <div className="preview-label">
            <span className="live-indicator" /> NOMINAL DIGITAL TWIN
            <span className="chip">STL</span>
          </div>
          <div className="preview-canvas">
            <Viewer blades={preset.blades} compact autoRotate={!capture} />
          </div>
          <div className="preview-cross cross-tl" />
          <div className="preview-cross cross-br" />
          <div className="preview-description">
            <div>
              <span className="eyebrow">REFERENCE GEOMETRY</span>
              <h3>{preset.name}</h3>
              <p>{preset.blades} curved blades · precision-machined geometry</p>
            </div>
            <span className="round-icon">
              <Box size={20} />
            </span>
          </div>
          <div className="preview-footer">
            <span>Drag to rotate · scroll to zoom</span>
            <span>
              <span className="online-dot" /> Model ready
            </span>
          </div>
        </section>
      </div>
      <div className="section-heading">
        <div>
          <h2>Continue where you left off</h2>
          <p>A complete evidence trail, one inspection at a time.</p>
        </div>
        <Link href="/inspection/">
          Open studio <ArrowUpRight size={16} />
        </Link>
      </div>
      <Link href="/inspection/" className="recent-inspection">
        <div className="recent-icon">
          <Box size={25} />
        </div>
        <div className="recent-title">
          <strong>{getPreset(inspection.presetId).name}</strong>
          <small>
            {inspection.id} <span>·</span> {formatTime(inspection.timestamp)}
          </small>
        </div>
        <span className="status-chip warning">
          <span /> Needs escalation
        </span>
        <div className="recent-stat">
          <strong>94.2%</strong>
          <small>Coverage</small>
        </div>
        <div className="recent-stat">
          <strong>2 anomalies</strong>
          <small>Detected</small>
        </div>
        <ChevronRight size={18} />
      </Link>
      <div className="workflow-strip">
        <div>
          <Smartphone size={18} />
          <span>Capture with your phone</span>
        </div>
        <ArrowRight size={15} />
        <div>
          <Layers3 size={18} />
          <span>Understand the deviation</span>
        </div>
        <ArrowRight size={15} />
        <div>
          <ShieldCheck size={18} />
          <span>Make a confident decision</span>
        </div>
        <span className="workflow-label">THE PARTPROOF WAY</span>
      </div>
      {capture && <CaptureModal preset={preset} onClose={closeCapture} />}
    </div>
  );
}
