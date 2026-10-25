"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Video,
  Check,
  ArrowRight,
  LoaderCircle,
  Smartphone,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Modal from "./modal";
import { qualityChecks, type Preset } from "@/lib/data";
import { useInspection } from "./provider";
const pipeline = [
  "COLMAP Point Cloud Alignment",
  "ICP CAD Matching",
  "Anomalib Surface Check",
];
export default function CaptureModal({
  preset,
  onClose,
}: {
  preset: Preset;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<
    "upload" | "quality" | "processing" | "done"
  >("upload");
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [sample, setSample] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { save } = useInspection();
  function choose(selected: File[]) {
    const valid =
      selected.length > 0 &&
      selected.every((f) => /\.(mp4|jpe?g)$/i.test(f.name)) &&
      (selected.every((f) => /\.jpe?g$/i.test(f.name)) ||
        (selected.length === 1 && /\.mp4$/i.test(selected[0].name)));
    if (!valid) {
      setFiles([]);
      setError("Choose one MP4 video or a sequence of JPEG images.");
      return;
    }
    if (selected.some((f) => f.size > 200 * 1024 * 1024)) {
      setFiles([]);
      setError("Each file must be smaller than 200 MB.");
      return;
    }
    setError("");
    setFiles(selected);
    setSample(false);
  }
  function start(demo: boolean) {
    setSample(demo);
    setStep(0);
    setStage("quality");
  }
  useEffect(() => {
    if (stage !== "quality" && stage !== "processing") return;
    const timer = setTimeout(
      () => {
        if (stage === "quality") {
          if (step < 3) setStep(step + 1);
          else {
            setStage("processing");
            setStep(0);
          }
        } else if (step < 2) setStep(step + 1);
        else setStage("done");
      },
      stage === "quality" ? 700 : 1500,
    );
    return () => clearTimeout(timer);
  }, [stage, step]);
  function finish() {
    save({
      presetId: preset.id,
      id:
        "PP-" +
        new Date().getFullYear() +
        "-" +
        Date.now().toString().slice(-6),
      timestamp: new Date().toISOString(),
      source: sample
        ? "Demo capture · 64 calibrated frames"
        : files.length === 1
          ? files[0].name
          : files.length + " JPEG images",
      fileCount: sample ? 64 : files.length,
      mode: sample ? "sample" : "upload",
    });
    router.push("/inspection/");
    onClose();
  }
  return (
    <Modal
      title={
        stage === "upload"
          ? "Capture a better picture."
          : stage === "done"
            ? "Your inspection is ready."
            : "Turning capture into confidence."
      }
      onClose={onClose}
    >
      <div className="capture-steps">
        <span className={stage === "upload" ? "current" : "complete"}>
          01 <b>Capture</b>
        </span>
        <i />
        <span
          className={
            stage === "quality"
              ? "current"
              : stage === "processing" || stage === "done"
                ? "complete"
                : ""
          }
        >
          02 <b>Verify</b>
        </span>
        <i />
        <span
          className={
            stage === "processing" || stage === "done" ? "current" : ""
          }
        >
          03 <b>Inspect</b>
        </span>
      </div>
      {stage === "upload" ? (
        <>
          <div className="capture-guide">
            <Smartphone size={26} />
            <div>
              <strong>One part. One orbit. A clearer decision.</strong>
              <p>
                Place your {preset.name.toLowerCase()} on the ChArUco board.
                Capture a steady 20-second orbit in diffuse light.
              </p>
            </div>
          </div>
          <div
            className={"upload-zone " + (dragging ? "dragging" : "")}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              choose(Array.from(e.dataTransfer.files));
            }}
          >
            <span className="upload-symbol">
              <UploadCloud size={28} />
            </span>
            <h3>
              {files.length
                ? files.length + " files selected"
                : "Drop your capture here"}
            </h3>
            <p>
              {files.length
                ? files
                    .map((f) => f.name)
                    .slice(0, 3)
                    .join(", ")
                : "MP4 video or JPEG image sequence · up to 200 MB per file"}
            </p>
            <button
              className="button secondary"
              onClick={() => input.current?.click()}
            >
              Browse files
            </button>
            <input
              ref={input}
              className="sr-only"
              type="file"
              accept="video/mp4,image/jpeg,.mp4,.jpg,.jpeg"
              multiple
              aria-label="Upload capture files"
              onChange={(e) => choose(Array.from(e.target.files || []))}
            />
          </div>
          {error && (
            <p className="error-message" role="alert">
              <AlertCircle size={15} />
              {error}
            </p>
          )}
          <div className="privacy-note">
            <ShieldCheck size={15} />
            <span>
              Files stay on your device. This prototype simulates analysis.
            </span>
          </div>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => start(true)}>
              <Video size={16} /> Use demo capture
            </button>
            <button
              className="button primary"
              disabled={!files.length}
              onClick={() => start(false)}
            >
              Verify capture <ArrowRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="capture-source">
            <span className="live-indicator" />
            {sample ? "impeller_orbit_demo.mp4" : files[0]?.name}
            <span>SIMULATION</span>
          </div>
          <h3 className="section-title">Capture Quality Verification</h3>
          <div className="quality-list" aria-live="polite">
            {qualityChecks.map((check, i) => {
              const done = stage !== "quality" || i < step;
              const active = stage === "quality" && i === step;
              return (
                <div
                  className={
                    "quality-row " + (done ? "done" : active ? "checking" : "")
                  }
                  key={check.label}
                >
                  <span className="quality-check">
                    {done ? (
                      <Check size={16} />
                    ) : active ? (
                      <LoaderCircle size={16} className="spin" />
                    ) : (
                      <span />
                    )}
                  </span>
                  <div>
                    <strong>{check.label}</strong>
                    <small>{check.detail}</small>
                  </div>
                  <span className="quality-result">
                    {done ? check.value : active ? "Checking…" : "Queued"}
                  </span>
                </div>
              );
            })}
          </div>
          {(stage === "processing" || stage === "done") && (
            <div className="processing-list">
              {pipeline.map((label, i) => (
                <div
                  key={label}
                  className={
                    stage === "done" || i < step
                      ? "done"
                      : i === step
                        ? "checking"
                        : ""
                  }
                >
                  {stage === "done" || i < step ? (
                    <Check size={16} />
                  ) : i === step ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <span className="pipeline-dot" />
                  )}
                  <span>{label}</span>
                  <small>
                    {stage === "done" || i < step
                      ? "Complete"
                      : i === step
                        ? "Processing"
                        : "Queued"}
                  </small>
                </div>
              ))}
            </div>
          )}
          <div className="progress-track">
            <span
              style={{
                width:
                  (stage === "quality"
                    ? (step + 1) * 10
                    : stage === "processing"
                      ? 40 + (step + 1) * 18
                      : 100) + "%",
              }}
            />
          </div>
          {stage === "done" ? (
            <>
              <div className="capture-complete">
                <Check size={18} />
                <span>
                  Reconstruction complete.{" "}
                  <strong>2 anomalies need your attention.</strong>
                </span>
              </div>
              <button className="button primary full" onClick={finish}>
                Open inspection studio <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <p className="muted centered">
              Simulated processing · your files are never uploaded
            </p>
          )}
        </>
      )}
    </Modal>
  );
}
