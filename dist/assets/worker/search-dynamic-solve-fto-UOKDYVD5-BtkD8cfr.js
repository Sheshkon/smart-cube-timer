import{A as zr,a as qr}from "./inside-Y2UVJZNJ-Cu-MpFSH.js";import"../search-worker-entry-DNPX3OpU.js";var F=function(){for(var u=[1],P=0; P<32; ++P)u[P+1]=u[P]*(P+1);function S(a){for(var v=arguments.length-1,h=a[arguments[v]],c=v; c>1; c--)a[arguments[c]]=a[arguments[c-1]];return a[arguments[1]]=h,S}function L(a, v){return a[v>>3]>>((v&7)<<2)&15}function y(a, v, h, c){var l=0;if(c<0&&(v<<=1),h>=16){a[h-1]=0;for(var f=h-2; f>=0; f--){a[f]=v%(h-f),l^=a[f],v=~~(v/(h-f));for(var g=f+1; g<h; g--)a[g]>=a[f]&&a[g]++}if(c<0&&l&1){var p=a[h-1];a[h-1]=a[h-2],a[h-2]=p}return a}for(var m=1985229328,b=4275878552,f=0; f<h-1; f++){var N=u[h-1-f],w=v/N;if(v=v%N,l^=w,w<<=2,w>=32){w=w-32,a[f]=b>>w&15;var k=(1<<w)-1;b=(b&k)+(b>>4&~k)}else{a[f]=m>>w&15;var k=(1<<w)-1;m=(m&k)+(m>>>4&~k)+(b<<28),b=b>>4}}return c<0&&l&1?(a[h-1]=a[h-2],a[h-2]=m&15):a[h-1]=m&15,a}function U(a, v, h){v=v||a.length;var c=0;if(v>=16){for(var l=0; l<v-1; l++){c*=v-l;for(var f=l+1; f<v; f++)a[f]<a[l]&&c++}return h<0?c>>1:c}for(var g=1985229328,p=4275878552,l=0; l<v-1; l++){var m=a[l]<<2;c*=v-l,m>=32?(c+=p>>m-32&15,p-=286331152<<m-32):(c+=g>>m&15,p-=286331153,g-=286331152<<m)}return h<0?c>>1:c}function I(a, v){var h,c;for(c=0,h=v-2; h>=0; --h)c^=a%(v-h),a=~~(a/(v-h));return c&1}function H(a, v, h){for(var c=Math.abs(h),l=h<0?0:a[0]%c,f=v-1; f>0; f--)l=l*c+a[f]%c;return l}function D(a, v, h, c){for(var l=Math.abs(c),f=l*h,g=1; g<h; g++)a[g]=v%l,f-=a[g],v=~~(v/l);return a[0]=(c<0?f:v)%l,a}function tr(a){return a-=a>>1&1431655765,a=(a&858993459)+(a>>2&858993459),(a+(a>>4)&252645135)*16843009>>24}function lr(a, v, h, c){for(var l=-1,f=0,g=1,p=0; p<v; p++){var m=a[p];f=f*(v-p)+tr(l&(1<<c[m])-1)*g,g=g*h[m]--,l&=~(1<<c[m]+h[m])}return Math.round(f/g)}function vr(a, v, h, c, l){for(var f=0; f<h; f++)for(var g=0; g<c.length; g++)if(c[g]!=0){var p=~~(l*c[g]/(h-f));if(v<p){c[g]--,a[f]=g,l=p;break}v-=p}return a}function fr(a, v, h){if(this.length=v,this.evenbase=h,a=="p")this.get=function(m){return U(m,this.length,this.evenbase)},this.set=function(m, b){return y(m,b,this.length,this.evenbase)};else if(a=="o")this.get=function(m){return H(m,this.length,this.evenbase)},this.set=function(m, b){return D(m,b,this.length,this.evenbase)};else if(a=="c"){var c=h;this.cnts=c.slice(),this.cntn=this.cnts.length,this.cums=[0];for(var l=1; l<=this.cntn; l++)this.cums[l]=this.cums[l-1]+c[l-1];this.n=this.cums[this.cntn];for(var f=this.n,g=1,l=0; l<this.cntn; l++)for(var p=1; p<=c[l]; p++,f--)g*=f/p;this.x=Math.round(g),this.get=function(m){return lr(m,this.n,this.cnts.slice(),this.cums)},this.set=function(m, b){return vr(m,b,this.n,this.cnts.slice(),this.x)}}else debugger}function br(a, v, h, c, l){for(var f=0; f<a.length; f++){var g=a[f],p=h[f]===void 0?f:h[f];if(typeof g=="number"){v[g]=~~(a[p]/l);continue}for(var m=c[f]||0,b=0; b<g.length; b++)v[g[(b+m)%g.length]]=~~(a[p][b]/l)}}function z(a, v, h, c, l){for(var f=0; f<a.length; f++){var g=a[f].length;r:for(var p=0; p<a.length+1; p++){if(p==a.length)return-1;if(a[p].length!=g)continue;for(var m=0; m<g; m++){for(var b=!0,N=0; N<g; N++)if(~~(a[p][N]/l)!=v[a[f][(N+m)%g]]){b=!1;break}if(b){h[f]=p,c[f]=m;break r}}}}return 0}function sr(a, v, h, c){var l=[a],f={};f[h(a)]=0;for(var g=[],p=0; p<v.length; p++)g[p]=[];for(var m=0; m<l.length; m++)for(var b=l[m],p=0; p<v.length; p++){var N=c(b,v[p]);if(!N){g[p][m]=-1;continue}var w=h(N);w in f||(f[w]=l.length,l.push(N)),g[p][m]=f[w]}return[g,f]}function cr(a, v, h, c, l, f, g, p){var m=Array.isArray(l);f=f||6,g=g||3,p=p||256,c=c||256;for(var b=0,N=h+7>>>3; b<N; b++)a[b]=-1;Array.isArray(v)||(v=[v]);for(var b=0; b<v.length; b++)a[v[b]>>3]^=15<<((v[b]&7)<<2);for(var w=0,k=0; k<=c; k++){var G=0,K=k>=p,W=k+1^15,Y=K?15:k,ur=K?k:15;r:for(var J=0; J<h; J++,w>>=4){if(!(J&7)&&(w=a[J>>3],!K&&w==-1)){J+=7;continue}if((w&15)==Y){for(var Z=0; Z<f; Z++)for(var Q=J,rr=0; rr<g&&(Q=m?l[Z][Q]:l(Q,Z),!(Q<0)); rr++)if(L(a,Q)==ur){if(++G,K){a[J>>3]^=W<<((J&7)<<2);continue r}a[Q>>3]^=W<<((Q&7)<<2)}}}if(G==0)break}}function nr(a, v, h, c, l, f){this.isSolved=a||function(){return!0},this.getPrun=v,this.doMove=h,this.N_AXIS=c,this.N_POWER=l,this.ckmv=f||ar(c,function(g){return 1<<g})}var j=nr.prototype;j.solve=function(a, v, h, c){var l=this.solveMulti([a],v,h,c);return l==null?null:l[0]},j.solveMulti=function(a, v, h, c){this.callback=c||function(){return!0};var l=[];r:for(var f=v; f<=h; f++){for(var g=0; g<a.length; g++)if(this.sidx=g,this.idaSearch(a[g],f,-1,l)==0)break r;this.sidx=-1}return this.sidx==-1?null:[l,this.sidx]},j.idaSearch=function(a, v, h, c){var l=this.getPrun(a);if(l>v)return l>v+1?2:1;if(v==0)return this.isSolved(a)&&this.callback(c,this.sidx)?0:1;if(l==0&&this.isSolved(a)&&v==1)return 1;for(var f=0; f<this.N_AXIS; f++)if(!(this.ckmv[h]>>f&1))for(var g=Array.isArray(a)?a.slice():a,p=0; p<this.N_POWER&&(g=this.doMove(g,f),g!=null); p++){c.push([f,p]);var m=this.idaSearch(g,v-1,f,c);if(m==0)return 0;if(c.pop(),m==2)break}return 1};function x(a){return qr(a)}function hr(a, v){for(var h=0,c=[],l=0; l<a; l++)c[l]=l;for(var l=0; l<a-1; l++){var f=x(a-l);S(c,l,l+f),h^=f!=0}return v&&h&&S(c,0,1),c}function ar(a, v){for(var h=[],c=typeof v=="function",l=0; l<a; l++)h[l]=c?v(l):v;return h}function Cr(a, v, h, c, l, f, g){for(var p=0; p<v.length; p++)g&&(f[p]=(c[v[p]]+l[p])%g),h[p]=a[v[p]]}return{bitCount:tr,getPruning:L,setNOri:D,getNOri:H,getNPerm:U,getNParity:I,Coord:fr,createMoveHash:sr,createPrun:cr,fillFacelet:br,detectFacelet:z,rn:x,valuedArray:ar,Searcher:nr,rndPerm:hr,permOriMult:Cr}}(),Er=function(){function u(t, e, n, r, o){this.cp=t&&t.slice()||[0,1,2,3,4,5],this.co=e&&e.slice()||[0,0,0,0,0,0],this.ep=n&&n.slice()||[0,1,2,3,4,5,6,7,8,9,10,11],this.uf=r&&r.slice()||[0,1,2,3,4,5,6,7,8,9,10,11],this.rl=o&&o.slice()||[0,1,2,3,4,5,6,7,8,9,10,11]}var P=0,S=9,L=18,y=27,U=36,I=45,H=54,D=63,tr=[[P+0,H+0,S+0,D+0],[P+4,I+8,L+4,H+8],[P+8,D+4,y+8,I+4],[y+0,U+0,L+0,I+0],[S+4,U+8,y+4,D+8],[L+8,U+4,S+8,H+4]],lr=[[P+1,H+3],[P+3,D+1],[P+6,I+6],[y+1,U+3],[L+3,U+1],[S+6,U+6],[S+3,H+1],[S+1,D+3],[y+6,D+6],[y+3,I+1],[L+1,I+3],[L+6,H+6]],vr=[P+2,P+5,P+7,S+2,S+5,S+7,L+2,L+5,L+7,y+2,y+5,y+7],fr=[U+2,U+5,U+7,I+2,I+5,I+7,D+2,D+5,D+7,H+2,H+5,H+7];u.prototype.isEqual=function(t){for(var e=0; e<12; e++)if(this.ep[e]!=t.ep[e]||this.uf[e]!=t.uf[e]||this.rl[e]!=t.rl[e]||e<6&&(this.cp[e]!=t.cp[e]||this.co[e]!=t.co[e]))return!1;return!0},u.prototype.toFaceCube=function(t){var e=[];t=t||9;for(var n=[],r=0; r<6; r++)n[r]=this.co[r]*2;return F.fillFacelet(tr,e,this.cp,n,t),F.fillFacelet(lr,e,this.ep,[],t),F.fillFacelet(vr,e,this.uf,null,t),F.fillFacelet(fr,e,this.rl,null,t),e},u.prototype.fromFacelet=function(t){for(var e=0,n=[],r=0; r<72; ++r)n[r]=t[r],e+=Math.pow(16,n[r]);if(e!=2576980377)return-1;var o=[];if(F.detectFacelet(tr,n,this.cp,o,9)==-1||F.detectFacelet(lr,n,this.ep,[],9)==-1)return-1;for(var i=0,r=0; r<6; r++)this.co[r]=o[r]>>1,i^=this.co[r];if(i!=0||F.getNParity(F.getNPerm(this.cp,6),6)!=0||F.getNParity(F.getNPerm(this.ep,12),12)!=0)return-1;for(var s=[3,3,3,3],r=0; r<12; r++){var M=n[vr[r]];if(!(s[M]>0))return-1;this.uf[r]=M*3+3-s[M],s[M]--}s=[3,3,3,3];for(var r=0; r<12; r++){var M=[0,1,3,2][n[fr[r]]-4];if(!(s[M]>0))return-1;this.rl[r]=M*3+3-s[M],s[M]--}if(F.getNParity(F.getNPerm(this.uf,12),12)!=0)for(var r=0; r<12; r++)this.uf[r]^=this.uf[r]<2?1:0;if(F.getNParity(F.getNPerm(this.rl,12),12)!=0)for(var r=0; r<12; r++)this.rl[r]^=this.rl[r]<2?1:0;return this},u.prototype.toString=function(t){var e=this.toFaceCube(t),n=`  U8 U7 U6 U5 U4      B8 B7 B6 B5 B4
L4   U3 U2 U1   R8  r4   B3 B2 B1   l8
L5 L1   U0   R3 R7  r5 r1   B0   l3 l7
L6 L2 L0  R0 R2 R6  r6 r2 r0  l0 l2 l6
L7 L3   F0   R1 R5  r7 r3   D0   l1 l5
L8   F1 F2 F3   R4  r8   D1 D2 D3   l4
  F4 F5 F6 F7 F8      D4 D5 D6 D7 D8`;return n=n.replace(/([UFrlDBRL])([0-8])/g,function(r,o,i){var s="UFrlDBRL".indexOf(o)*9+~~i;return"UFrlDBRL"[~~(e[s]/9)]+e[s]%9}),n},u.FtoMult=function(){for(var t=arguments[arguments.length-1]||new u,e=0;e<arguments.length;e++){for(var n=arguments[arguments.length-1-e],r=0;r<6;r++)t.co[r]=e==0?0:n.co[t.cp[r]]^t.co[r],t.cp[r]=e==0?r:n.cp[t.cp[r]];for(var r=0;r<12;r++)t.ep[r]=e==0?r:n.ep[t.ep[r]],t.uf[r]=e==0?r:n.uf[t.uf[r]],t.rl[r]=e==0?r:n.rl[t.rl[r]]}return t};function br(){var t=new u([1,2,0,4,5,3],[0,0,0,0,0,0],[2,0,1,5,3,4,10,11,6,7,8,9],[1,2,0,7,8,6,10,11,9,4,5,3],[2,0,1,8,6,7,11,9,10,5,3,4]),e=new u([5,0,4,2,3,1],[1,1,0,1,1,0],[6,5,7,9,2,10,11,4,3,8,1,0],[5,3,4,8,6,7,2,0,1,11,9,10],[4,5,3,7,8,6,1,2,0,10,11,9]),n=u.FtoMult(t,t,null),r=u.FtoMult(e,e,null),o=u.FtoMult(n,e,t,null),i=u.FtoMult(e,t,r,null),s=[];s[0]=new u([1,2,0,3,4,5],[0,0,0,0,0,0],[2,0,1,3,4,5,6,7,8,9,10,11],[1,2,0,3,4,5,6,7,8,9,10,11],[0,1,2,3,6,7,11,9,8,5,10,4]),s[2]=new u([4,1,2,3,5,0],[1,0,0,0,1,0],[0,1,2,3,4,6,7,5,8,9,10,11],[0,1,2,4,5,3,6,7,8,9,10,11],[0,9,10,3,4,5,2,7,1,8,6,11]),s[4]=new u([0,5,2,1,4,3],[0,1,0,0,0,1],[0,1,2,3,10,5,6,7,8,9,11,4],[0,1,2,3,4,5,7,8,6,9,10,11],[5,3,2,11,4,10,6,7,8,9,0,1]),s[6]=new u([0,1,3,4,2,5],[0,0,1,1,0,0],[0,1,2,8,4,5,6,7,9,3,10,11],[0,1,2,3,4,5,6,7,8,10,11,9],[8,1,7,2,0,5,6,3,4,9,10,11]),s[8]=new u([0,1,2,5,3,4],[0,0,0,0,0,0],[0,1,2,4,5,3,6,7,8,9,10,11],[0,1,2,3,9,10,5,7,4,8,6,11],[1,2,0,3,4,5,6,7,8,9,10,11]),s[10]=new u([0,3,1,2,4,5],[0,1,1,0,0,0],[0,1,10,3,4,5,6,7,8,2,9,11],[0,6,7,3,4,5,11,9,8,2,10,1],[0,1,2,4,5,3,6,7,8,9,10,11]),s[12]=new u([5,0,2,3,4,1],[1,1,0,0,0,0],[6,1,2,3,4,5,11,7,8,9,10,0],[5,3,2,8,4,7,6,0,1,9,10,11],[0,1,2,3,4,5,6,7,8,10,11,9]),s[14]=new u([2,1,4,3,0,5],[1,0,1,0,0,0],[0,8,2,3,4,5,6,1,7,9,10,11],[11,1,10,2,0,5,6,7,8,9,3,4],[0,1,2,3,4,5,7,8,6,9,10,11]),s[16]=u.FtoMult(t,s[8],null),s[18]=u.FtoMult(i,s[10],null),s[20]=u.FtoMult(e,s[6],null),s[22]=u.FtoMult(o,s[4],null);for(var M=1;M<24;M+=2)s[M]=new u,u.FtoMult(s[M-1],s[M-1],s[M]);for(var A=[],M=0;M<24;M++)A[M]=s[M].ep.join(",");var _=[],C=[],T=[],$=[],q=[],B=new u;new u;for(var R=0;R<12;R++)_[R]=new u(B.cp,B.co,B.ep,B.uf,B.rl),q[R]=_[R].ep.join(","),C[R]=[],T[R]=[],B=u.FtoMult(B,t,null),R%3==2&&(B=u.FtoMult(B,e,t,null)),R%6==5&&(B=u.FtoMult(B,t,e,null));for(var M=0;M<12;M++)for(var O=0;O<12;O++){u.FtoMult(_[M],_[O],B);var V=q.indexOf(B.ep.join(","));C[M][O]=V,T[V][O]=M}for(var R=0;R<12;R++){$[R]=[];for(var O=0;O<8;O++){u.FtoMult(_[T[0][R]],s[O*2],_[R],B);var V=A.indexOf(B.ep.join(","));$[R][O]=V>>1}}u.moveCube=s,u.symCube=_,u.symMult=C,u.symMulI=T,u.symMulM=$}br();function z(t,e,n){for(var r=[],o=u.moveCube[n][t],i=0;i<12;i++)r[i]=e[o[i]];return r}function sr(t,e){return u.FtoMult(t,u.moveCube[e],null)}function cr(t){for(var e=0,n=-1,r=0;r<12;r++)56>>t[r]&1&&(n==-1&&(n=t[r]),e+=(t[r]-n+3)%3+1<<r*2);return e}function nr(t){for(var e=0,n=0;n<12;n++)t[n]<3&&(e|=1<<n);return e}function j(t){for(var e=[0,1,2,3,3,3,0,1,1,2,2,0],n=[[0,6,11],[1,7,8],[2,9,10],[3,4,5]],r=0,o=[-1,-1,-1,-1],i=0;i<12;i++){var s=e[t[i]],M=n[s].indexOf(t[i]);o[s]==-1&&(o[s]=M),r+=(s*4+(M-o[s]+3)%3)*Math.pow(16,i)}return r}function x(t){for(var e=0,n=0;n<12;n++)e|=~~(t[n]/3)<<n*2;return e}function hr(t){return String.fromCharCode.apply(null,t)}function ar(t){return String.fromCharCode.apply(null,[].concat(t.cp,t.co))}function Cr(t,e){for(var n=[],r=0;r<e;r++)n.push(t[~~(Math.random()*t.length)]);for(var o=new u,r=0;r<n.length;r++)o=u.FtoMult(o,u.moveCube[n[r]],null);return[o,n]}function a(t){for(var e=[],n=new u,r=new u,o=0;o<t.length;o++){e[o]=1<<o;for(var i=0;i<o;i++)u.FtoMult(u.moveCube[t[o]],u.moveCube[t[i]],n),u.FtoMult(u.moveCube[t[i]],u.moveCube[t[o]],r),n.isEqual(r)&&(e[o]|=1<<i)}return e}for(var v=[0,2,22,6,16,10,12,14],h=null,c=null,l=null,f=null,g=[],p=0;p<12;p++)g.push(new u(u.symCube[p].cp,u.symCube[p].co,null,u.symCube[p].uf,null));function m(){var t=new u;h=F.createMoveHash(t.ep.slice(),v,cr,z.bind(null,"ep")),c=F.createMoveHash(t.rl.slice(),v,nr,z.bind(null,"rl"));var e=h[0][0].length,n=c[0][0].length;l=a(v);var r=[];F.createPrun(r,0,e*n,14,function(o,i){var s=~~(o/e),M=o%e;return c[0][i][s]*e+h[0][i][M]},v.length,2),f=new F.Searcher(null,function(o){return F.getPruning(r,o[1]*e+o[0])},function(o,i){return[h[0][i][o[0]],c[0][i][o[1]]]},8,2,l)}function b(t){for(var e=[],n=[],r=new u,o=new u,i=0;i<12;i+=3){u.FtoMult(u.symCube[i%12],t,r);var s;for(s=0;s<12&&(u.FtoMult(r,u.symCube[s],o),o.ep[4]!=4);s++);e.push([h[1][cr(o.ep)],c[1][nr(o.rl)]]),n.push([i,s])}return[e,n]}function N(t,e,n){for(var r=0;r<t.length;r++)t[r]=v[t[r][0]]+t[r][1];for(var o=Jr(t),r=0;r<o[0].length;r++){var i=o[0][r];t[r]=u.symMulM[u.symMulI[0][e[1]]][i>>1]*2+(i&1),n=u.FtoMult(n,u.moveCube[t[r]],null)}return e[1]=u.symMulI[e[1]][o[1]],n=u.FtoMult(g[~~(e[0]/12)],u.symCube[e[0]%12],n,u.symCube[e[1]],null),[n,t,e[0],e[1]]}var w=1e3;function k(t){f||m();var e=performance.now(),n=b(t),r=n[1];n=n[0];var o=[];f.solveMulti(n,0,12,function(s,M){var A=N(s.slice(),r[M].slice(),t);return o.push(A),o.length>=w}),e=performance.now()-e;for(var i=0;i<o.length;i++)o[i].push(e);return o}var G=[0,12,14,8,10],K=null,W=null,Y=null,ur={},J=null,Z=null,Q=11,rr=[],ir=[],yr=[],gr=new F.Coord("c",12,[3,3,3,3]),Tr=[[P+2,H+2,S+2,D+2],[P+5,I+7,L+5,H+7],[P+7,D+5,y+7,I+5],[y+2,U+2,L+2,I+2],[S+5,U+7,y+5,D+7],[L+7,U+5,S+7,H+5]];function dr(t){var e=String.fromCharCode.apply(null,[].concat(t.cp,t.co));if(!(e in ur)){for(var n=[],r=0;r<6;r++)n[r]=t.co[r]*2;var o=t.toFaceCube();F.fillFacelet(Tr,o,t.cp,n,9);var i=new u().fromFacelet(o);ur[e]=x(i.uf)}return e}function Lr(t,e){for(var n=t[0],r=-1,o=1;o<12;o++)if(t[o]!=n){r=t[o];break}for(var i=e[n*4+r],o=0;o<12;o++)t[o]=~~(u.symCube[i].uf[t[o]*3]/3);return i}function _r(t){for(var e=[],n=0;n<12;n++)e[n]=~~(t[n]/3);var r=Lr(e,rr);return yr[gr.get(e)]<<4|r}function Ar(){var t=new u;K=F.createMoveHash(t.ep.slice(),G,j,z.bind(null,"ep")),W=F.createMoveHash(t.rl.slice(),G,x,z.bind(null,"rl")),Y=F.createMoveHash(t,G,dr,sr);for(var e=[],n=[],r=[[],[],[],[],[]],o=[],i=[],s=0;s<12;s++){var M=u.symCube[s].uf,A=~~(M.indexOf(0)/3),_=~~(M.indexOf(3)/3);rr[A*4+_]=s,i[s]=[]}r:for(var C=0;C<42e3;C++){gr.set(e,C);for(var T=1;T<12;T++){if(e[T]>1)continue r;if(e[T]==1)break}yr[C]=ir.length,ir.push(C)}for(var C=0;C<ir.length;C++){gr.set(e,ir[C]);for(var $=0,T=0;T<12;T++)$|=e[T]<<T*2;o[C]=$;for(var q=0;q<G.length;q++){F.permOriMult(e,u.moveCube[G[q]].uf,n);var B=Lr(n,rr);r[q][C]=yr[gr.get(n)]<<4|B}}var R=[];for(var O in Y[1]){var V=Y[1][O];R[V]=ur[O];for(var Rr=[],s=0;s<12;s++){for(var Or=u.symCube[s],C=0;C<6;C++){var Ir=O.charCodeAt(C);Rr[C]=Or.cp[Ir],Rr[C+6]=Or.co[Ir]^O.charCodeAt(C+6)}var $=String.fromCharCode.apply(null,Rr);i[s][V]=Y[1][$]}}var Zr=[0,0,3,4,5,6,8,0,2,3,4,5,6,8,1,2,4,4,5,6,8,1,3,4,5,6,7,8,3,3,4,5,6,7,9,4,4,5,6,7,8,9,5,5,6,7,8,9,10],or=K[0][0].length,$r=W[0][0].length,kr=[];F.createPrun(kr,0,or*$r,Q-2,function(d,X){var er=~~(d/or),Sr=d%or;return W[0][X][er]*or+K[0][X][Sr]},G.length,2),J=a(G),Z=new F.Searcher(function(d){return o[d[3]>>4]==R[i[d[3]&15][d[2]]]},function(d){var X=o[d[3]>>4]^R[i[d[3]&15][d[2]]];X=(X|X>>1)&5592405;var er=F.bitCount(X&12632319)*7+F.bitCount(X&4144896);return Math.max(Math.min(Q,F.getPruning(kr,d[1]*or+d[0])),Zr[er])},function(d,X){var er=r[X][d[3]>>4],Sr=u.symMult[er&15][d[3]&15];return[K[0][X][d[0]],W[0][X][d[1]],Y[0][X][d[2]],er&-16|Sr]},G.length,2,J)}function Xr(t){Z||Ar();for(var e=performance.now(),n=[],r=0;r<t.length;r++)n.push([K[1][j(t[r][0].ep)],W[1][x(t[r][0].rl)],Y[1][dr(t[r][0])],_r(t[r][0].uf)]);for(var o=Z.solveMulti(n,0,25),i=o[0],s=o[1],M=t[s],A=M[0],r=0;r<i.length;r++){var _=G[i[r][0]]+i[r][1];i[r]=u.symMulM[u.symMulI[0][M[3]]][_>>1]*2+(_&1),A=u.FtoMult(A,u.moveCube[_],null)}return[A,i,M[2],M[3],s,performance.now()-e]}var pr=[8,10,12,14],Mr=null,mr=null,Fr=null,Pr=null,Br=null,Ur=null;function Hr(){var t=new u;Mr=F.createMoveHash(t.ep.slice(),pr,hr,z.bind(null,"ep")),mr=F.createMoveHash(new u,pr,ar,sr),Fr=[],Pr=[],F.createPrun(Fr,0,81,14,Mr[0],4,2),F.createPrun(Pr,0,11520,14,mr[0],4,2),Br=a(pr),Ur=new F.Searcher(null,function(e){return Math.max(F.getPruning(Fr,e[0]),F.getPruning(Pr,e[1]))},function(e,n){return[Mr[0][n][e[0]],mr[0][n][e[1]]]},4,2,Br)}function Gr(t){var e=t[0];Fr||Hr();for(var n=performance.now(),r=Mr[1][hr(e.ep)],o=mr[1][ar(e)],i=Ur.solve([r,o],0,25),s=0;s<i.length;s++){var M=pr[i[s][0]]+i[s][1];i[s]=u.symMulM[u.symMulI[0][t[3]]][M>>1]*2+(M&1),e=u.FtoMult(e,u.moveCube[M],null)}return[e,i,t[2],t[3],performance.now()-n]}function Jr(t){for(var e=0,n=[],r=[4,5,3,2],o=[1,10,5,11],i=0;i<t.length;i++){var s=0,M=t[i]>>1,A=t[i]&1;M>=8&&(s=o[M-8],M=r[M-8]),A||(s=u.symMult[s][s]),n.push(u.symMulM[e][M]*2+A),e=u.symMult[s][e]}return[n,e]}function wr(t,e){for(var n=0;n<e.length;n++)t=u.FtoMult(t,u.moveCube[e[n]],null);return t}var Kr=["U","U'","F","F'","r","r'","l","l'","D","D'","B","B'","R","R'","L","L'"];function Dr(t){for(var e=[],n=0;n<t.length;n++)e[n]=Kr[t[n]];return e.join(" ").replace(/l/g,"BL").replace(/r/g,"BR")}function Nr(){}Nr.prototype.solveFto=function(t,e){f||(performance.now(),m(),Ar(),Hr());var n=k(t),r=Xr(n),o=n[r[4]];this.sol1=o[1].slice(),this.tt1=o[4];var i=o[2];this.sol2=r[1].slice(),this.tt2=r[5],r[0]=u.FtoMult(g[u.symMulI[0][~~(i/12)]],r[0],null);var s=Gr(r);this.sol3=s[1].slice(),this.tt3=s[4];var M=[].concat(this.sol1,this.sol2,this.sol3);if(e){for(var A=0;A<M.length;A++)M[A]^=1;M.reverse()}return Dr(M)};var E=new Nr;function Qr(t){var e=Cr([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],t);Dr(e[1].slice()),E.solveFto(e[0]);var n=e[0];n=wr(n,E.sol1),n=wr(n,E.sol2),n=wr(n,E.sol3);var r=n.toFaceCube(),o=!0;r:for(var i=0;i<8;i++)for(var s=1;s<9;s++)if(r[i*9+s]!=r[i*9]){o=!1;break r}return o||console.log("error, FTO not solved!!!"),[E.sol1.length+E.sol2.length+E.sol3.length,E.sol1.length,E.sol2.length,E.sol3.length,E.tt1,E.tt2,E.tt3]}function Wr(t){t=t||100;for(var e=[],n=0;n<t;n++){for(var r=Qr(200),o=0;o<r.length;o++)e[o]=(e[o]||0)+r[o];console.log("AvgL: ",e[0]/(n+1))}console.log("AvgL1:",e[1]/t),console.log("AvgL2:",e[2]/t),console.log("AvgL3:",e[3]/t),console.log("AvgT1:",e[4]/t),console.log("AvgT2:",e[5]/t),console.log("AvgT3:",e[6]/t)}function Yr(t,e){var n=new u;return n.fromFacelet(t)==-1?"FTO Solver ERROR!":E.solveFto(n,e)}return{solveFacelet:Yr,FtoCubie:u,testbench:Wr}}(),Vr=function(){function u(P,S,L){var y=new Er.FtoCubie;return P||(y.ep=F.rndPerm(12,!0)),S||(y.uf=F.rndPerm(12,!0),y.rl=F.rndPerm(12,!0)),L||(y.cp=F.rndPerm(6,!0),F.setNOri(y.co,F.rn(32),6,-2)),new zr(Er.solveFacelet(y.toFaceCube(),!0))}return{getRandomScramble:u.bind(null,!1,!1,!1)}}();function re(){return Vr.getRandomScramble()}export{re as getRandomFTOScramble};
