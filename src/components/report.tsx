"use client";
import { useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  TriangleAlert,
  Check,
  Download,
  FileText,
} from "lucide-react";
import { useInspection } from "./provider";
import { formatTime, getPreset, qualityChecks } from "@/lib/data";
import { Brand } from "./shell";
import Viewer from "./viewer";
export default function Report() {
  const { inspection, snapshot, setSnapshot } = useInspection();
  const preset = getPreset(inspection.presetId);
  const saveSnapshot = useCallback((image: string) => {
    setSnapshot(image);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="page report-page">
      <div className="page-heading no-print">
        <div>
          <div className="eyebrow">
            <span className="tiny-line" /> EVIDENCE, NOT GUESSWORK
          </div>
          <h1>
            The full picture<span className="mint">.</span>
          </h1>
          <p>Your traceable pre-inspection record, ready to share.</p>
        </div>
        <div className="heading-actions">
          <Link className="button secondary" href="/inspection/">
            <ArrowLeft size={16} /> Back to studio
          </Link>
          <button className="button primary" onClick={() => window.print()}>
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>
      <div className="report-print-tip no-print">
        <FileText size={16} />
        <span>
          Choose <strong>Save as PDF</strong> in the print dialog. The report is
          formatted for A4 paper.
        </span>
        <span className="chip">PRINT READY</span>
      </div>
      <article className="report-paper">
        <header className="report-header">
          <Brand />
          <div>
            <span>PRE-INSPECTION REPORT</span>
            <strong>{inspection.id}</strong>
            <small>Generated {formatTime(inspection.timestamp)}</small>
          </div>
        </header>
        <div className="report-rule" />
        <div className="report-intro">
          <div>
            <span className="report-eyebrow">COMPONENT QUALITY ASSESSMENT</span>
            <h2>{preset.name}</h2>
            <p>
              {preset.material} · {preset.code}
            </p>
          </div>
          <span className="report-demo">
            SIMULATED
            <br />
            PROTOTYPE DATA
          </span>
        </div>
        <div className="report-verdict">
          <TriangleAlert size={25} />
          <div>
            <small>OVERALL VERDICT · PART RELEASE ON HOLD</small>
            <strong>ESCALATE TO ZEISS CMM</strong>
            <p>
              Critical dimensional deviation detected. Certified metrology
              review required.
            </p>
          </div>
          <span>FLAGGED</span>
        </div>
        <div className="report-metadata">
          <div>
            <span>Inspection ID</span>
            <strong>{inspection.id}</strong>
          </div>
          <div>
            <span>Captured / generated</span>
            <strong>{formatTime(inspection.timestamp)}</strong>
          </div>
          <div>
            <span>Source</span>
            <strong>{inspection.source}</strong>
          </div>
          <div>
            <span>Operator / environment</span>
            <strong>Arin · Prototype workspace</strong>
          </div>
          <div>
            <span>Nominal dimensions</span>
            <strong>
              Ø {preset.diameter} × {preset.height} mm
            </strong>
          </div>
          <div>
            <span>Design tolerance</span>
            <strong>{preset.tolerance} mm</strong>
          </div>
        </div>
        <div className="report-section-title">
          <span>01</span>
          <h3>Geometry & deviation evidence</h3>
          <small>Illustrative mesh comparison</small>
        </div>
        <div className="report-visual-grid">
          <div className="report-model">
            {snapshot ? (
              <img
                src={snapshot}
                alt="Simulated 3D deviation heatmap: green nominal surfaces and a red flange defect region"
              />
            ) : (
              <Viewer
                heatmap
                blades={preset.blades}
                compact
                onSnapshot={saveSnapshot}
              />
            )}
            <span>CAD-ALIGNED DEVIATION MAP · mm</span>
          </div>
          <div className="report-measures">
            <div>
              <span>Spatial coverage</span>
              <strong>
                94.2<small>%</small>
              </strong>
              <p>Target ≥ 90% · Passed</p>
            </div>
            <div>
              <span>Calibration error</span>
              <strong>
                ±0.035 <small>mm</small>
              </strong>
              <p>Simulated uncertainty</p>
            </div>
            <div>
              <span>Maximum deviation</span>
              <strong className="red">
                +0.38 <small>mm</small>
              </strong>
              <p>7.6× design tolerance</p>
            </div>
          </div>
        </div>
        <div className="report-legend">
          <span>−0.05 mm</span>
          <div className="color-ramp" />
          <span>+0.38 mm</span>
          <small>Green = nominal · Red = out of tolerance</small>
        </div>
        <div className="report-section-title">
          <span>02</span>
          <h3>Detected anomalies</h3>
        </div>
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Finding</th>
                <th>Measured / confidence</th>
                <th>Acceptance limit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>01 · Flange radius deviation</strong>
                  <small>Outer flange critical zone</small>
                </td>
                <td>+0.38 mm</td>
                <td>±0.05 mm</td>
                <td>
                  <span className="report-fail">FAIL</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>02 · Surface micro-scratch</strong>
                  <small>Near Datum B</small>
                </td>
                <td>91% confidence</td>
                <td>Visual review</td>
                <td>
                  <span className="report-review">REVIEW</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="report-section-title">
          <span>03</span>
          <h3>Capture verification checklist</h3>
        </div>
        <div className="report-checklist">
          {qualityChecks.map((c) => (
            <div key={c.label}>
              <Check size={15} />
              <span>
                <strong>{c.label}</strong>
                <small>{c.detail}</small>
              </span>
              <b>PASS</b>
            </div>
          ))}
        </div>
        <div className="report-recommendation">
          <ShieldCheck size={21} />
          <div>
            <strong>Recommended next step</strong>
            <p>
              Hold this component for formal dimensional inspection. Verify the
              outer flange radius using a certified CMM and visually review the
              surface at Datum B before release.
            </p>
          </div>
        </div>
        <div className="report-disclaimer">
          All measurements, model outputs and confidence values in this
          hackathon prototype are simulated. This report is a pre-inspection
          demonstration and is not a calibration certificate, validated
          measurement or product release authorization.
        </div>
        <footer className="report-footer">
          <span>PartProof AI · Traceable quality intelligence</span>
          <div>
            <span className="zeiss-wordmark">ZEISS</span>
            <span>
              BEYOND CODE 2026
              <small>Independent submission · no endorsement implied</small>
            </span>
          </div>
        </footer>
      </article>
      <div className="report-bottom no-print">
        <ShieldCheck size={15} /> Record retained in this browser. Clear browser
        storage to remove it.
        <button onClick={() => window.print()}>
          <Download size={15} /> Export report
        </button>
      </div>
    </div>
  );
}
