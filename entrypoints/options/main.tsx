import React from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/global.css";

async function renderOptions() {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("e2e") === "1") {
    await import("../../src/testing/e2e/bootstrap");
  }

  const { OptionsPage } = await import("../../src/pages/OptionsPage");

  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <OptionsPage />
    </React.StrictMode>
  );
}

void renderOptions();
