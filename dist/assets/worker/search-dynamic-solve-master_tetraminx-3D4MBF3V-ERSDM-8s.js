import{a as w}from"./inside-Y2UVJZNJ-Cu-MpFSH.js";import"../search-worker-entry-DNPX3OpU.js";function I(e){if(e<2)return e;let t=1;for(let r=2;r<=e;r++)t*=r;return t}function x(e){let t=Array(e);for(let r=0;r<e;r++)t[r]=r;return t}function X(e){e=e.slice();let t=e.length,r=I(t-1),n=0;for(;t>1;){t--;let o=e[0];n+=o*r;for(let i=0;i<t;i++){let l=e[i+1];e[i]=l-(l>o)}r/=t}return n}function b(e,t){let r=[],n=I(t-1)/2,o=0;for(let i=0;i<t-1;i++)r[i]=e/n|0,e%=n,n/=t-1-i;r[t-1]=0;for(let i=t-2;i>=0;i--)for(let l=i+1;l<t;l++)r[l]>=r[i]?r[l]++:o^=1;return o===1&&([r[t-2],r[t-1]]=[r[t-1],r[t-2]]),r}function V(e){return X(e)>>1}(()=>{let e=new Int8Array(49152),t=new Int8Array(4096*12);for(let o=0;o<4096;o++)for(let i=0,l=0;i<12;i++)o>>>i&1&&(e[i<<12|o]=l,t[l<<12|o]=i,l++);function r(o){let i=4095,l=19958400,a=0;for(let p=0;p<10;p++){let _=o[p];a+=e[i|_<<12]*l,i&=~(1<<_),l/=11-p}return a}function n(o,i){let l=4095,a=19958400,p=0;for(let _=0;_<10;_++){let c=o/a|0;o-=c*a,p^=c&1;let f=t[l|c<<12];i[_]=f,l&=~(1<<f),a/=11-_}return i[10]=t[l|p<<12],i[11]=t[l|(p^1)<<12],i}return[r,n]})();function d(e,t){let r=[];for(let n=0;n<t.length;n++)r[n]=e[t[n]];return r}function N(e){let t=[];for(let r=0;r<e.length;r++)t[e[r]]=r;return t}function $(e,t){let r=[];for(let n=0;n<t;n++)r[n]=n;for(let n=0;n<e.length;n++)r[e[n]]=e[(n+1)%e.length];return r}function g(e,t){return e.length===0?x(t):e.map(r=>$(r,t)).reduce(d)}function Y(e,t){let r=Array(4);for(let l=0;l<4;l++)r[l]=(e.co[l]+t.co[l])%3;let n=d(e.mp,t.mp),o=d(e.wp,t.wp),i=d(e.cp,t.cp);return{co:r,mp:n,wp:o,cp:i}}x(12),x(12);var Z={co:[2,0,0,0],mp:x(12),wp:$([1,9,11],12),cp:[0,1,2,3]},ee={co:[0,2,0,0],mp:x(12),wp:$([0,7,2],12),cp:[0,1,2,3]},te={co:[0,0,2,0],mp:x(12),wp:$([3,6,10],12),cp:[0,1,2,3]},re={co:[0,0,0,2],mp:x(12),wp:$([4,8,5],12),cp:[0,1,2,3]},ne={co:[2,0,0,0],mp:g([[1,9,11],[7,3,5]],12),wp:g([[1,9,11],[7,3,5]],12),cp:[0,2,3,1]},le={co:[0,2,0,0],mp:g([[0,7,2],[6,1,8]],12),wp:g([[0,7,2],[6,1,8]],12),cp:[3,1,0,2]},oe={co:[0,0,2,0],mp:g([[3,6,10],[9,0,4]],12),wp:g([[3,6,10],[9,0,4]],12),cp:[1,3,2,0]},ie={co:[0,0,0,2],mp:g([[4,8,5],[10,2,11]],12),wp:g([[4,8,5],[10,2,11]],12),cp:[2,0,1,3]},M=[ne,le,oe,ie,Z,ee,te,re],ae=["u","l","r","b","U","L","R","B"],y=8,j=4;function C(e,t){return e>=4&&t>=4?!0:e<4&&t<4?e===t:(e^t)===4}function fe(e){let t=["0","","'"];return e.map(([n,o])=>ae[n]+t[o]).join(" ")}function pe(){let e=Array(4);for(let o=0;o<4;o++)e[o]=w(3);let t=b(w(I(6)/2),6);for(let o=0,i=0;o<6;o++){let l=o===5?i:w(2);i^=l,t[o]+=l*6,t[o+6]=(t[o]+6)%12}let r=b(w(I(12)/2),12),n=b(w(I(4)/2),4);return{co:e,mp:t,wp:r,cp:n}}function ue(){return ce(pe())}function _e(e=!0,t=!1){let r=fe(ue());if(!e)return r;let n=["u","l","r","b"],o=["0","","'"];if(!t){for(let f=0;f<4;f++){let u=w(3);u!==0&&(r+=` ${n[f]}${o[u]}`)}return r.trim()}let i=[],l=[],a=[];for(let f=0;f<4;f++)i[f]=w(3),l[f]=w(3),a[f]=(i[f]-l[f]+3)%3;let p=f=>f.filter(u=>u!==0).length;for(;!(p(l)>=1&&p(a)>=1&&p(l)+p(a)>=4);)for(let f=0;f<4;f++)l[f]=w(3),a[f]=(i[f]-l[f]+3)%3;let _=l.map((f,u)=>f!==0?`${n[u]}${o[f]} `:"").join(""),c=a.map((f,u)=>f!==0?` ${n[u]}${o[f]}`:"").join("");return _+r+c}function ce(e){let t=se(e),r=[P(),T()],n=[ve(),de()],o=he(t),i,l=new Set,a=performance.now();for(let p=0;p<22;p++){let{value:_,done:c}=o.next(),f=e;for(let[S,k]of _)for(let A=0;A<k;A++)f=Y(f,M[S]);let u=JSON.stringify(f);if(l.has(u))continue;l.add(u);let m=we(f),O=i?i.length-_.length-1:999999,v=xe(m,r,n,O).next().value;if(v!==void 0&&((i===void 0||i.length>_.length+v.length)&&(i=_.concat(v)),performance.now()-a>300))break}return i}function me(e){return e[3^e.indexOf(3)]}function se(e){let t=d(N(e.mp),e.wp),r=(e.co.reduce((n,o)=>n+o)-me(e.cp)+3)%3;return[0,1,2,3,4,5].map(n=>n+6*t.indexOf(n)+72*t.indexOf(n+6)+864*r)}var D=[],U=[];for(let e=0;e<y;e++){let t=M[e];t.mp,D[e]=N(t.mp),t.wp,U[e]=N(t.wp)}var E=[0,0,0,0,2,2,2,2],R=[[14,-1,-1,11,11,10,9,8,8,7,7,6,4,5,5,3,4,4,2,3,4,3,-1,-1,0],[13,-1,-1,11,10,10,9,8,8,7,7,6,4,5,5,3,4,4,2,3,3,1,-1,-1,6]],L=new Int8Array(55);for(let e=0;e<25;e++)L[e]=R[0][e],L[e+30]=R[1][e];var h=new Int8Array(6*12*12*3);for(let e=0;e<6;e++)for(let t=0;t<12;t++)for(let r=0;r<12;r++){let n=e+6*t+72*r,o=2;t===e?o++:t===(e+6)%12&&o--,r===(e+6)%12?o++:r===e&&o--,h[n]=o,h[n+6*12*12]=h[n+2*6*12*12]=o+5}function*he(e){let t=0,r=J(),n=ge();for(;;)yield*F(...e,r,n,t,-1),t++}function*F(e,t,r,n,o,i,l,a,p,_){let c=y,f=h[e]+h[t]+h[r]+h[n]+h[o]+h[i],u=Math.max(a[e%864+t*864],a[r%864+t*864],a[o%864+t*864],a[e%864+n*864],a[r%864+n*864],a[o%864+n*864],a[e%864+i*864],a[r%864+i*864],a[o%864+i*864],a[e%864+r*864],a[e%864+o*864],a[r%864+o*864],a[t%864+n*864],a[t%864+i*864],a[n%864+i*864],L[f]);if(!(u>p)){if(p===0){yield[];return}if(!(u===0&&p===1))for(let m=0;m<c;m++){if(m===_||m<_&&C(m,_))continue;let O=e,v=t,S=r,k=n,A=o,q=i;for(let B=1;B<=2;B++){O=l[O][m],v=l[v][m],S=l[S][m],k=l[k][m],A=l[A][m],q=l[q][m];let K=F(O,v,S,k,A,q,l,a,p-1,m);for(;;){let{value:Q,done:W}=K.next();if(W)break;yield[[m,B]].concat(Q)}}}}}function we(e){let t=e.mp,r=V(t.slice(0,6).map(l=>l%6)),n=t.slice(0,5).map((l,a)=>(l>=6)*2**a).reduce((l,a)=>l+a),o=e.co.map((l,a)=>l*3**a).reduce((l,a)=>l+a),i=e.cp.indexOf(0);return[r+360*i,n+32*o]}var s={};function H(){if(s.phase1pm)return s.phase1pm;let e=Array(6*12*12).fill().map(()=>Array(y).fill(-1));for(let t=0;t<6;t++)for(let r=0;r<12;r++)for(let n=0;n<12;n++){if(r===n)continue;let o=t+6*r+72*n;for(let i=0;i<y;i++){let l=D[i][t],a=U[i][r],p=U[i][n];l<6?e[o][i]=l+6*a+72*p:e[o][i]=l-6+6*p+72*a}}return s.phase1pm=e}function J(){if(s.phase1pcm)return s.phase1pcm;let e=H(),t=Array(e.length*3).fill().map(()=>Array(y).fill(-1));for(let r=0;r<e.length;r++)for(let n=0;n<y;n++){let o=e[r][n];t[r][n]=o+6*12*12*E[n],t[r+6*12*12][n]=o+6*12*12*((E[n]+1)%3),t[r+2*6*12*12][n]=o+6*12*12*((E[n]+2)%3)}return s.phase1pcm=t}function ge(){if(s.phase1p2cp)return s.phase1p2cp;let e=H(),t=J(),r=new Int8Array((6*12*12)**2*3);r.fill(-1);let n=[0,1,2,3,4,5].map(i=>i+6*i+72*(i+6));for(let i=0;i<6;i++)for(let l=0;l<6;l++)i!==l&&(r[n[i]+864*n[l]]=0);let o=0;for(;;){let i=!1;for(let l=0;l<r.length;l++){if(r[l]!==o)continue;let a=l%864,p=Math.floor(l/864);for(let _=0;_<y;_++){let c=a,f=p;for(let u=1;u<=2;u++){c=e[c][_],f=t[f][_];let m=c+864*f;r[m]===-1&&(i=!0,r[m]=o+1)}}}if(!i)break;o++}return s.phase1p2cp=r}function P(){if(s.phase2pm)return s.phase2pm;let e=Array(1440).fill().map(()=>Array(j));for(let t=0;t<360;t++){let r=b(t,6);for(let n=0;n<6;n++)r[n+6]=r[n]+6;for(let n=0;n<j;n++){let o=d(r,M[n].mp),i=V(o.slice(0,6).map(l=>l%6));for(let l=0;l<4;l++){let a=M[n].cp[l];e[t+360*a][n]=i+360*l}}}return s.phase2pm=e}function T(){if(s.phase2om)return s.phase2om;let e=Array(32*81).fill().map(()=>Array(j));for(let t=0;t<32;t++){let r=[0,1,2,3,4].map(o=>t>>o&1);r[5]=r.reduce((o,i)=>o^i);let n=[];for(let o=0;o<6;o++)n[o]=o+6*r[o],n[o+6]=o+6*(r[o]^1);for(let o=0;o<81;o++){let i=[0,1,2,3].map(l=>Math.floor(o/3**l)%3);for(let l=0;l<j;l++){let p=d(n,M[l].mp).slice(0,5).map(u=>+(u>=6)),_=0;for(let u=0;u<5;u++)_+=p[u]<<u;let c=i.map((u,m)=>(u+M[l].co[m])%3),f=0;for(let u=0;u<4;u++)f+=c[u]*3**u;e[t+32*o][l]=_+32*f}}}return s.phase2om=e}function ve(){return s.phase2pp?s.phase2pp:s.phase2pp=z(P(),[0])}function de(){return s.phase2op?s.phase2op:s.phase2op=z(T(),[0])}function z(e,t){let r=e.length,n=e[0].length,o=Array(r).fill(-1),i=t.slice(),l=[],a=0;for(;i.length>0;){l.length=0;for(let p of i)if(o[p]===-1){o[p]=a;for(let _=0;_<n;_++){let c=e[p][_];for(;c!==p;)l.push(c),c=e[c][_]}}[i,l]=[l,i],a+=1}return o}function*xe(e,t,r,n){let o=e.length,i=0;for(let l=0;l<o;l++)i=Math.max(i,r[l][e[l]]);for(;i<=n;)yield*G(e,t,r,i,-1),i++}function*G(e,t,r,n,o){let i=e.length,l=t[0][0].length,a=0;for(let p=0;p<i;p++)a=Math.max(a,r[p][e[p]]);if(!(a>n)){if(n===0){yield[];return}if(!(a===0&&n===1))for(let p=0;p<l;p++){if(p===o||p<o&&C(p,o))continue;let _=e.slice();for(let f=0;f<i;f++)_[f]=t[f][e[f]][p];let c=1;for(;e.some((f,u)=>e[u]!==_[u]);){let f=G(_,t,r,n-1,p);for(;;){let{value:u,done:m}=f.next();if(m)break;yield[[p,c]].concat(u)}for(let u=0;u<i;u++)_[u]=t[u][_[u]][p];c++}}}}async function Me(){return _e(!1)}export{Me as randomMasterTetraminxScrambleString};
