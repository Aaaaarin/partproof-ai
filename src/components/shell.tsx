"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  LayoutDashboard,
  ScanLine,
  FileText,
  Grid2X2,
  ArrowUpRight,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { useState } from "react";
const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/inspection/", label: "Inspection studio", icon: ScanLine },
  { href: "/report/", label: "Inspection report", icon: FileText },
  { href: "/calibration/", label: "Calibration board", icon: Grid2X2 },
];
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-icon">
        <Box size={23} strokeWidth={1.7} />
      </span>
      <span>
        partproof<span className="brand-ai">AI</span>
      </span>
    </span>
  );
}
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "mobile-open" : ""}`}>
        <Link href="/" className="logo-link" onClick={() => setOpen(false)}>
          <Brand />
        </Link>
        <button
          className="icon-button close-nav"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <X size={18} />
        </button>
        <div className="workspace">
          <span className="workspace-mark">P</span>
          <div>
            <strong>Precision Works</strong>
            <small>Manufacturing workspace</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav>
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`nav-item ${path.replace(/\/$/, "") === href.replace(/\/$/, "") ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {href === "/inspection/" && <span className="nav-count">1</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="trust-card">
            <ShieldCheck size={20} />
            <strong>Confidence before compliance.</strong>
            <p>Every flag brings you closer to a better part.</p>
            <Link href="/report/">
              View traceability <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="event-label">
            <span className="zeiss-wordmark">ZEISS</span>
            <div>
              BEYOND CODE <b>2026</b>
              <small>Independent hackathon prototype</small>
            </div>
          </div>
          <div className="profile">
            <span>AO</span>
            <div>
              <strong>Arin · Operator</strong>
              <small>Demo workspace</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="nav-overlay"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button menu-toggle"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <span className="slash">/</span>
            <strong>
              {navigation.find(
                (n) => n.href.replace(/\/$/, "") === path.replace(/\/$/, ""),
              )?.label || "PartProof"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="system-status">
              <span className="online-dot" /> Systems ready
            </span>
            <span className="demo-badge">
              <Radio size={12} /> DEMO ENVIRONMENT
            </span>
          </div>
        </header>
        <main>{children}</main>
        <footer className="app-footer">
          <span>
            <ShieldCheck size={13} /> Pre-inspection intelligence.
            Human-verified quality.
          </span>
          <span>SIMULATED DATA · v1.0</span>
        </footer>
      </div>
    </div>
  );
}
