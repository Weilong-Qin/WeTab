import path from "node:path";
import { pathToFileURL } from "node:url";

const baseUrl = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const outputDir = process.env.E2E_OUTPUT_DIR;

function toEntrypointUrl(entrypointName: string): string {
  if (outputDir) {
    const entrypointPath = path.join(outputDir, `${entrypointName}.html`);
    return pathToFileURL(entrypointPath).toString();
  }

  return new URL(`entrypoints/${entrypointName}/index.html`, baseUrl).toString();
}

export const entrypointUrls = {
  designSystem: toEntrypointUrl("design-system"),
  newtab: toEntrypointUrl("newtab"),
  options: toEntrypointUrl("options")
};
