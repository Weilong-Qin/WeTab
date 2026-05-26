import React from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/global.css";
import { OptionsPage } from "../../src/pages/OptionsPage";

async function renderOptions() {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("e2e") === "1") {
    await import("../../src/testing/e2e/bootstrap");
  }

  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <OptionsPage />
    </React.StrictMode>
  );
}

void renderOptions();
