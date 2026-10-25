import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
test("capture simulation creates a traceable inspection and downloadable handoff", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Precision starts here." }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "qa/dashboard-desktop.png", fullPage: true });
  await page.getByLabel("COMPONENT PRESET").selectOption("rotor");
  await expect(page.getByText("Ø 96.00")).toBeVisible();
  await page.getByRole("button", { name: "Start new inspection" }).click();
  await page.getByRole("button", { name: "Use demo capture" }).click();
  await expect(
    page.getByRole("button", { name: "Open inspection studio" }),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByText("Grid calibration OK · DICT_4X4_50"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open inspection studio" }).click();
  await expect(page).toHaveURL(/inspection/, { timeout: 15000 });
  await expect(
    page.getByRole("heading", { name: "ESCALATE TO ZEISS CMM" }),
  ).toBeVisible();
  await expect(
    page.getByText("Compressor Rotor v1", { exact: false }).first(),
  ).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Nominal CAD" }).click();
  await expect(page.getByText("NOMINAL GEOMETRY")).toBeVisible();
  await page.getByRole("button", { name: "Deviation heatmap" }).click();
  await expect(
    page.getByText("SURFACE DEVIATION", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle wireframe" }).click();
  await expect(
    page.getByRole("button", { name: "Toggle wireframe" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Toggle wireframe" }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "qa/studio-desktop.png", fullPage: true });
  await page
    .getByRole("button", { name: "Forward Package to ZEISS INSPECT" })
    .click();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download review package" }).click();
  const download = await downloadEvent;
  const filePath = await download.path();
  const payload = JSON.parse(await fs.readFile(filePath!, "utf8"));
  expect(payload.simulated).toBe(true);
  expect(payload.component.id).toBe("rotor");
  expect(payload.anomalies[0].deviationMm).toBe(0.38);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("link", { name: "Export PDF Pre-Inspection Report" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Compressor Rotor v1" }),
  ).toBeVisible();
  await expect(page.locator(".report-model img")).toBeVisible();
  await page.screenshot({ path: "qa/report-desktop.png", fullPage: true });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: "qa/pre-inspection-report.pdf",
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Compressor Rotor v1" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("local upload accepts JPEG captures and rejects unsupported files", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start new inspection" }).click();
  await page
    .getByLabel("Upload capture files")
    .setInputFiles({
      name: "wrong.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("bad"),
    });
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Choose one MP4 video",
  );
  await expect(
    page.getByRole("button", { name: "Verify capture" }),
  ).toBeDisabled();
  await page
    .getByLabel("Upload capture files")
    .setInputFiles({
      name: "part.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from([255, 216, 255, 217]),
    });
  await expect(
    page.getByRole("button", { name: "Verify capture" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Verify capture" }).click();
  await expect(
    page.getByRole("button", { name: "Open inspection studio" }),
  ).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Open inspection studio" }).click();
  await page
    .getByRole("link", { name: "Export PDF Pre-Inspection Report" })
    .click();
  await expect(page.getByText("part.jpg", { exact: true })).toBeVisible();
});
test("mobile navigation and core screens fit the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/inspection/", "/report/", "/calibration/"]) {
    await page.goto(path);
    await page.waitForTimeout(700);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: "qa/mobile-" + (path.replaceAll("/", "") || "dashboard") + ".png",
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Precision starts here." }),
  ).toBeVisible();
});
test("calibration board prints at specified physical dimensions", async ({
  page,
}) => {
  await page.goto("/calibration/");
  const image = page.getByAltText(/OpenCV ChArUco/);
  await expect(image).toBeVisible();
  expect(
    await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBe(1400);
  await page.emulateMedia({ media: "print" });
  const box = await image.boundingBox();
  expect(box!.width).toBeCloseTo((140 / 25.4) * 96, 0);
  expect(box!.height).toBeCloseTo((100 / 25.4) * 96, 0);
  await page.pdf({
    path: "qa/calibration-board.pdf",
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });
});
