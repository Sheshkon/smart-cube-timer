if(!self.define){let s,e={};const r=(r,i)=>(r=new URL(r+".js",i).href,e[r]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=r,s.onload=e,document.head.appendChild(s)}else s=r,importScripts(r),e()})).then((()=>{let s=e[r];if(!s)throw new Error(`Module ${r} didn’t register its module`);return s})));self.define=(i,l)=>{const n=s||("document"in self?document.currentScript.src:"")||location.href;if(e[n])return;let u={};const a=s=>r(s,n),o={module:{uri:n},exports:u,require:a};e[n]=Promise.all(i.map((s=>o[s]||a(s)))).then((s=>(l(...s),u)))}}define(["./workbox-e3490c72"],(function(s){"use strict";self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"assets/chunk-Y3BVWVFU-Civ1saam.js",revision:null},{url:"assets/index-D54T_UtR.js",revision:null},{url:"assets/index-D9nwX2m7.css",revision:null},{url:"assets/index-DkXl0bsh.js",revision:null},{url:"assets/inside-Y2UVJZNJ-C9tPp9MX.js",revision:null},{url:"assets/puzzles-dynamic-3x3x3-JWIWLLZA-fR7zXD4k.js",revision:null},{url:"assets/puzzles-dynamic-4x4x4-REUXFQJ4-BNnOy5ao.js",revision:null},{url:"assets/puzzles-dynamic-megaminx-2LVHIDL4-Cm8jQJ-N.js",revision:null},{url:"assets/puzzles-dynamic-side-events-QIADTLKJ-Ce2s_gCL.js",revision:null},{url:"assets/puzzles-dynamic-unofficial-NCMLO2AJ-SUsTto0f.js",revision:null},{url:"assets/search-dynamic-sgs-side-events-RPVZU2YB-J-0W1nKN.js",revision:null},{url:"assets/search-dynamic-sgs-unofficial-2TYKOUM4-_9N9fSTg.js",revision:null},{url:"assets/search-dynamic-solve-3x3x3-QHRLSVAC-6iYVGW9D.js",revision:null},{url:"assets/search-dynamic-solve-4x4x4-V5D7RQND-s7xvLkyp.js",revision:null},{url:"assets/search-dynamic-solve-fto-UOKDYVD5-DtL44De2.js",revision:null},{url:"assets/search-dynamic-solve-kilominx-RAZM75GA-BlbhbpNS.js",revision:null},{url:"assets/search-dynamic-solve-master_tetraminx-3D4MBF3V-Lo11unwL.js",revision:null},{url:"assets/search-dynamic-solve-sq1-YESVPPLF-D1k8UHg1.js",revision:null},{url:"assets/search-worker-entry-DNPX3OpU.js",revision:null},{url:"assets/search-worker-entry-IEUI67OZ.js",revision:null},{url:"assets/twisty-dynamic-3d-HF7KVBOE-BSTXDVMc.js",revision:null},{url:"assets/twsearch_wasm_bg-V4F3SIUO-QGKWKUFY-iE1VAZwZ.js",revision:null},{url:"assets/twsearch-MRZGOB6T-BhZyOpPS.js",revision:null},{url:"assets/worker/chunk-Y3BVWVFU-BDrNbgoW.js",revision:null},{url:"assets/worker/index-OaN7RAFO.js",revision:null},{url:"assets/worker/inside-Y2UVJZNJ-Cu-MpFSH.js",revision:null},{url:"assets/worker/puzzles-dynamic-3x3x3-JWIWLLZA-fR7zXD4k.js",revision:null},{url:"assets/worker/puzzles-dynamic-4x4x4-REUXFQJ4-BNnOy5ao.js",revision:null},{url:"assets/worker/puzzles-dynamic-megaminx-2LVHIDL4-Cm8jQJ-N.js",revision:null},{url:"assets/worker/puzzles-dynamic-side-events-QIADTLKJ-Ce2s_gCL.js",revision:null},{url:"assets/worker/puzzles-dynamic-unofficial-NCMLO2AJ-SUsTto0f.js",revision:null},{url:"assets/worker/search-dynamic-sgs-side-events-RPVZU2YB-Q9KJhA9l.js",revision:null},{url:"assets/worker/search-dynamic-sgs-unofficial-2TYKOUM4-BWCqth6N.js",revision:null},{url:"assets/worker/search-dynamic-solve-3x3x3-QHRLSVAC-6iYVGW9D.js",revision:null},{url:"assets/worker/search-dynamic-solve-4x4x4-V5D7RQND-COf66azC.js",revision:null},{url:"assets/worker/search-dynamic-solve-fto-UOKDYVD5-BtkD8cfr.js",revision:null},{url:"assets/worker/search-dynamic-solve-kilominx-RAZM75GA-CspQUh7h.js",revision:null},{url:"assets/worker/search-dynamic-solve-master_tetraminx-3D4MBF3V-ERSDM-8s.js",revision:null},{url:"assets/worker/search-dynamic-solve-sq1-YESVPPLF-3E-Bmagu.js",revision:null},{url:"assets/worker/search-worker-entry-DcOSGEhO.js",revision:null},{url:"assets/worker/twsearch_wasm_bg-V4F3SIUO-QGKWKUFY-iE1VAZwZ.js",revision:null},{url:"assets/worker/twsearch-MRZGOB6T-CwgnijHO.js",revision:null},{url:"index.html",revision:"3b2e932eb53bd977829e27b6b1688373"},{url:"registerSW.js",revision:"3d94640f6120157f03b69090a653a035"},{url:"icons/icon.png",revision:"73023dfc75225d0e244971c97539d5dc"},{url:"manifest.webmanifest",revision:"fbf74714a40a6f38494bd54fdb2dac07"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));
