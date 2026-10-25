"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  ScanLine,
  ArrowRight,
  Download,
  RotateCcw,
  Rotate3D,
  Maximize,
  Layers3,
  Eye,
  TriangleAlert,
  ShieldCheck,
  Check,
  Box,
  Crosshair,
  ArrowUpRight,
  FileJson,
  PackageCheck,
} from "lucide-react";
import Viewer from "./viewer";
import CaptureModal from "./capture-modal";
import Modal from "./modal";
import { useInspection } from "./provider";
import { formatTime, getPreset } from "@/lib/data";
export default function Studio() {
  const { inspection, setSnapshot } = useInspection();
  const preset = getPreset(inspection.presetId);
  const [heatmap, setHeatmap] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [annotations, setAnnotations] = useState(true);
  const [rotate, setRotate] = useState(false);
  const [reset, setReset] = useState(0);
  const [capture, setCapture] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [activeAnomaly, setActiveAnomaly] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const closeCapture = useCallback(() => setCapture(false), []);
  const closeHandoff = useCallback(() => setHandoff(false), []);
  // Stable callback avoids repeating the snapshot effect when provider state changes.
  const snapshotCallback = useCallback(
    (value: string) => setSnapshot(value),
    [],
  ); // eslint-disable-line react-hooks/exhaustive-deps
  function downloadPackage() {
    const payload = {
      schema: "partproof.preinspection.v1",
      prototype: true,
      simulated: true,
      integration:
        "Manual review package; not a ZEISS INSPECT proprietary file",
      inspection,
      component: preset,
      metrics: { coveragePercent: 94.2, calibrationErrorMm: 0.035 },
      verdict: "ESCALATE TO ZEISS CMM",
      anomalies: [
        {
          type: "Flange radius deviation",
          deviationMm: 0.38,
          toleranceMm: 0.05,
        },
        { type: "Surface micro-scratch", datum: "B", confidence: 0.91 },
      ],
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = inspection.id + "-review-package.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  }
  return (
    <div className="page studio-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-line" /> INSPECTION STUDIO{" "}
            <span className="eyebrow-divider">/</span>{" "}
            <span className="mono">{inspection.id}</span>
          </div>
          <h1>
            See beyond the surface<span className="mint">.</span>
          </h1>
          <p>
            {preset.name} <span className="inline-dot">·</span>{" "}
            {preset.material}
          </p>
        </div>
        <button className="button secondary" onClick={() => setCapture(true)}>
          <ScanLine size={16} /> New capture
        </button>
      </div>
      <div className="inspection-pipeline">
        <span>
          <Check size={13} /> Capture verified
        </span>
        <i />
        <span>
          <Check size={13} /> Point cloud aligned
        </span>
        <i />
        <span>
          <Check size={13} /> CAD matched
        </span>
        <i />
        <span className="pipeline-current">
          <span className="online-dot" /> Analysis complete
        </span>
        <small>SIMULATED WORKFLOW</small>
      </div>
      <div className="studio-grid">
        <section
          className={
            "viewport-panel panel " + (expanded ? "expanded-view" : "")
          }
        >
          <div className="viewport-top">
            <div className="view-tabs">
              <button
                className={!heatmap ? "selected" : ""}
                onClick={() => setHeatmap(false)}
              >
                <Box size={14} /> Nominal CAD
              </button>
              <button
                className={heatmap ? "selected" : ""}
                onClick={() => setHeatmap(true)}
              >
                <Layers3 size={14} /> Deviation heatmap
              </button>
            </div>
            <button
              className="icon-button"
              title={expanded ? "Exit expanded view" : "Expand viewport"}
              aria-label={expanded ? "Exit expanded view" : "Expand viewport"}
              onClick={() => setExpanded(!expanded)}
            >
              <Maximize size={16} />
            </button>
          </div>
          <div className="inspection-canvas">
            <Viewer
              heatmap={heatmap}
              wireframe={wireframe}
              annotations={annotations && activeAnomaly === 1}
              blades={preset.blades}
              autoRotate={rotate}
              resetKey={reset}
              onSnapshot={snapshotCallback}
            />
            <div className="viewport-info">
              <span>
                <span className="live-indicator" />
                {heatmap ? "SURFACE DEVIATION" : "NOMINAL GEOMETRY"}
              </span>
              <small>{preset.code} · mm</small>
            </div>
            <div className="viewport-tools">
              <button
                className={"icon-button " + (rotate ? "toggled" : "")}
                aria-label="Toggle auto rotation"
                aria-pressed={rotate}
                title="Auto rotate"
                onClick={() => setRotate(!rotate)}
              >
                <Rotate3D size={17} />
              </button>
              <button
                className={"icon-button " + (wireframe ? "toggled" : "")}
                aria-label="Toggle wireframe"
                aria-pressed={wireframe}
                title="Wireframe"
                onClick={() => setWireframe(!wireframe)}
              >
                <Layers3 size={17} />
              </button>
              <button
                className={"icon-button " + (annotations ? "toggled" : "")}
                aria-label="Toggle annotations"
                aria-pressed={annotations}
                title="Annotations"
                onClick={() => setAnnotations(!annotations)}
              >
                <Eye size={17} />
              </button>
              <span />
              <button
                className="icon-button"
                aria-label="Reset view"
                title="Reset view"
                onClick={() => setReset(reset + 1)}
              >
                <RotateCcw size={17} />
              </button>
            </div>
            {heatmap && (
              <div className="heatmap-legend">
                <span>
                  DEVIATION <small>mm</small>
                </span>
                <div className="color-ramp" />
                <div className="legend-labels">
                  <span>−0.05</span>
                  <span>0.00</span>
                  <span>+0.05</span>
                  <span>+0.38</span>
                </div>
              </div>
            )}
            <div className="axis-compass">
              <span className="axis-y">Y</span>
              <span className="axis-x">X</span>
              <span className="axis-z">Z</span>
              <i />
              <b />
            </div>
            <span className="viewport-instruction">
              DRAG TO ORBIT <span>·</span> SCROLL TO ZOOM
            </span>
          </div>
          <div className="viewport-bottom">
            <span>
              <span className="online-dot" />{" "}
              {heatmap ? "Deviation layer active" : "Reference geometry active"}
            </span>
            <span>
              Simulated mesh <span className="inline-dot">·</span> Units: mm
            </span>
          </div>
        </section>
        <aside className="analysis-panel panel">
          <div className="analysis-title">
            <h2>Inspection insights</h2>
            <span className="chip">AI ANALYSIS</span>
          </div>
          <div className="verdict-card">
            <div>
              <TriangleAlert size={19} />
              <span>INSPECTION VERDICT</span>
            </div>
            <h3>
              ESCALATE TO <br />
              ZEISS CMM
            </h3>
            <p>
              A critical deviation exceeds the design tolerance. Formal
              metrology is required.
            </p>
            <span className="verdict-tag">PART RELEASE ON HOLD</span>
          </div>
          <div className="analysis-metrics">
            <div>
              <span>
                Spatial coverage <Crosshair size={13} />
              </span>
              <strong>
                94.2<small>%</small>
                <b className="mint">Good</b>
              </strong>
              <div className="mini-progress">
                <i />
              </div>
            </div>
            <div>
              <span>
                Calibration error <ShieldCheck size={13} />
              </span>
              <strong>
                ±0.035<small>mm</small>
              </strong>
              <p>Simulated measurement uncertainty</p>
            </div>
          </div>
          <div className="anomaly-heading">
            <h3>Detected anomalies</h3>
            <span>02</span>
          </div>
          <button
            className={
              "anomaly-card " + (activeAnomaly === 1 ? "selected" : "")
            }
            onClick={() => {
              setActiveAnomaly(1);
              setHeatmap(true);
              setAnnotations(true);
              setReset(reset + 1);
            }}
          >
            <span className="anomaly-number">01</span>
            <div>
              <strong>Flange radius deviation</strong>
              <span className="anomaly-value">
                +0.38 mm <b>CRITICAL</b>
              </span>
              <small>Exceeds ±0.05 mm tolerance</small>
            </div>
            <ArrowUpRight size={15} />
          </button>
          <button
            className={
              "anomaly-card scratch " + (activeAnomaly === 2 ? "selected" : "")
            }
            onClick={() => {
              setActiveAnomaly(2);
              setHeatmap(true);
            }}
          >
            <span className="anomaly-number">02</span>
            <div>
              <strong>Surface micro-scratch</strong>
              <span className="scratch-value">
                Near Datum B <b>91% confidence</b>
              </span>
              <small>Surface review recommended</small>
            </div>
            <ArrowUpRight size={15} />
          </button>
          {activeAnomaly === 2 && (
            <div className="anomaly-detail">
              <strong>Datum B · surface region</strong>
              <p>
                A simulated linear texture anomaly is flagged for visual review.
                This confidence score is a demo value.
              </p>
            </div>
          )}
          <div className="analysis-actions">
            <Link className="button primary full" href="/report/">
              <Download size={16} /> Export PDF Pre-Inspection Report
            </Link>
            <button
              className="button secondary full"
              onClick={() => {
                setHandoff(true);
                setDownloaded(false);
              }}
            >
              Forward Package to ZEISS INSPECT <ArrowRight size={15} />
            </button>
          </div>
          <p className="analysis-note">
            <ShieldCheck size={13} /> Screening intelligence. Certified
            inspection makes the final call.
          </p>
        </aside>
      </div>
      <div className="studio-lower">
        <section className="panel distribution-panel">
          <div className="panel-heading">
            <div>
              <h3>Deviation distribution</h3>
              <p>Most of the surface is within the nominal band.</p>
            </div>
            <span className="status-chip success">92.6% within tolerance</span>
          </div>
          <div className="distribution-chart">
            <div className="chart-tolerance" />
            {[
              2, 3, 4, 6, 9, 15, 26, 44, 68, 89, 100, 94, 82, 66, 48, 29, 18,
              10, 7, 5, 3, 3, 4, 5, 7, 10, 14, 11, 7, 4,
            ].map((v, i) => (
              <span
                key={i}
                style={{
                  height: v + "%",
                  background:
                    i > 23 ? "#ef6b64" : i > 19 ? "#d4bc63" : "#66b99a",
                }}
              />
            ))}
          </div>
          <div className="chart-axis">
            <span>−0.05 mm</span>
            <span>Nominal · 0.00 mm</span>
            <span>+0.38 mm</span>
          </div>
        </section>
        <section className="panel trace-panel">
          <span className="eyebrow">BUILT FOR TRACEABILITY</span>
          <h3>A decision you can follow.</h3>
          <p>
            Every capture, calibration check and flagged region stays linked to
            one inspection record.
          </p>
          <div>
            <span className="mono">{inspection.id}</span>
            <span>{formatTime(inspection.timestamp)}</span>
          </div>
          <Link href="/report/">
            View complete report <ArrowUpRight size={15} />
          </Link>
        </section>
      </div>
      {capture && <CaptureModal preset={preset} onClose={closeCapture} />}
      {handoff && (
        <Modal title="Prepare the expert handoff." onClose={closeHandoff}>
          <div className="handoff-icon">
            <PackageCheck size={32} />
          </div>
          <p className="handoff-description">
            Your evidence package keeps the component, calibration metrics and
            flagged regions together for a metrology specialist.
          </p>
          <div className="package-items">
            {[
              "Component reference & inspection metadata",
              "Coverage, uncertainty & anomaly summary",
              "Traceable JSON review package",
            ].map((t) => (
              <div key={t}>
                <Check size={16} />
                {t}
              </div>
            ))}
          </div>
          <div className="integration-note">
            <strong>Demo handoff · no external transmission</strong>
            <p>
              The download is a portable review package. A production ZEISS
              INSPECT connector would require an agreed integration. Nothing is
              sent to ZEISS.
            </p>
          </div>
          <button className="button primary full" onClick={downloadPackage}>
            {downloaded ? <Check size={17} /> : <FileJson size={17} />}{" "}
            {downloaded ? "Download again" : "Download review package"}
          </button>
          {downloaded && (
            <p className="mint centered" role="status">
              Package downloaded. Ready for manual review.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
