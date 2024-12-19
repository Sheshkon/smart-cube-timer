import{J as R,_ as $}from"./index-C-XE5v8E.js";var J="node:-fs/pr-omises",L=()=>J.replace(/-/g,""),i,W=typeof TextDecoder<"u"?new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}):{decode:()=>{throw Error("TextDecoder not available")}};typeof TextDecoder<"u"&&W.decode();var v=null;function T(){return(v===null||v.byteLength===0)&&(v=new Uint8Array(i.memory.buffer)),v}function y(e,n){return e=e>>>0,W.decode(T().subarray(e,e+n))}var g=new Array(128).fill(void 0);g.push(void 0,null,!0,!1);var S=g.length;function _(e){S===g.length&&g.push(g.length+1);const n=S;return S=g[n],g[n]=e,n}function c(e){return g[e]}function C(e){e<132||(g[e]=S,S=e)}function E(e){const n=c(e);return C(e),n}function O(e){const n=typeof e;if(n=="number"||n=="boolean"||e==null)return`${e}`;if(n=="string")return`"${e}"`;if(n=="symbol"){const o=e.description;return o==null?"Symbol":`Symbol(${o})`}if(n=="function"){const o=e.name;return typeof o=="string"&&o.length>0?`Function(${o})`:"Function"}if(Array.isArray(e)){const o=e.length;let f="[";o>0&&(f+=O(e[0]));for(let a=1;a<o;a++)f+=", "+O(e[a]);return f+="]",f}const t=/\[object ([^\]]+)\]/.exec(toString.call(e));let r;if(t.length>1)r=t[1];else return toString.call(e);if(r=="Object")try{return"Object("+JSON.stringify(e)+")"}catch{return"Object"}return e instanceof Error?`${e.name}: ${e.message}
${e.stack}`:r}var l=0,A=typeof TextEncoder<"u"?new TextEncoder("utf-8"):{encode:()=>{throw Error("TextEncoder not available")}},q=typeof A.encodeInto=="function"?function(e,n){return A.encodeInto(e,n)}:function(e,n){const t=A.encode(e);return n.set(t),{read:e.length,written:t.length}};function p(e,n,t){if(t===void 0){const s=A.encode(e),b=n(s.length,1)>>>0;return T().subarray(b,b+s.length).set(s),l=s.length,b}let r=e.length,o=n(r,1)>>>0;const f=T();let a=0;for(;a<r;a++){const s=e.charCodeAt(a);if(s>127)break;f[o+a]=s}if(a!==r){a!==0&&(e=e.slice(a)),o=t(o,r,r=a+e.length*3,1)>>>0;const s=T().subarray(o+a,o+r),b=q(e,s);a+=b.written}return l=a,o}var x=null;function u(){return(x===null||x.byteLength===0)&&(x=new Int32Array(i.memory.buffer)),x}function V(e,n,t){let r,o;try{const m=i.__wbindgen_add_to_stack_pointer(-16),k=p(e,i.__wbindgen_export_0,i.__wbindgen_export_1),I=l,M=p(n,i.__wbindgen_export_0,i.__wbindgen_export_1),U=l,D=p(t,i.__wbindgen_export_0,i.__wbindgen_export_1),N=l;i.wasmTwsearch(m,k,I,M,U,D,N);var f=u()[m/4+0],a=u()[m/4+1],s=u()[m/4+2],b=u()[m/4+3],d=f,h=a;if(b)throw d=0,h=0,E(s);return r=d,o=h,y(d,h)}finally{i.__wbindgen_add_to_stack_pointer(16),i.__wbindgen_export_2(r,o,1)}}function B(e){let n,t;try{const d=i.__wbindgen_add_to_stack_pointer(-16),h=p(e,i.__wbindgen_export_0,i.__wbindgen_export_1),m=l;i.wasmRandomScrambleForEvent(d,h,m);var r=u()[d/4+0],o=u()[d/4+1],f=u()[d/4+2],a=u()[d/4+3],s=r,b=o;if(a)throw s=0,b=0,E(f);return n=s,t=b,y(s,b)}finally{i.__wbindgen_add_to_stack_pointer(16),i.__wbindgen_export_2(n,t,1)}}function w(e,n){try{return e.apply(this,n)}catch(t){i.__wbindgen_export_3(_(t))}}async function P(e,n){if(typeof Response=="function"&&e instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(e,n)}catch(r){if(e.headers.get("Content-Type")!="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",r);else throw r}const t=await e.arrayBuffer();return await WebAssembly.instantiate(t,n)}else{const t=await WebAssembly.instantiate(e,n);return t instanceof WebAssembly.Instance?{instance:t,module:e}:t}}function z(){const e={};return e.wbg={},e.wbg.__wbindgen_string_new=function(n,t){const r=y(n,t);return _(r)},e.wbg.__wbg_new_abda76e883ba8a5f=function(){const n=new Error;return _(n)},e.wbg.__wbg_stack_658279fe44541cf6=function(n,t){const r=c(t).stack,o=p(r,i.__wbindgen_export_0,i.__wbindgen_export_1),f=l;u()[n/4+1]=f,u()[n/4+0]=o},e.wbg.__wbg_error_f851667af71bcfc6=function(n,t){let r,o;try{r=n,o=t,console.error(y(n,t))}finally{i.__wbindgen_export_2(r,o,1)}},e.wbg.__wbindgen_object_drop_ref=function(n){E(n)},e.wbg.__wbindgen_object_clone_ref=function(n){const t=c(n);return _(t)},e.wbg.__wbg_crypto_c48a774b022d20ac=function(n){const t=c(n).crypto;return _(t)},e.wbg.__wbindgen_is_object=function(n){const t=c(n);return typeof t=="object"&&t!==null},e.wbg.__wbg_process_298734cf255a885d=function(n){const t=c(n).process;return _(t)},e.wbg.__wbg_versions_e2e78e134e3e5d01=function(n){const t=c(n).versions;return _(t)},e.wbg.__wbg_node_1cd7a5d853dbea79=function(n){const t=c(n).node;return _(t)},e.wbg.__wbindgen_is_string=function(n){return typeof c(n)=="string"},e.wbg.__wbg_require_8f08ceecec0f4fee=function(){return w(function(){const n=module.require;return _(n)},arguments)},e.wbg.__wbindgen_is_function=function(n){return typeof c(n)=="function"},e.wbg.__wbg_call_01734de55d61e11d=function(){return w(function(n,t,r){const o=c(n).call(c(t),c(r));return _(o)},arguments)},e.wbg.__wbg_msCrypto_bcb970640f50a1e8=function(n){const t=c(n).msCrypto;return _(t)},e.wbg.__wbg_newwithlength_e5d69174d6984cd7=function(n){const t=new Uint8Array(n>>>0);return _(t)},e.wbg.__wbg_get_97b561fb56f034b5=function(){return w(function(n,t){const r=Reflect.get(c(n),c(t));return _(r)},arguments)},e.wbg.__wbg_now_0cfdc90c97d0c24b=function(n){return c(n).now()},e.wbg.__wbg_self_1ff1d729e9aae938=function(){return w(function(){const n=self.self;return _(n)},arguments)},e.wbg.__wbg_window_5f4faef6c12b79ec=function(){return w(function(){const n=window.window;return _(n)},arguments)},e.wbg.__wbg_globalThis_1d39714405582d3c=function(){return w(function(){const n=globalThis.globalThis;return _(n)},arguments)},e.wbg.__wbg_global_651f05c6a0944d1c=function(){return w(function(){const n=global.global;return _(n)},arguments)},e.wbg.__wbindgen_is_undefined=function(n){return c(n)===void 0},e.wbg.__wbg_newnoargs_581967eacc0e2604=function(n,t){const r=new Function(y(n,t));return _(r)},e.wbg.__wbg_call_cb65541d95d71282=function(){return w(function(n,t){const r=c(n).call(c(t));return _(r)},arguments)},e.wbg.__wbindgen_memory=function(){const n=i.memory;return _(n)},e.wbg.__wbg_buffer_085ec1f694018c4f=function(n){const t=c(n).buffer;return _(t)},e.wbg.__wbg_newwithbyteoffsetandlength_6da8e527659b86aa=function(n,t,r){const o=new Uint8Array(c(n),t>>>0,r>>>0);return _(o)},e.wbg.__wbg_randomFillSync_dc1e9a60c158336d=function(){return w(function(n,t){c(n).randomFillSync(E(t))},arguments)},e.wbg.__wbg_subarray_13db269f57aa838d=function(n,t,r){const o=c(n).subarray(t>>>0,r>>>0);return _(o)},e.wbg.__wbg_getRandomValues_37fa2ca9e4e07fab=function(){return w(function(n,t){c(n).getRandomValues(c(t))},arguments)},e.wbg.__wbg_new_8125e318e6245eed=function(n){const t=new Uint8Array(c(n));return _(t)},e.wbg.__wbg_set_5cf90238115182c3=function(n,t,r){c(n).set(c(t),r>>>0)},e.wbg.__wbindgen_debug_string=function(n,t){const r=O(c(t)),o=p(r,i.__wbindgen_export_0,i.__wbindgen_export_1),f=l;u()[n/4+1]=f,u()[n/4+0]=o},e.wbg.__wbindgen_throw=function(n,t){throw new Error(y(n,t))},e}function H(e,n){return i=e.exports,j.__wbindgen_wasm_module=n,x=null,v=null,i}async function j(e){if(i!==void 0)return i;if(typeof e>"u")throw new Error("Default `wasm-pack` WASM loading code path triggered! This is currently not supported for `twsearch` due to incompatibility with some bundlers.");const n=z();if(typeof e=="string"||typeof Request=="function"&&e instanceof Request||typeof URL=="function"&&e instanceof URL)try{e=await fetch(e)}catch(o){if(!(o instanceof TypeError))throw o;e=await(await import(L())).readFile(e)}const{instance:t,module:r}=await P(await e,n);return H(t,r)}var G=j,K;async function F(){await(K??(K=(async()=>{const e=(await $(async()=>{const{default:n}=await import("./twsearch_wasm_bg-V4F3SIUO-QGKWKUFY-iE1VAZwZ.js");return{default:n}},[])).default;await G(e.buffer)})()))}async function X(e){return await F(),new R(B(e))}async function Y(e,n,t){return await F(),new R(V(JSON.stringify(e),JSON.stringify(n.toJSON().patternData),JSON.stringify(t)))}export{X as wasmRandomScrambleForEvent,Y as wasmTwsearch};
