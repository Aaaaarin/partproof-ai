"use client";
import {
  Printer,
  Download,
  Ruler,
  Check,
  ArrowLeft,
  Grid2X2,
} from "lucide-react";
import Link from "next/link";
import { asset } from "@/lib/data";
export default function Calibration() {
  return (
    <div className="page calibration-page">
      <div className="page-heading no-print">
        <div>
          <div className="eyebrow">
            <span className="tiny-line" /> A GOOD SCAN STARTS HERE
          </div>
          <h1>
            Give precision a reference<span className="mint">.</span>
          </h1>
          <p>A real ChArUco pattern, ready for your workbench.</p>
        </div>
        <button className="button primary" onClick={() => window.print()}>
          <Printer size={16} /> Print calibration board
        </button>
      </div>
      <div className="calibration-grid">
        <aside className="panel calibration-instructions no-print">
          <span className="calibration-large-icon">
            <Grid2X2 size={28} />
          </span>
          <h2>Your reference plane.</h2>
          <p>
            The board gives a computer vision pipeline known dimensions and
            identifiable corners.
          </p>
          <div className="board-specs">
            <div>
              <span>Board layout</span>
              <strong>7 × 5 squares</strong>
            </div>
            <div>
              <span>Square length</span>
              <strong>20 mm</strong>
            </div>
            <div>
              <span>Marker length</span>
              <strong>14 mm</strong>
            </div>
            <div>
              <span>Dictionary</span>
              <strong>DICT_4X4_50</strong>
            </div>
            <div>
              <span>Printed grid size</span>
              <strong>140 × 100 mm</strong>
            </div>
          </div>
          <div className="print-instruction">
            <Ruler size={20} />
            <div>
              <strong>Print at 100% actual size.</strong>
              <p>
                Disable “Fit to page”. Verify the 100 mm scale with a ruler
                after printing.
              </p>
            </div>
          </div>
          <ul className="board-tips">
            <li>
              <Check size={15} /> Mount flat on a rigid, matte surface.
            </li>
            <li>
              <Check size={15} /> Keep the board visible around the part.
            </li>
            <li>
              <Check size={15} /> Use soft, even lighting.
            </li>
          </ul>
          <a
            href={asset("/charuco-board.png")}
            download
            className="button secondary full"
          >
            <Download size={16} /> Download board PNG
          </a>
          <Link href="/" className="back-link">
            <ArrowLeft size={14} /> Back to project setup
          </Link>
        </aside>
        <section className="calibration-sheet">
          <div className="board-header">
            <strong>
              partproof<span>AI</span>
            </strong>
            <span>CALIBRATION REFERENCE · PP-CB-01</span>
          </div>
          <h2>ChArUco calibration board</h2>
          <p>7 × 5 · 20 mm squares · 14 mm markers · DICT_4X4_50</p>
          <img
            className="charuco-image"
            src={asset("/charuco-board.png")}
            alt="OpenCV ChArUco calibration board with 7 by 5 squares and DICT_4X4_50 ArUco markers"
          />
          <div className="ruler-scale">
            <span />
            <b>100 mm — verify after printing</b>
          </div>
          <div className="board-warning">
            <strong>PRINT AT ACTUAL SIZE / 100%</strong>
            <p>
              Do not scale. The grid must measure 140 × 100 mm.
              <br />
              Generated with OpenCV. Prototype reference, not a certified
              calibration artefact.
            </p>
          </div>
          <footer>
            PARTPROOF AI{" "}
            <span>ZEISS BEYOND CODE 2026 · INDEPENDENT PROTOTYPE</span>
          </footer>
        </section>
      </div>
    </div>
  );
}
