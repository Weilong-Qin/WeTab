import React from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/global.css";

async function renderDesignSystem() {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("e2e") === "1") {
    await import("../../src/testing/e2e/bootstrap");
  }

  const { DesignSystemPage } = await import("../../src/pages/DesignSystemPage");

  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <DesignSystemPage />
    </React.StrictMode>
  );
}

void renderDesignSystem();
