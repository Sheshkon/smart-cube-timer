import {
  nodeEndpointPort
} from "./chunk-6WYRN27C.js";
import {
  exposeAPI
} from "./chunk-7GUL3OBQ.js";
import "./chunk-RDSQRW3G.js";

// src/cubing/search/worker-workarounds/search-worker-entry.js
if (exposeAPI.expose) {
  (async () => {
    await import("./inside-KAVAZETT.js");
    const messagePort = globalThis.postMessage ? globalThis : await nodeEndpointPort();
    messagePort.postMessage("comlink-exposed");
  })();
}
var WORKER_ENTRY_FILE_URL = import.meta.url;
export {
  WORKER_ENTRY_FILE_URL
};
//# sourceMappingURL=search-worker-entry.js.map
