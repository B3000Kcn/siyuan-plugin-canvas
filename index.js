"use strict";var vt=Object.defineProperty;var Dt=(n,e,t)=>e in n?vt(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var le=(n,e,t)=>Dt(n,typeof e!="symbol"?e+"":e,t);const Ae=require("siyuan");function Y(){}function at(n){return n()}function Je(){return Object.create(null)}function ae(n){n.forEach(at)}function ut(n){return typeof n=="function"}function Se(n,e){return n!=n?e==e:n!==e||n&&typeof n=="object"||typeof n=="function"}function It(n){return Object.keys(n).length===0}function dt(n,...e){if(n==null){for(const o of e)o(void 0);return Y}const t=n.subscribe(...e);return t.unsubscribe?()=>t.unsubscribe():t}function R(n){let e;return dt(n,t=>e=t)(),e}function ft(n,e,t){n.$$.on_destroy.push(dt(e,t))}const Ct=typeof window<"u"?window:typeof globalThis<"u"?globalThis:global;function h(n,e){n.appendChild(e)}function H(n,e,t){n.insertBefore(e,t||null)}function U(n){n.parentNode&&n.parentNode.removeChild(n)}function y(n){return document.createElement(n)}function ce(n){return document.createTextNode(n)}function $(){return ce(" ")}function Te(){return ce("")}function Q(n,e,t,o){return n.addEventListener(e,t,o),()=>n.removeEventListener(e,t,o)}function g(n,e,t){t==null?n.removeAttribute(e):n.getAttribute(e)!==t&&n.setAttribute(e,t)}function Et(n){return Array.from(n.childNodes)}function Pe(n,e){e=""+e,n.data!==e&&(n.data=e)}function ee(n,e){n.value=e??""}let ke;function _e(n){ke=n}function ht(){if(!ke)throw new Error("Function called outside component initialization");return ke}function gt(n){ht().$$.on_mount.push(n)}function St(n){ht().$$.on_destroy.push(n)}const pe=[],$e=[];let we=[];const ze=[],pt=Promise.resolve();let xe=!1;function mt(){xe||(xe=!0,pt.then(wt))}function fe(){return mt(),pt}function Ne(n){we.push(n)}const Be=new Set;let he=0;function wt(){if(he!==0)return;const n=ke;do{try{for(;he<pe.length;){const e=pe[he];he++,_e(e),Ft(e.$$)}}catch(e){throw pe.length=0,he=0,e}for(_e(null),pe.length=0,he=0;$e.length;)$e.pop()();for(let e=0;e<we.length;e+=1){const t=we[e];Be.has(t)||(Be.add(t),t())}we.length=0}while(pe.length);for(;ze.length;)ze.pop()();xe=!1,Be.clear(),_e(n)}function Ft(n){if(n.fragment!==null){n.update(),ae(n.before_update);const e=n.dirty;n.dirty=[-1],n.fragment&&n.fragment.p(n.ctx,e),n.after_update.forEach(Ne)}}function At(n){const e=[],t=[];we.forEach(o=>n.indexOf(o)===-1?e.push(o):t.push(o)),t.forEach(o=>o()),we=e}const De=new Set;let Bt;function Le(n,e){n&&n.i&&(De.delete(n),n.i(e))}function Tt(n,e,t,o){if(n&&n.o){if(De.has(n))return;De.add(n),Bt.c.push(()=>{De.delete(n)}),n.o(e)}}function me(n){return(n==null?void 0:n.length)!==void 0?n:Array.from(n)}function Re(n,e){n.d(1),e.delete(n.key)}function Oe(n,e,t,o,r,s,l,i,u,c,b,p){let C=n.length,w=s.length,f=C;const x={};for(;f--;)x[n[f].key]=f;const O=[],X=new Map,N=new Map,G=[];for(f=w;f--;){const D=p(r,s,f),M=t(D);let A=l.get(M);A?G.push(()=>A.p(D,e)):(A=c(M,D),A.c()),X.set(M,O[f]=A),M in x&&N.set(M,Math.abs(f-x[M]))}const L=new Set,S=new Set;function V(D){Le(D,1),D.m(i,b),l.set(D.key,D),b=D.first,w--}for(;C&&w;){const D=O[w-1],M=n[C-1],A=D.key,j=M.key;D===M?(b=D.first,C--,w--):X.has(j)?!l.has(A)||L.has(A)?V(D):S.has(j)?C--:N.get(A)>N.get(j)?(S.add(A),V(D)):(L.add(j),C--):(u(M,l),C--)}for(;C--;){const D=n[C];X.has(D.key)||u(D,l)}for(;w;)V(O[w-1]);return ae(G),O}function $t(n){n&&n.c()}function bt(n,e,t){const{fragment:o,after_update:r}=n.$$;o&&o.m(e,t),Ne(()=>{const s=n.$$.on_mount.map(at).filter(ut);n.$$.on_destroy?n.$$.on_destroy.push(...s):ae(s),n.$$.on_mount=[]}),r.forEach(Ne)}function yt(n,e){const t=n.$$;t.fragment!==null&&(At(t.after_update),ae(t.on_destroy),t.fragment&&t.fragment.d(e),t.on_destroy=t.fragment=null,t.ctx=[])}function xt(n,e){n.$$.dirty[0]===-1&&(pe.push(n),mt(),n.$$.dirty.fill(0)),n.$$.dirty[e/31|0]|=1<<e%31}function qe(n,e,t,o,r,s,l=null,i=[-1]){const u=ke;_e(n);const c=n.$$={fragment:null,ctx:[],props:s,update:Y,not_equal:r,bound:Je(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(u?u.$$.context:[])),callbacks:Je(),dirty:i,skip_bound:!1,root:e.target||u.$$.root};l&&l(c.root);let b=!1;if(c.ctx=t?t(n,e.props||{},(p,C,...w)=>{const f=w.length?w[0]:C;return c.ctx&&r(c.ctx[p],c.ctx[p]=f)&&(!c.skip_bound&&c.bound[p]&&c.bound[p](f),b&&xt(n,p)),C}):[],c.update(),b=!0,ae(c.before_update),c.fragment=o?o(c.ctx):!1,e.target){if(e.hydrate){const p=Et(e.target);c.fragment&&c.fragment.l(p),p.forEach(U)}else c.fragment&&c.fragment.c();e.intro&&Le(n.$$.fragment),bt(n,e.target,e.anchor),wt()}_e(u)}class Ue{constructor(){le(this,"$$");le(this,"$$set")}$destroy(){yt(this,1),this.$destroy=Y}$on(e,t){if(!ut(t))return Y;const o=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return o.push(t),()=>{const r=o.indexOf(t);r!==-1&&o.splice(r,1)}}$set(e){this.$$set&&!It(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const Nt="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(Nt);const ge=[];function be(n,e=Y){let t;const o=new Set;function r(i){if(Se(n,i)&&(n=i,t)){const u=!ge.length;for(const c of o)c[1](),ge.push(c,n);if(u){for(let c=0;c<ge.length;c+=2)ge[c][0](ge[c+1]);ge.length=0}}}function s(i){r(i(n))}function l(i,u=Y){const c=[i,u];return o.add(c),o.size===1&&(t=e(r,s)||Y),i(n),()=>{o.delete(c),o.size===0&&t&&(t(),t=null)}}return{set:r,update:s,subscribe:l}}const Ee=be({apiKey:"",modelName:"deepseek-chat"}),Me=be([]),Ie=be(null),Ce=be(null),se=be([]);async function Rt(n){const e=R(Ee);if(!e.apiKey||!e.apiUrl)throw new Error("API Key 或 API URL 未配置");const t=await fetch(e.apiUrl,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e.apiKey}`},body:JSON.stringify({model:e.modelName||"deepseek-chat",messages:n,temperature:e.temperature||.7,max_tokens:e.maxTokens||2e3})});if(!t.ok){const r=await t.text();throw new Error(`API 请求失败: ${t.status} ${r}`)}const o=await t.json();if(!o.choices||o.choices.length===0)throw new Error("API 返回数据格式错误");return o.choices[0].message.content}function oe(n){return window.Lute.New().Md2HTML(n)}function Ge(n,e,t){const o=n.slice();return o[3]=e[t],o}function We(n){let e,t,o,r,s=[],l=new Map,i=me(n[0]);const u=c=>c[3].id;for(let c=0;c<i.length;c+=1){let b=Ge(n,i,c),p=u(b);l.set(p,s[c]=Ye(p,b))}return{c(){e=y("div"),t=y("span"),t.textContent="引用内容:",o=$(),r=y("div");for(let c=0;c<s.length;c+=1)s[c].c();g(t,"class","svelte-m85l6"),g(r,"class","reference-tags svelte-m85l6"),g(e,"class","reference-context-bar svelte-m85l6")},m(c,b){H(c,e,b),h(e,t),h(e,o),h(e,r);for(let p=0;p<s.length;p+=1)s[p]&&s[p].m(r,null)},p(c,b){b&3&&(i=me(c[0]),s=Oe(s,b,u,1,c,i,l,r,Re,Ye,null,Ge))},d(c){c&&U(e);for(let b=0;b<s.length;b+=1)s[b].d()}}}function Qe(n){let e,t,o;function r(){return n[2](n[3])}return{c(){e=y("button"),e.textContent="×",g(e,"class","remove-tag-button svelte-m85l6"),g(e,"title","移除引用")},m(s,l){H(s,e,l),t||(o=Q(e,"click",r),t=!0)},p(s,l){n=s},d(s){s&&U(e),t=!1,o()}}}function Ye(n,e){let t,o=e[3].label+"",r,s,l,i=e[3].type==="selection"&&Qe(e);return{key:n,first:null,c(){t=y("span"),r=ce(o),s=$(),i&&i.c(),l=$(),g(t,"class","reference-tag svelte-m85l6"),this.first=t},m(u,c){H(u,t,c),h(t,r),h(t,s),i&&i.m(t,null),h(t,l)},p(u,c){e=u,c&1&&o!==(o=e[3].label+"")&&Pe(r,o),e[3].type==="selection"?i?i.p(e,c):(i=Qe(e),i.c(),i.m(t,l)):i&&(i.d(1),i=null)},d(u){u&&U(t),i&&i.d()}}}function Ot(n){let e,t=n[0].length>0&&We(n);return{c(){t&&t.c(),e=Te()},m(o,r){t&&t.m(o,r),H(o,e,r)},p(o,[r]){o[0].length>0?t?t.p(o,r):(t=We(o),t.c(),t.m(e.parentNode,e)):t&&(t.d(1),t=null)},i:Y,o:Y,d(o){o&&U(e),t&&t.d(o)}}}function Mt(n,e,t){let o;ft(n,se,l=>t(0,o=l));function r(l){se.update(i=>i.filter(u=>u.id!==l))}return[o,r,l=>r(l.id)]}class Pt extends Ue{constructor(e){super(),qe(this,e,Mt,Ot,Se,{})}}const{Map:Ve}=Ct;function Xe(n,e,t){const o=n.slice();return o[36]=e[t],o}function Ze(n,e,t){const o=n.slice();return o[39]=e[t],o}function et(n){let e,t,o;return{c(){e=y("button"),e.textContent="保存当前对话",g(e,"class","b3-button b3-button--outline svelte-t2qwxc")},m(r,s){H(r,e,s),t||(o=Q(e,"click",n[9]),t=!0)},p:Y,d(r){r&&U(e),t=!1,o()}}}function tt(n,e){let t,o=e[39].name+"",r,s;return{key:n,first:null,c(){t=y("option"),r=ce(o),t.__value=s=e[39].id,ee(t,t.__value),this.first=t},m(l,i){H(l,t,i),h(t,r)},p(l,i){e=l,i[0]&8&&o!==(o=e[39].name+"")&&Pe(r,o),i[0]&8&&s!==(s=e[39].id)&&(t.__value=s,ee(t,t.__value))},d(l){l&&U(t)}}}function nt(n){let e,t,o;return{c(){e=y("button"),e.textContent="删除当前",g(e,"class","b3-button b3-button--error svelte-t2qwxc"),g(e,"title","删除当前对话")},m(r,s){H(r,e,s),t||(o=Q(e,"click",n[16]),t=!0)},p:Y,d(r){r&&U(e),t=!1,o()}}}function Lt(n){let e,t=(n[36].html||n[36].content)+"";return{c(){e=y("div"),g(e,"class","message ai svelte-t2qwxc")},m(o,r){H(o,e,r),e.innerHTML=t},p(o,r){r[0]&64&&t!==(t=(o[36].html||o[36].content)+"")&&(e.innerHTML=t)},d(o){o&&U(e)}}}function qt(n){let e,t,o=n[36].content.replace(/\n/g,"<br/>")+"";return{c(){e=y("div"),t=y("div"),g(e,"class","message user svelte-t2qwxc")},m(r,s){H(r,e,s),h(e,t),t.innerHTML=o},p(r,s){s[0]&64&&o!==(o=r[36].content.replace(/\n/g,"<br/>")+"")&&(t.innerHTML=o)},d(r){r&&U(e)}}}function ot(n,e){let t,o;function r(i,u){if(i[36].role==="user")return qt;if(i[36].role==="assistant")return Lt}let s=r(e),l=s&&s(e);return{key:n,first:null,c(){t=Te(),l&&l.c(),o=Te(),this.first=t},m(i,u){H(i,t,u),l&&l.m(i,u),H(i,o,u)},p(i,u){e=i,s===(s=r(e))&&l?l.p(e,u):(l&&l.d(1),l=s&&s(e),l&&(l.c(),l.m(o.parentNode,o)))},d(i){i&&(U(t),U(o)),l&&l.d(i)}}}function st(n){let e;return{c(){e=y("div"),e.innerHTML='<p class="svelte-t2qwxc">AI 正在思考...</p>',g(e,"class","message ai loading svelte-t2qwxc")},m(t,o){H(t,e,o)},d(t){t&&U(e)}}}function Ut(n){let e,t,o,r,s=R(n[7]).length>1&&!n[4]&&!n[2],l,i,u,c=[],b=new Ve,p,C,w,f=[],x=new Ve,O,X,N,G,L,S,V,D,M,A,j,J,W,te,B,P,Z,q=s&&et(n),ue=me(n[3]);const ve=d=>d[39].id;for(let d=0;d<ue.length;d+=1){let m=Ze(n,ue,d),F=ve(m);b.set(F,c[d]=tt(F,m))}let a=n[4]&&nt(n),_=me(n[6]);const k=d=>d[36].id;for(let d=0;d<_.length;d+=1){let m=Xe(n,_,d),F=k(m);x.set(F,f[d]=ot(F,m))}let v=n[2]&&st();return N=new Pt({}),{c(){e=y("div"),t=y("div"),o=y("button"),o.textContent="新建对话",r=$(),q&&q.c(),l=$(),i=y("select"),u=y("option"),u.textContent="加载历史对话";for(let d=0;d<c.length;d+=1)c[d].c();p=$(),a&&a.c(),C=$(),w=y("div");for(let d=0;d<f.length;d+=1)f[d].c();O=$(),v&&v.c(),X=$(),$t(N.$$.fragment),G=$(),L=y("div"),S=y("textarea"),V=$(),D=y("button"),M=ce("发送"),j=$(),J=y("button"),W=ce("引用选区"),g(o,"class","b3-button svelte-t2qwxc"),u.__value="",ee(u,u.__value),u.disabled=!0,u.selected=!0,g(i,"class","b3-select svelte-t2qwxc"),g(i,"title","加载历史对话"),g(t,"class","conversation-controls svelte-t2qwxc"),g(w,"class","chat-history svelte-t2qwxc"),g(S,"placeholder","在此输入您的问题或指令..."),g(S,"rows","3"),S.disabled=n[2],g(S,"class","svelte-t2qwxc"),D.disabled=A=!n[0].trim()||n[2],g(D,"class","svelte-t2qwxc"),g(J,"class","add-reference-button svelte-t2qwxc"),g(J,"title","添加当前选中文本作为引用"),J.disabled=te=!n[5]||n[2],g(L,"class","input-area svelte-t2qwxc"),g(e,"class","ai-chat-panel svelte-t2qwxc")},m(d,m){H(d,e,m),h(e,t),h(t,o),h(t,r),q&&q.m(t,null),h(t,l),h(t,i),h(i,u);for(let F=0;F<c.length;F+=1)c[F]&&c[F].m(i,null);h(t,p),a&&a.m(t,null),h(e,C),h(e,w);for(let F=0;F<f.length;F+=1)f[F]&&f[F].m(w,null);h(w,O),v&&v.m(w,null),n[17](w),h(e,X),bt(N,e,null),h(e,G),h(e,L),h(L,S),ee(S,n[0]),h(L,V),h(L,D),h(D,M),h(L,j),h(L,J),h(J,W),B=!0,P||(Z=[Q(o,"click",n[8]),Q(i,"change",n[15]),Q(S,"input",n[18]),Q(S,"keydown",n[19]),Q(D,"click",n[12]),Q(J,"click",n[13])],P=!0)},p(d,m){m[0]&20&&(s=R(d[7]).length>1&&!d[4]&&!d[2]),s?q?q.p(d,m):(q=et(d),q.c(),q.m(t,l)):q&&(q.d(1),q=null),m[0]&8&&(ue=me(d[3]),c=Oe(c,m,ve,1,d,ue,b,i,Re,tt,null,Ze)),d[4]?a?a.p(d,m):(a=nt(d),a.c(),a.m(t,null)):a&&(a.d(1),a=null),m[0]&64&&(_=me(d[6]),f=Oe(f,m,k,1,d,_,x,w,Re,ot,O,Xe)),d[2]?v||(v=st(),v.c(),v.m(w,null)):v&&(v.d(1),v=null),(!B||m[0]&4)&&(S.disabled=d[2]),m[0]&1&&ee(S,d[0]),(!B||m[0]&5&&A!==(A=!d[0].trim()||d[2]))&&(D.disabled=A),(!B||m[0]&36&&te!==(te=!d[5]||d[2]))&&(J.disabled=te)},i(d){B||(Le(N.$$.fragment,d),B=!0)},o(d){Tt(N.$$.fragment,d),B=!1},d(d){d&&U(e),q&&q.d();for(let m=0;m<c.length;m+=1)c[m].d();a&&a.d();for(let m=0;m<f.length;m+=1)f[m].d();v&&v.d(),n[17](null),yt(N),P=!1,ae(Z)}}}async function jt(n){if(!n)return console.log("No docId provided for structured context fetch."),"";console.log(`Fetching structured context for document ID: ${n}`);try{const e=`SELECT id, type, markdown FROM blocks WHERE parent_id = '${n}' ORDER BY sort ASC`,t=await fetch("/api/query/sql",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({stmt:e})});if(!t.ok){const s=await t.text();throw new Error(`SQL query failed with status ${t.status}: ${s}`)}const o=await t.json();if(o.code!==0)throw new Error(`API returned error code ${o.code}: ${o.msg}`);if(console.log("Raw SQL query result data:",o.data),!o.data||!Array.isArray(o.data))return console.log("No block data returned from SQL query or data is not an array."),"Document is empty or contains no text blocks.";let r=`Current document context (Blocks ordered by position):
`;return o.data.forEach((s,l)=>{r+=`--- Block ${l+1} (ID: ${s.id}, Type: ${s.type}) ---
${s.markdown||"[Block content not directly in markdown field]"}

`}),r+="--- End of Blocks ---",console.log("Formatted structured context length:",r.length),r}catch(e){return console.error("Error fetching or processing structured document context:",e),`Error retrieving document structure: ${e.message}`}}async function Kt(n){if(!n||n.length===0)return"";console.log(`Fetching context for specific block IDs: ${n.join(", ")}`);try{const t=`SELECT id, type, markdown FROM blocks WHERE id IN (${n.map(u=>`'${u}'`).join(", ")})`,o=await fetch("/api/query/sql",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({stmt:t})});if(!o.ok){const u=await o.text();throw new Error(`SQL query for references failed with status ${o.status}: ${u}`)}const r=await o.json();if(r.code!==0)throw new Error(`API returned error code ${r.code} for references: ${r.msg}`);if(!r.data||!Array.isArray(r.data))return console.log("No block data returned for referenced IDs."),"Could not retrieve content for referenced blocks.";console.log("Raw SQL query result data for references:",r.data);const s=new Map(r.data.map(u=>[u.id,u])),l=n.map(u=>s.get(u)).filter(Boolean);let i=`Referenced content:
`;return l.forEach((u,c)=>{i+=`--- Referenced Block ${c+1} (ID: ${u.id}, Type: ${u.type}) ---
${u.markdown||"[Block content not directly in markdown field]"}

`}),i+="--- End of Referenced Blocks ---",console.log("Formatted referenced context length:",i.length),i}catch(e){return console.error("Error fetching or processing referenced block context:",e),`Error retrieving referenced content: ${e.message}`}}function Ht(){console.log("Loading messages (ensure format is correct)...")}function rt(n){let e=n;for(;e&&e!==document.body;){if(e instanceof HTMLElement&&e.dataset.nodeId)return e;e=e.parentNode}return null}function Jt(){var C,w,f;const n=window.getSelection();if(!n||n.rangeCount===0||n.isCollapsed||!n.anchorNode||!n.focusNode)return[];const e=n.getRangeAt(0),t=e.startContainer,o=(C=t instanceof Node&&t.nodeType===Node.ELEMENT_NODE?t:t.parentElement)==null?void 0:C.closest(".protyle-wysiwyg");if(!o)return[];const r=rt(e.startContainer),s=rt(e.endContainer);if(console.log("Found start block node:",(w=r==null?void 0:r.dataset)==null?void 0:w.nodeId,r),console.log("Found end block node:",(f=s==null?void 0:s.dataset)==null?void 0:f.nodeId,s),!r&&!s)return console.log("Neither start nor end of selection is inside a block."),[];if(r&&r===s)return console.log("Selection within single block:",r.dataset.nodeId),[r.dataset.nodeId];const l=Array.from(o.querySelectorAll("[data-node-id]")),i=[],u=r||l[0],c=s||l[l.length-1];let b=l.findIndex(x=>x===u),p=l.findIndex(x=>x===c);if(console.log(`Calculated indices: Start=${b}, End=${p}`),b===-1||p===-1)return console.error("Could not reliably determine selection range indices within editor blocks."),r&&i.push(r.dataset.nodeId),s&&s!==r&&i.push(s.dataset.nodeId),i;b>p&&([b,p]=[p,b],console.log("Swapped indices"));for(let x=b;x<=p;x++){const O=l[x];O!=null&&O.dataset.nodeId&&i.push(O.dataset.nodeId)}return console.log("Final selected block IDs:",i),Array.from(new Set(i))}function zt(n,e,t){let o,{pluginData:r}=e,s=be([]);ft(n,s,a=>t(6,o=a));let l="",i,u=!1,c,b=[],p=null,C=null,w="",f=[],x=!1;const O=Ee.subscribe(a=>{c=a}),X=Me.subscribe(a=>{t(3,b=a.sort((_,k)=>k.timestamp-_.timestamp))}),N=Ie.subscribe(a=>{C=a}),G=Ce.subscribe(a=>{});se.subscribe(a=>{}),gt(async()=>{const a="有什么可以帮您？";s.set([{id:Date.now().toString()+"init",role:"assistant",content:a,html:oe(a)}]),Ht(),await fe(),W(),document.addEventListener("mouseup",te)}),St(()=>{O(),X(),N(),G(),document.removeEventListener("mouseup",te)});async function L(){R(s).length>1&&!p&&!u&&(console.log("Auto-saving previous conversation..."),await S());const a="新对话已开始，有什么可以帮您？",_=oe(a);s.set([{id:Date.now().toString()+"init-new",role:"assistant",content:a,html:_}]),t(4,p=null),t(0,l=""),await fe(),W()}async function S(){if(u||R(s).length<=1||p)return;const a=Date.now(),_=a.toString(),k=`对话 ${new Date(a).toLocaleString()}`,d=[{id:_,name:k,timestamp:a,messages:R(s).filter(m=>m.role==="user"||m.role==="assistant").map(({role:m,content:F})=>({role:m,content:F}))},...b];await r.saveConversations(d),t(4,p=_),console.log("Conversation saved with ID:",_)}function V(a){const _=b.find(k=>k.id===a);_&&(s.update(k=>_.messages.map((v,d)=>({...v,id:d,html:v.role==="assistant"?oe(v.content):void 0}))),t(4,p=_.id),R(s).length,t(0,l=""),fe().then(W),console.log("Conversation loaded:",a))}async function D(a,_){if(_.stopPropagation(),confirm("确定要删除这个对话吗？")){const k=b.filter(v=>v.id!==a);await r.saveConversations(k),p===a&&L(),console.log("Conversation deleted:",a)}}async function M(a){console.log(`Attempting to delete block: ${a}`);try{const _=await fetch("/api/block/deleteBlock",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:a})});if(!_.ok){const v=await _.text();throw new Error(`API deleteBlock failed (${_.status}): ${v}`)}const k=await _.json();if(k.code!==0)throw new Error(`API deleteBlock returned error code ${k.code}: ${k.msg}`);console.log(`Block ${a} deleted successfully.`)}catch(_){throw console.error(`Error executing deleteBlock for ${a}:`,_),w=`删除块 ${a} 失败: ${_.message}`,_}}async function A(a,_){console.log(`Attempting to update block ${a} with new markdown:`,_);try{const k=await fetch("/api/block/updateBlock",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:a,dataType:"markdown",data:_})});if(!k.ok){const d=await k.text();throw new Error(`API updateBlock failed (${k.status}): ${d}`)}const v=await k.json();if(v.code!==0)throw new Error(`API updateBlock returned error code ${v.code}: ${v.msg}`);console.log(`Block ${a} updated successfully.`)}catch(k){throw console.error(`Error executing updateBlock for ${a}:`,k),w=`更新块 ${a} 失败: ${k.message}`,k}}async function j(a,_,k){console.log(`Attempting to insert block after ${a||"start"} with parent ${k||"unknown"}, content:
${_}`);const v={dataType:"markdown",data:_};a!==null?v.previousID=a:(k!==null&&(v.parentID=k),v.previousID="");try{console.log("Executing insert with payload:",v);const d=await fetch("/api/block/insertBlock",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(v)});if(!d.ok){const F=await d.text();throw new Error(`API Error (${d.status}): ${F}`)}const m=await d.json();if(m.code!==0)throw new Error(`API returned error code ${m.code}: ${m.msg}`);console.log(`Block inserted successfully after ${a||"start"}.`)}catch(d){throw console.error("Error executing insert block command:",d),w=`插入块失败: ${d.message}`,d}}async function J(){const a=l.trim();if(!a||u)return;w="",t(2,u=!0);const _=a.match(/^(删除|修改)选区(\d+)$/i);let k=!1;if(_){const E=_[1],T=parseInt(_[2],10);console.log(`[Frontend Command] Matched: action=${E}, index=${T}`);const ne=R(se);console.log("[Frontend Command] Current references in store:",JSON.stringify(ne,null,2));const I=ne.filter(K=>K.type==="selection");if(console.log("[Frontend Command] Filtered selection references:",JSON.stringify(I,null,2)),T>0&&T<=I.length){const K=I[T-1];console.log(`[Frontend Command] Target reference (at index ${T-1}):`,JSON.stringify(K,null,2));const z=K.blockIds;if(console.log(`[Frontend Command] Target Block IDs for ${E}:`,JSON.stringify(z)),E.toLowerCase()==="删除")try{for(const ie of z)await M(ie);const de=Date.now().toString()+"fe-del";s.update(ie=>[...ie,{id:de,role:"assistant",content:`已执行删除选区 ${T} (块: ${z.join(", ")}) 的操作。`,html:oe(`已执行删除选区 **${T}** (块: ${z.join(", ")}) 的操作。`)}]),s.set([...R(s)]);const ye=K.id;console.log(`[Frontend Command] Removing reference with ID: ${ye}`),se.update(ie=>{const He=ie.filter(kt=>kt.id!==ye);return console.log("[Frontend Command] References after removal:",JSON.stringify(He,null,2)),He}),k=!0}catch(de){console.error("[Frontend Command] Error executing frontend delete command:",de),w=`执行删除选区 ${T} 失败: ${de.message}`,k=!0}else E.toLowerCase()==="修改"&&(console.log("Frontend modification command recognized, but not fully implemented."),w='通过 "修改选区N" 指令修改内容的功能尚未完全实现。请尝试选中内容后，直接向 AI 提出修改要求。',k=!0)}else console.warn(`[Frontend Command] Invalid index ${T} for ${I.length} selection references.`),w=`无效的选区编号: ${T}。请确保编号在 1 到 ${I.length} 之间。`,k=!0}if(k){t(0,l=""),t(2,u=!1),await fe(),W();return}const d={id:Date.now().toString()+Math.random().toString(36).substring(2,9),role:"user",content:a};s.update(E=>[...E,d]),s.set([...R(s)]),console.log("User message added to store:",R(s)),t(0,l=""),await fe(),W();let m="",F="";const Fe=R(se).filter(E=>E.type==="selection");if(C){console.log("Fetching structured context for document ID:",C);try{m=await jt(C),console.log("Fetched main document context length:",(m==null?void 0:m.length)??0)}catch(E){console.error("Error fetching structured document context:",E),w=`获取文档结构上下文失败: ${E.message}`}}else console.log("No currentDocId, skipping main document context fetch.");if(Fe.length>0){const E=Array.from(new Set(Fe.flatMap(T=>T.blockIds)));console.log("Found selection references, fetching referenced context for IDs:",E);try{F=await Kt(E),console.log("Fetched referenced context length:",(F==null?void 0:F.length)??0)}catch(T){console.error("Error fetching referenced block context:",T),w=`获取引用块上下文失败: ${T.message}`}}let re="";C&&(re+=`--- Document Root (ID: ${C}) ---

`),m&&(re+=m),F&&(re&&(re+=`

`),re+=F);const _t=R(s).filter(E=>E.role==="user"||E.role==="assistant").slice(-20).map(E=>({role:E.role,content:E.content}));let je=`You are a helpful AI assistant integrated into Siyuan Note.\\nYou can interact with the document content based on the provided context.\\n\\n**Understanding the Context:**\\nThe context below shows the structure and content of the current document or specific blocks selected by the user.\\nEach block is listed with its sequential number, unique ID, and type, like this:\\n--- Block N (ID: yyyy-mmdd-xxxxxx, Type: p) ---\\n[Markdown content of the block]\\n---\\n+(Referenced blocks, if any, will be listed under \\"Referenced content:\\")\\n\\n**Performing Actions (Delete/Update):**\\nWhen the user asks you to modify the document (e.g., \\"delete the second paragraph\\", \\"update the list item with ID xxx\\"):\\n1. Carefully identify the **exact block ID** (e.g., yyyy-mmdd-xxxxxx) from the context that corresponds to the user\\'s request.\\n2. Output **only** a single JSON command block using one of the following formats. **You MUST use the specific block ID found in the context.**\\n\\n   *   To delete a block: \\\`\\\`\\\`json {\\"action\\": \\"delete\\", \\"block_id\\": \\"TARGET_BLOCK_ID_FROM_CONTEXT\\"} \\\`\\\`\\\`\\
   *   To update a block: \\\`\\\`\\\`json {\\"action\\": \\"update\\", \\"block_id\\": \\"TARGET_BLOCK_ID_FROM_CONTEXT\\", \\"new_markdown\\": \\"NEW_MARKDOWN_CONTENT\\"} \\\`\\\`\\\`\\
   *   To insert a block: \\\`\\\`\\\`json {\\"action\\": \\"insert\\", \\"previousID\\": \\"ID_OF_BLOCK_BEFORE\\", \\"parentID\\": null, \\"markdown\\": \\"NEW_MARKDOWN_CONTENT\\"} \\\`\\\`\\\` (Note: parentID is usually null for insertions relative to existing blocks)\\
\\n**IMPORTANT RULES:**\\n*   **Action Intent:** Determine the user\\'s core goal:\\
    *   \\'update\\': User wants to *modify, update, or replace* content of an *existing* block.\\
    *   \\'delete\\': User wants to *remove or delete* an *existing* block.\\
    *   \\'insert\\': User wants to *add, insert, create, or write* *new* content/blocks.\\
    *   **If unsure about intent, ASK the user.**\\
*   **Insert Command - How to Set IDs (ONLY relative to specific Block IDs):**\\
    *   **Goal: Insert AFTER Block A?** (e.g., \\"add below Block A\\", \\"insert after selection 1\\")\\
        *   Find Block A\\'s ID in the context (\\'BLOCK_A_ID\\').\\
        *   Set \\'previousID\\' = \\'BLOCK_A_ID\\'.\\
        *   Set \\'parentID\\' = null (or omit).\\
    *   **Goal: Insert BEFORE Block B?** (e.g., \\"insert before Block B\\", \\"add above selection 1\\")\\
        *   Find the ID of the block *immediately preceding* Block B in the context (\\'BLOCK_B_minus_1_ID\\'). **There MUST be a preceding block.**\\
        *   Set \\'previousID\\' = \\'BLOCK_B_minus_1_ID\\'.\\
        *   Set \\'parentID\\' = null (or omit).\\
    *   **Goal: Insert BETWEEN Block A and Block B?** (e.g., \\"put this between block 1 and 2\\")\\
        *   Treat this as \\"Insert AFTER Block A\\".\\
        *   Find Block A\\'s ID (\\'BLOCK_A_ID\\').\\
        *   Set \\'previousID\\' = \\'BLOCK_A_ID\\'.\\
        *   Set \\'parentID\\' = null (or omit).\\
    *   **Content:** The \\'markdown\\' field must contain the complete Markdown content for the new block(s).\\
*   **NO Fuzzy Locations:** Requests like \\"insert at the beginning\\", \\"insert at the end\\", or \\"insert here\\" are **NOT SUPPORTED** for direct action. See \\"Ask If Unsure\\".\\
*   **Referenced Context First:** If \\'Referenced content\\' is provided and the user\\'s request mentions the selection/reference (e.g., \\"update selection 1\\", \\"insert after the selected paragraph\\"), **MUST** use the block ID from the \\'Referenced content\\' section for targeting (\\'block_id\\' for update/delete, \\'previousID\\' for insert after). Only use IDs from the main document context if the user explicitly targets other parts.\\
*   **Use Exact IDs:** Always use the exact block IDs shown in parentheses (ID: ...) from the context. Never guess IDs or use block numbers like \\"Block 3\\".\\
*   **Ask If Unsure (CRITICAL):** If the user\\'s request is ambiguous about the action (update/delete/insert), the target block/location, or if you cannot confidently find the necessary IDs in the context according to these rules, **you MUST ask the user for clarification**. \\
    *   **Specifically:** If the user asks to insert at the beginning, end, or uses vague terms without specifying a block ID, you MUST reply asking them to provide the **ID of the block** they want to insert **before** or **after**.\\
    *   Example clarifying question: \\"To insert the content, please tell me the ID of the block you want to insert it before or after.\\"\\
    *   Do NOT guess or make assumptions.\\
*   **Normal Chat:** For general questions, summaries, or explanations that don\\'t involve changing the document, respond normally in natural language without any JSON command block.\\
\\
--- Context Starts Below:`;re&&(je+=`

${re}`);const Ke=[{role:"system",content:je},..._t];console.log("Messages being sent to API (final format):",Ke);try{const E=await Rt(Ke,c);let T=!1;const ne=E.match(/```json\n({.*?})\n```/s);if(ne&&ne[1])try{const I=JSON.parse(ne[1]);if(console.log("Parsed AI command:",I),I.action==="delete"&&I.block_id){await M(I.block_id),T=!0;const K=Date.now().toString()+"cmd-del";s.update(z=>[...z,{id:K,role:"assistant",content:`已执行删除块 ${I.block_id} 的操作。`,html:oe(`已执行删除块 **${I.block_id}** 的操作。`)}]),s.set([...R(s)])}else if(I.action==="update"&&I.block_id&&typeof I.new_markdown=="string"){await A(I.block_id,I.new_markdown),T=!0;const K=Date.now().toString()+"cmd-upd";s.update(z=>[...z,{id:K,role:"assistant",content:`已执行更新块 ${I.block_id} 的操作。`,html:oe(`已执行更新块 **${I.block_id}** 的操作。`)}]),s.set([...R(s)])}else if(I.action==="insert"&&typeof I.markdown=="string"&&(typeof I.previousID=="string"||typeof I.parentID=="string"&&I.parentID!=="")){const K=I.previousID===""?null:I.previousID,z=I.parentID||null;await j(K,I.markdown,z),T=!0;const de=Date.now().toString()+"cmd-ins",ye=K?`块 ${K} 之后`:z?`文档 ${z} 开头`:"文档开头";s.update(ie=>[...ie,{id:de,role:"assistant",content:`已在 ${ye} 插入新块。`,html:oe(`已在 **${ye}** 插入新块。`)}]),s.set([...R(s)])}else console.warn("Parsed command JSON has invalid action or missing/invalid parameters:",I)}catch(I){console.error("Failed to parse command JSON:",I,"Raw content:",ne[1])}if(!T){const K={id:Date.now().toString()+Math.random().toString(36).substring(2,9),role:"assistant",content:E,html:oe(E)};s.update(z=>[...z,K]),s.set([...R(s)]),console.log("Assistant message added to store:",R(s))}}catch(E){console.error("Error fetching chat completion:",E),w=`AI 请求失败: ${E.message}`;const ne={id:Date.now().toString()+Math.random().toString(36).substring(2,9),role:"assistant",content:`抱歉，请求出错: ${w}`,html:oe(`抱歉，请求出错: ${w}`)};s.update(I=>[...I,ne]),s.set([...R(s)]),console.log("Error message added to store:",R(s))}finally{t(2,u=!1),!k&&Fe.length>0&&(console.log("Clearing selection references after AI call."),se.update(E=>E.filter(T=>T.type!=="selection"))),await fe(),W()}}function W(){i&&requestAnimationFrame(()=>{t(1,i.scrollTop=i.scrollHeight,i)})}function te(){setTimeout(()=>{f=Jt(),t(5,x=f.length>0)},100)}function B(){var d;if(!x||f.length===0)return;const a=`sel-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,k=`选区 ${R(se).filter(m=>m.type==="selection").length+1}`,v={id:a,label:k,blockIds:[...f],type:"selection"};se.update(m=>[...m,v]),f=[],t(5,x=!1),(d=window.getSelection())==null||d.removeAllRanges()}const P=a=>V(a.currentTarget.value),Z=a=>D(p,a);function q(a){$e[a?"unshift":"push"](()=>{i=a,t(1,i)})}function ue(){l=this.value,t(0,l)}const ve=a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),J())};return n.$$set=a=>{"pluginData"in a&&t(14,r=a.pluginData)},[l,i,u,b,p,x,o,s,L,S,V,D,J,B,r,P,Z,q,ue,ve]}class Gt extends Ue{constructor(e){super(),qe(this,e,zt,Ut,Se,{pluginData:14},null,[-1,-1])}}function it(n){let e,t;return{c(){e=y("span"),t=ce(n[3]),g(e,"class","status-message svelte-136cw2s")},m(o,r){H(o,e,r),h(e,t)},p(o,r){r&8&&Pe(t,o[3])},d(o){o&&U(e)}}}function Wt(n){let e,t,o,r,s,l,i,u,c,b,p,C,w,f,x,O,X,N,G,L,S,V,D,M,A,j,J,W,te,B=n[3]&&it(n);return{c(){e=y("div"),t=y("h2"),t.textContent="AI 助手设置",o=$(),r=y("div"),s=y("label"),s.textContent="AI API Endpoint URL:",l=$(),i=y("input"),u=$(),c=y("p"),c.textContent="请输入您要使用的 AI 服务的完整 URL。",b=$(),p=y("div"),C=y("label"),C.textContent="API Key:",w=$(),f=y("input"),x=$(),O=y("p"),O.textContent="您的 API Key 将被保存在本地配置文件中。",X=$(),N=y("div"),G=y("label"),G.textContent="模型名称:",L=$(),S=y("input"),V=$(),D=y("p"),D.textContent="请输入要调用的具体模型名称。",M=$(),A=y("div"),j=y("button"),j.textContent="保存设置",J=$(),B&&B.c(),g(t,"class","svelte-136cw2s"),g(s,"for","api-url"),g(s,"class","svelte-136cw2s"),g(i,"id","api-url"),g(i,"type","text"),g(i,"placeholder","例如: https://api.openai.com/v1/chat/completions"),g(i,"class","b3-text-field svelte-136cw2s"),g(c,"class","description svelte-136cw2s"),g(r,"class","form-item svelte-136cw2s"),g(C,"for","api-key"),g(C,"class","svelte-136cw2s"),g(f,"id","api-key"),g(f,"type","password"),g(f,"placeholder","请输入您的 API Key"),g(f,"class","b3-text-field svelte-136cw2s"),g(O,"class","description svelte-136cw2s"),g(p,"class","form-item svelte-136cw2s"),g(G,"for","model-name"),g(G,"class","svelte-136cw2s"),g(S,"id","model-name"),g(S,"type","text"),g(S,"placeholder","例如: deepseek-chat, gpt-4o, ..."),g(S,"class","b3-text-field svelte-136cw2s"),g(D,"class","description svelte-136cw2s"),g(N,"class","form-item svelte-136cw2s"),g(j,"class","b3-button b3-button--primary"),g(A,"class","actions svelte-136cw2s"),g(e,"class","settings-panel svelte-136cw2s")},m(P,Z){H(P,e,Z),h(e,t),h(e,o),h(e,r),h(r,s),h(r,l),h(r,i),ee(i,n[0]),h(r,u),h(r,c),h(e,b),h(e,p),h(p,C),h(p,w),h(p,f),ee(f,n[1]),h(p,x),h(p,O),h(e,X),h(e,N),h(N,G),h(N,L),h(N,S),ee(S,n[2]),h(N,V),h(N,D),h(e,M),h(e,A),h(A,j),h(A,J),B&&B.m(A,null),W||(te=[Q(i,"input",n[8]),Q(f,"input",n[9]),Q(S,"input",n[10]),Q(j,"click",n[4])],W=!0)},p(P,[Z]){Z&1&&i.value!==P[0]&&ee(i,P[0]),Z&2&&f.value!==P[1]&&ee(f,P[1]),Z&4&&S.value!==P[2]&&ee(S,P[2]),P[3]?B?B.p(P,Z):(B=it(P),B.c(),B.m(A,null)):B&&(B.d(1),B=null)},i:Y,o:Y,d(P){P&&U(e),B&&B.d(),W=!1,ae(te)}}}function Qt(n,e,t){let{loadSettings:o}=e,{saveSettings:r}=e,{currentSettings:s}=e,l="",i="",u="",c="";gt(async()=>{if(s)t(0,l=s.apiUrl||""),t(1,i=s.apiKey||""),t(2,u=s.modelName||"deepseek-chat");else{const f=await o();t(0,l=f.apiUrl||""),t(1,i=f.apiKey||""),t(2,u=f.modelName||"deepseek-chat")}});async function b(){try{await r({apiUrl:l,apiKey:i,modelName:u}),t(3,c="设置已保存！"),setTimeout(()=>t(3,c=""),3e3)}catch(f){t(3,c=`保存失败: ${f.message}`)}}function p(){l=this.value,t(0,l)}function C(){i=this.value,t(1,i)}function w(){u=this.value,t(2,u)}return n.$$set=f=>{"loadSettings"in f&&t(5,o=f.loadSettings),"saveSettings"in f&&t(6,r=f.saveSettings),"currentSettings"in f&&t(7,s=f.currentSettings)},[l,i,u,c,b,o,r,s,p,C,w]}class Yt extends Ue{constructor(e){super(),qe(this,e,Qt,Wt,Se,{loadSettings:5,saveSettings:6,currentSettings:7})}}const lt="ai-assistant-config",ct="ai-assistant-conversations",Vt={apiUrl:"",apiKey:"",modelName:"deepseek-chat"},Xt="ai_assistant_dock";class Zt extends Ae.Plugin{constructor(){super(...arguments);le(this,"isMobile");le(this,"settings");le(this,"settingsDialog",null);le(this,"switchProtyleCallback",this.handleSwitchProtyle.bind(this))}async onload(){console.log("--- siyuan-plugin-canvas onload --- Fired");const t=Ae.getFrontend();this.isMobile=t==="mobile"||t==="browser-mobile",await this.loadSettings(),await this.loadConversations(),this.eventBus.on("switch-protyle",this.switchProtyleCallback),console.log("Event listener for 'switch-protyle' added."),this.addIcons('<symbol id="iconComment" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M896 128H128C83.8 128 48 163.8 48 208v448c0 44.2 35.8 80 80 80h176v128l237.6-128H896c44.2 0 80-35.8 80-80V208c0-44.2-35.8-80-80-80z m-48 480H581.8L512 651.7V608H176V256h672v352z" fill="#515151"></path></symbol>'),this.addDock({config:{position:"RightTop",size:{width:300,height:0},icon:"iconComment",title:this.isMobile?"AI助手":`AI助手(${this.name})`,hotkey:"⌥⌘A"},data:{plugin:this,saveConversations:this.saveConversations.bind(this)},type:Xt,init(o){new Gt({target:o.element,props:{pluginData:o.data}}),console.log("AI Assistant Dock initialized with Svelte component")},destroy(){console.log("AI Assistant Dock destroyed")}}),console.log("Icons and Dock added.")}onLayoutReady(){console.log("--- siyuan-plugin-canvas onLayoutReady --- Fired"),setTimeout(()=>{console.log("Executing updateCurrentDocIdFromActiveTab after 500ms delay..."),this.updateCurrentDocIdFromActiveTab()},500)}handleSwitchProtyle({detail:t}){if(console.log("--- handleSwitchProtyle --- Fired"),console.log("Switch Protyle Event detail:",t),t&&t.protyle&&t.protyle.block&&t.protyle.block.rootID){const o=t.protyle.block.rootID;if(console.log(`Doc ID found in protyle.block.rootID: ${o}`),Ie.set(o),console.log(`Current document ID updated via switch-protyle: ${o}`),t.protyle.path){const r=t.protyle.path;console.log(`Doc Path found in protyle.path: ${r}`),Ce.set(r),console.log(`Current document Path updated via switch-protyle: ${r}`)}else console.warn("Doc Path not found in protyle detail."),Ce.set(null)}else console.warn("Could not find document ID (rootID) in switch-protyle event detail."),Ie.set(null),Ce.set(null)}updateCurrentDocIdFromActiveTab(){var t;console.log("Attempting to get doc ID from active tab...");try{const o=document.querySelector(".layout__tab--active .protyle:not(.fn__none)");if(o){console.log("Active protyle tab element found.");let r=o,s=r==null?void 0:r.protyle;for(;r&&!s;)s=r==null?void 0:r.protyle,r=r.parentElement;if((t=s==null?void 0:s.block)!=null&&t.rootID){const l=s.block.rootID;Ie.set(l),console.log(`Updated doc ID from active tab in onLayoutReady: ${l}`)}else{console.log("Found active protyle tab, but failed to get instance or rootID.",{protyleInstance:s});const l=o.getAttribute("data-node-id");l&&console.log(`Found node-id on active tab: ${l}. Attempting to get root via API.`)}}else console.log("No active protyle tab element found in onLayoutReady.")}catch(o){console.error("Error getting doc ID from active tab:",o)}}openSetting(){this.settingsDialog||(this.settingsDialog=new Ae.Dialog({title:"AI 助手设置",content:'<div id="ai-assistant-settings" style="height: 100%;"></div>',width:this.isMobile?"92vw":"600px",destroyCallback:()=>{this.settingsDialog=null}}),new Yt({target:this.settingsDialog.element.querySelector("#ai-assistant-settings"),props:{loadSettings:this.loadSettings.bind(this),saveSettings:this.saveSettings.bind(this),currentSettings:this.settings}}))}async loadSettings(){const t=await this.loadData(lt);return this.settings=Object.assign({},Vt,t),Ee.set(this.settings),console.log("AI Assistant settings loaded and store updated:",this.settings),this.settings}async saveSettings(t){this.settings=t,await this.saveData(lt,this.settings),Ee.set(this.settings),console.log("AI Assistant settings saved and store updated.")}async loadConversations(){const t=await this.loadData(ct)||[];Me.set(t),console.log(`${t.length} conversations loaded.`)}async saveConversations(t){await this.saveData(ct,t),Me.set(t),console.log(`Conversations saved (${t.length} total).`)}onunload(){console.log("--- siyuan-plugin-canvas onunload --- Fired"),this.eventBus.off("switch-protyle",this.switchProtyleCallback),console.log("Event listener for 'switch-protyle' removed."),this.settingsDialog&&this.settingsDialog.destroy()}}module.exports=Zt;
