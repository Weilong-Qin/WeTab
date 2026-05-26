import React from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/global.css";

async function renderNewTab() {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("e2e") === "1") {
    await import("../../src/testing/e2e/bootstrap");
  }

  const { NewTabPage } = await import("../../src/pages/NewTabPage");

  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <NewTabPage />
    </React.StrictMode>
  );
}

void renderNewTab();
