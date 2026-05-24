import React from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/global.css";
import { OptionsPage } from "../../src/pages/OptionsPage";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OptionsPage />
  </React.StrictMode>
);
