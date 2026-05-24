import React from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/global.css";
import { NewTabPage } from "../../src/pages/NewTabPage";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NewTabPage />
  </React.StrictMode>
);
