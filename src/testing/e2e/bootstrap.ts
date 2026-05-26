import { installE2eBrowserMock } from "./browserMock";

const isE2eMode = new URLSearchParams(window.location.search).get("e2e") === "1";

if (isE2eMode) {
  installE2eBrowserMock();
}
