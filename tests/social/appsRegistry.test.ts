import { describe, expect, it } from "vitest";

import { getApp, statusLabel } from "@/lib/apps/registry";

describe("Glow Routine public listing", () => {
  it("is available with an attributable App Store link", () => {
    const app = getApp("glow-routine");

    expect(app).toBeDefined();
    expect(app?.status).toBe("available");
    expect(statusLabel(app!.status)).toBe("On the App Store");
    expect(app?.appStoreUrl).toContain("id6777208251");
    expect(app?.appStoreUrl).toContain("pt=128943714");
    expect(app?.appStoreUrl).toContain("ct=novique_site");
  });

  it("uses current privacy-first launch copy", () => {
    const app = getApp("glow-routine");

    expect(app?.landing?.headline).toBe("Keep your skincare routine simple");
    expect(app?.landing?.subcopy).toContain("private progress");
    expect(app?.landing?.subcopy).toContain("without an account");
    expect(app?.landing?.safetyStrip).toContain("stay on your device");
  });
});
