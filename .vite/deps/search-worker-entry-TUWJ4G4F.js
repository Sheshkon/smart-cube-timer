import {
  nodeEndpointPort
} from "./chunk-X7KU3X3S.js";
import {
  exposeAPI
} from "./chunk-IF4JCSUJ.js";
import "./chunk-DGSRAQEJ.js";
import "./chunk-WOOG5QLI.js";

// node_modules/cubing/dist/lib/cubing/chunks/search-worker-entry.js
if (exposeAPI.expose) {
  (async () => {
    await import("./inside-Y2UVJZNJ-SCILNNHN.js");
    const messagePort = globalThis.postMessage ? globalThis : await nodeEndpointPort();
    messagePort.postMessage("comlink-exposed");
  })();
}
var WORKER_ENTRY_FILE_URL = import.meta.url;
export {
  WORKER_ENTRY_FILE_URL
};
//# sourceMappingURL=search-worker-entry-TUWJ4G4F.js.map
