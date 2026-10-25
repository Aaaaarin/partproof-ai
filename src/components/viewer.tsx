"use client";
import dynamic from "next/dynamic";
const Viewer = dynamic(() => import("./part-viewer"), {
  ssr: false,
  loading: () => (
    <div className="viewer-loading">
      <span className="spinner" />
      <span>Preparing digital twin</span>
    </div>
  ),
});
export default Viewer;
