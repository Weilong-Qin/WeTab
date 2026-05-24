import React from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/global.css";
import { DesignSystemPage } from "../../src/pages/DesignSystemPage";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DesignSystemPage />
  </React.StrictMode>
);
