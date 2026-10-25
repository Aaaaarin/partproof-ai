// Next.js issue #85374: Windows exports nested segment paths while the router
// requests dotted names. Add portable aliases without modifying the originals.
// Linux GitHub Actions builds already emit the expected files.
import { readdir, copyFile } from "node:fs/promises";
import path from "node:path";
const root = path.resolve("out");
let copies = 0;
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(absolute);
    else if (entry.name.endsWith(".txt")) {
      const relative = path.relative(root, absolute).split(path.sep);
      const segment = relative.findIndex((p) => p.startsWith("__next."));
      if (segment >= 0 && segment < relative.length - 1) {
        const target = path.join(
          root,
          ...relative.slice(0, segment),
          relative.slice(segment).join("."),
        );
        await copyFile(absolute, target);
        copies++;
      }
    }
  }
}
await walk(root);
console.log(
  "Static export ready; normalized " + copies + " Windows segment paths.",
);
