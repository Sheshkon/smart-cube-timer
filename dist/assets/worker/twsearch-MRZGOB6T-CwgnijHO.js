import{A as R}from"./inside-Y2UVJZNJ-Cu-MpFSH.js";import"../search-worker-entry-DNPX3OpU.js";var $="node:-fs/pr-omises",C=()=>$.replace(/-/g,""),i,W=typeof TextDecoder<"u"?new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}):{decode:()=>{throw Error("TextDecoder not available")}};typeof TextDecoder<"u"&&W.decode();var x=null;function A(){return(x===null||x.byteLength===0)&&(x=new Uint8Array(i.memory.buffer)),x}function y(n,e){return n=n>>>0,W.decode(A().subarray(n,n+e))}var d=new Array(128).fill(void 0);d.push(void 0,null,!0,!1);var S=d.length;function _(n){S===d.length&&d.push(d.length+1);const e=S;return S=d[e],d[e]=n,e}function c(n){return d[n]}function J(n){n<132||(d[n]=S,S=n)}function E(n){const e=c(n);return J(n),e}function O(n){const e=typeof n;if(e=="number"||e=="boolean"||n==null)return`${n}`;if(e=="string")return`"${n}"`;if(e=="symbol"){const o=n.description;return o==null?"Symbol":`Symbol(${o})`}if(e=="function"){const o=n.name;return typeof o=="string"&&o.length>0?`Function(${o})`:"Function"}if(Array.isArray(n)){const o=n.length;let f="[";o>0&&(f+=O(n[0]));for(let a=1;a<o;a++)f+=", "+O(n[a]);return f+="]",f}const t=/\[object ([^\]]+)\]/.exec(toString.call(n));let r;if(t.length>1)r=t[1];else return toString.call(n);if(r=="Object")try{return"Object("+JSON.stringify(n)+")"}catch{return"Object"}return n instanceof Error?`${n.name}: ${n.message}
${n.stack}`:r}var l=0,T=typeof TextEncoder<"u"?new TextEncoder("utf-8"):{encode:()=>{throw Error("TextEncoder not available")}},L=typeof T.encodeInto=="function"?function(n,e){return T.encodeInto(n,e)}:function(n,e){const t=T.encode(n);return e.set(t),{read:n.length,written:t.length}};function p(n,e,t){if(t===void 0){const s=T.encode(n),b=e(s.length,1)>>>0;return A().subarray(b,b+s.length).set(s),l=s.length,b}let r=n.length,o=e(r,1)>>>0;const f=A();let a=0;for(;a<r;a++){const s=n.charCodeAt(a);if(s>127)break;f[o+a]=s}if(a!==r){a!==0&&(n=n.slice(a)),o=t(o,r,r=a+n.length*3,1)>>>0;const s=A().subarray(o+a,o+r),b=L(n,s);a+=b.written}return l=a,o}var v=null;function u(){return(v===null||v.byteLength===0)&&(v=new Int32Array(i.memory.buffer)),v}function q(n,e,t){let r,o;try{const m=i.__wbindgen_add_to_stack_pointer(-16),k=p(n,i.__wbindgen_export_0,i.__wbindgen_export_1),M=l,I=p(e,i.__wbindgen_export_0,i.__wbindgen_export_1),U=l,D=p(t,i.__wbindgen_export_0,i.__wbindgen_export_1),N=l;i.wasmTwsearch(m,k,M,I,U,D,N);var f=u()[m/4+0],a=u()[m/4+1],s=u()[m/4+2],b=u()[m/4+3],g=f,h=a;if(b)throw g=0,h=0,E(s);return r=g,o=h,y(g,h)}finally{i.__wbindgen_add_to_stack_pointer(16),i.__wbindgen_export_2(r,o,1)}}function V(n){let e,t;try{const g=i.__wbindgen_add_to_stack_pointer(-16),h=p(n,i.__wbindgen_export_0,i.__wbindgen_export_1),m=l;i.wasmRandomScrambleForEvent(g,h,m);var r=u()[g/4+0],o=u()[g/4+1],f=u()[g/4+2],a=u()[g/4+3],s=r,b=o;if(a)throw s=0,b=0,E(f);return e=s,t=b,y(s,b)}finally{i.__wbindgen_add_to_stack_pointer(16),i.__wbindgen_export_2(e,t,1)}}function w(n,e){try{return n.apply(this,e)}catch(t){i.__wbindgen_export_3(_(t))}}async function B(n,e){if(typeof Response=="function"&&n instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(n,e)}catch(r){if(n.headers.get("Content-Type")!="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",r);else throw r}const t=await n.arrayBuffer();return await WebAssembly.instantiate(t,e)}else{const t=await WebAssembly.instantiate(n,e);return t instanceof WebAssembly.Instance?{instance:t,module:n}:t}}function z(){const n={};return n.wbg={},n.wbg.__wbindgen_string_new=function(e,t){const r=y(e,t);return _(r)},n.wbg.__wbg_new_abda76e883ba8a5f=function(){const e=new Error;return _(e)},n.wbg.__wbg_stack_658279fe44541cf6=function(e,t){const r=c(t).stack,o=p(r,i.__wbindgen_export_0,i.__wbindgen_export_1),f=l;u()[e/4+1]=f,u()[e/4+0]=o},n.wbg.__wbg_error_f851667af71bcfc6=function(e,t){let r,o;try{r=e,o=t,console.error(y(e,t))}finally{i.__wbindgen_export_2(r,o,1)}},n.wbg.__wbindgen_object_drop_ref=function(e){E(e)},n.wbg.__wbindgen_object_clone_ref=function(e){const t=c(e);return _(t)},n.wbg.__wbg_crypto_c48a774b022d20ac=function(e){const t=c(e).crypto;return _(t)},n.wbg.__wbindgen_is_object=function(e){const t=c(e);return typeof t=="object"&&t!==null},n.wbg.__wbg_process_298734cf255a885d=function(e){const t=c(e).process;return _(t)},n.wbg.__wbg_versions_e2e78e134e3e5d01=function(e){const t=c(e).versions;return _(t)},n.wbg.__wbg_node_1cd7a5d853dbea79=function(e){const t=c(e).node;return _(t)},n.wbg.__wbindgen_is_string=function(e){return typeof c(e)=="string"},n.wbg.__wbg_require_8f08ceecec0f4fee=function(){return w(function(){const e=module.require;return _(e)},arguments)},n.wbg.__wbindgen_is_function=function(e){return typeof c(e)=="function"},n.wbg.__wbg_call_01734de55d61e11d=function(){return w(function(e,t,r){const o=c(e).call(c(t),c(r));return _(o)},arguments)},n.wbg.__wbg_msCrypto_bcb970640f50a1e8=function(e){const t=c(e).msCrypto;return _(t)},n.wbg.__wbg_newwithlength_e5d69174d6984cd7=function(e){const t=new Uint8Array(e>>>0);return _(t)},n.wbg.__wbg_get_97b561fb56f034b5=function(){return w(function(e,t){const r=Reflect.get(c(e),c(t));return _(r)},arguments)},n.wbg.__wbg_now_0cfdc90c97d0c24b=function(e){return c(e).now()},n.wbg.__wbg_self_1ff1d729e9aae938=function(){return w(function(){const e=self.self;return _(e)},arguments)},n.wbg.__wbg_window_5f4faef6c12b79ec=function(){return w(function(){const e=window.window;return _(e)},arguments)},n.wbg.__wbg_globalThis_1d39714405582d3c=function(){return w(function(){const e=globalThis.globalThis;return _(e)},arguments)},n.wbg.__wbg_global_651f05c6a0944d1c=function(){return w(function(){const e=global.global;return _(e)},arguments)},n.wbg.__wbindgen_is_undefined=function(e){return c(e)===void 0},n.wbg.__wbg_newnoargs_581967eacc0e2604=function(e,t){const r=new Function(y(e,t));return _(r)},n.wbg.__wbg_call_cb65541d95d71282=function(){return w(function(e,t){const r=c(e).call(c(t));return _(r)},arguments)},n.wbg.__wbindgen_memory=function(){const e=i.memory;return _(e)},n.wbg.__wbg_buffer_085ec1f694018c4f=function(e){const t=c(e).buffer;return _(t)},n.wbg.__wbg_newwithbyteoffsetandlength_6da8e527659b86aa=function(e,t,r){const o=new Uint8Array(c(e),t>>>0,r>>>0);return _(o)},n.wbg.__wbg_randomFillSync_dc1e9a60c158336d=function(){return w(function(e,t){c(e).randomFillSync(E(t))},arguments)},n.wbg.__wbg_subarray_13db269f57aa838d=function(e,t,r){const o=c(e).subarray(t>>>0,r>>>0);return _(o)},n.wbg.__wbg_getRandomValues_37fa2ca9e4e07fab=function(){return w(function(e,t){c(e).getRandomValues(c(t))},arguments)},n.wbg.__wbg_new_8125e318e6245eed=function(e){const t=new Uint8Array(c(e));return _(t)},n.wbg.__wbg_set_5cf90238115182c3=function(e,t,r){c(e).set(c(t),r>>>0)},n.wbg.__wbindgen_debug_string=function(e,t){const r=O(c(t)),o=p(r,i.__wbindgen_export_0,i.__wbindgen_export_1),f=l;u()[e/4+1]=f,u()[e/4+0]=o},n.wbg.__wbindgen_throw=function(e,t){throw new Error(y(e,t))},n}function H(n,e){return i=n.exports,j.__wbindgen_wasm_module=e,v=null,x=null,i}async function j(n){if(i!==void 0)return i;if(typeof n>"u")throw new Error("Default `wasm-pack` WASM loading code path triggered! This is currently not supported for `twsearch` due to incompatibility with some bundlers.");const e=z();if(typeof n=="string"||typeof Request=="function"&&n instanceof Request||typeof URL=="function"&&n instanceof URL)try{n=await fetch(n)}catch(o){if(!(o instanceof TypeError))throw o;n=await(await import(C())).readFile(n)}const{instance:t,module:r}=await B(await n,e);return H(t,r)}var G=j,K;async function F(){await(K??(K=(async()=>{const n=(await import("./twsearch_wasm_bg-V4F3SIUO-QGKWKUFY-iE1VAZwZ.js")).default;await G(n.buffer)})()))}async function X(n){return await F(),new R(V(n))}async function Y(n,e,t){return await F(),new R(q(JSON.stringify(n),JSON.stringify(e.toJSON().patternData),JSON.stringify(t)))}export{X as wasmRandomScrambleForEvent,Y as wasmTwsearch};