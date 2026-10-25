"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { asset, defaultInspection, type Inspection } from "@/lib/data";

const Context = createContext<{
  inspection: Inspection;
  save: (value: Inspection) => void;
  snapshot: string;
  setSnapshot: (value: string) => void;
}>({
  inspection: defaultInspection,
  save: () => {},
  snapshot: "",
  setSnapshot: () => {},
});
export function Provider({ children }: { children: ReactNode }) {
  const [inspection, setInspection] = useState(defaultInspection);
  const [snapshot, updateSnapshot] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("partproof-inspection");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.id && data.timestamp && data.presetId) setInspection(data);
      }
      updateSnapshot(sessionStorage.getItem("partproof-snapshot") || "");
    } catch {
      /* Storage is optional in private browsing. */
    }
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      navigator.serviceWorker
        .register(asset("/sw.js"), { scope: asset("/") })
        .catch(() => {});
  }, []);
  function save(value: Inspection) {
    setInspection(value);
    updateSnapshot("");
    try {
      localStorage.setItem("partproof-inspection", JSON.stringify(value));
      sessionStorage.removeItem("partproof-snapshot");
    } catch {}
  }
  function setSnapshot(value: string) {
    updateSnapshot(value);
    try {
      sessionStorage.setItem("partproof-snapshot", value);
    } catch {}
  }
  return (
    <Context.Provider value={{ inspection, save, snapshot, setSnapshot }}>
      {children}
    </Context.Provider>
  );
}
export const useInspection = () => useContext(Context);
