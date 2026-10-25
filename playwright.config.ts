import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  // Software WebGL on CI needs extra time for the complete capture-to-PDF flow.
  timeout: 150000,
  use: {
    baseURL: process.env.TEST_URL || "http://127.0.0.1:3000",
    channel: "chrome",
    viewport: { width: 1440, height: 1080 },
    screenshot: "only-on-failure",
    launchOptions: {
      args: [
        "--enable-webgl",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  projects: [{ name: "desktop" }],
  reporter: "list",
});
