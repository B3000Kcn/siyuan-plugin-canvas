"use strict";var Gt=Object.defineProperty;var $t=(t,e,n)=>e in t?Gt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var G=(t,e,n)=>$t(t,typeof e!="symbol"?e+"":e,n);const ft=require("siyuan");function L(){}function Nt(t){return t()}function vt(){return Object.create(null)}function $(t){t.forEach(Nt)}function xt(t){return typeof t=="function"}function _t(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}function Yt(t){return Object.keys(t).length===0}function Lt(t,...e){if(t==null){for(const s of e)s(void 0);return L}const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function x(t){let e;return Lt(t,n=>e=n)(),e}function Qt(t,e,n){t.$$.on_destroy.push(Lt(e,n))}function g(t,e){t.appendChild(e)}function z(t,e,n){t.insertBefore(e,n||null)}function O(t){t.parentNode&&t.parentNode.removeChild(t)}function v(t){return document.createElement(t)}function st(t){return document.createTextNode(t)}function P(){return st(" ")}function yt(){return st("")}function j(t,e,n,s){return t.addEventListener(e,n,s),()=>t.removeEventListener(e,n,s)}function h(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function Wt(t){return Array.from(t.childNodes)}function Ut(t,e){e=""+e,t.data!==e&&(t.data=e)}function q(t,e){t.value=e??""}let nt;function et(t){nt=t}function Ot(){if(!nt)throw new Error("Function called outside component initialization");return nt}function Ht(t){Ot().$$.on_mount.push(t)}function Xt(t){Ot().$$.on_destroy.push(t)}const W=[],gt=[];let X=[];const wt=[],Rt=Promise.resolve();let pt=!1;function Kt(){pt||(pt=!0,Rt.then(qt))}function Z(){return Kt(),Rt}function mt(t){X.push(t)}const ht=new Set;let Y=0;function qt(){if(Y!==0)return;const t=nt;do{try{for(;Y<W.length;){const e=W[Y];Y++,et(e),Zt(e.$$)}}catch(e){throw W.length=0,Y=0,e}for(et(null),W.length=0,Y=0;gt.length;)gt.pop()();for(let e=0;e<X.length;e+=1){const n=X[e];ht.has(n)||(ht.add(n),n())}X.length=0}while(W.length);for(;wt.length;)wt.pop()();pt=!1,ht.clear(),et(t)}function Zt(t){if(t.fragment!==null){t.update(),$(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(mt)}}function te(t){const e=[],n=[];X.forEach(s=>t.indexOf(s)===-1?e.push(s):n.push(s)),n.forEach(s=>s()),X=e}const ee=new Set;function jt(t,e){t&&t.i&&(ee.delete(t),t.i(e))}function lt(t){return(t==null?void 0:t.length)!==void 0?t:Array.from(t)}function Dt(t,e){t.d(1),e.delete(t.key)}function kt(t,e,n,s,o,i,r,a,p,c,F,_){let D=t.length,y=i.length,f=D;const H={};for(;f--;)H[t[f].key]=f;const N=[],R=new Map,E=new Map,S=[];for(f=y;f--;){const b=_(o,i,f),T=n(b);let I=r.get(T);I?S.push(()=>I.p(b,e)):(I=c(T,b),I.c()),R.set(T,N[f]=I),T in H&&E.set(T,Math.abs(f-H[T]))}const K=new Set,C=new Set;function U(b){jt(b,1),b.m(a,F),r.set(b.key,b),F=b.first,y--}for(;D&&y;){const b=N[y-1],T=t[D-1],I=b.key,k=T.key;b===T?(F=b.first,D--,y--):R.has(k)?!r.has(I)||K.has(I)?U(b):C.has(k)?D--:E.get(I)>E.get(k)?(C.add(I),U(b)):(K.add(k),D--):(p(T,r),D--)}for(;D--;){const b=t[D];R.has(b.key)||p(b,r)}for(;y;)U(N[y-1]);return $(S),N}function ne(t,e,n){const{fragment:s,after_update:o}=t.$$;s&&s.m(e,n),mt(()=>{const i=t.$$.on_mount.map(Nt).filter(xt);t.$$.on_destroy?t.$$.on_destroy.push(...i):$(i),t.$$.on_mount=[]}),o.forEach(mt)}function se(t,e){const n=t.$$;n.fragment!==null&&(te(n.after_update),$(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function oe(t,e){t.$$.dirty[0]===-1&&(W.push(t),Kt(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function zt(t,e,n,s,o,i,r=null,a=[-1]){const p=nt;et(t);const c=t.$$={fragment:null,ctx:[],props:i,update:L,not_equal:o,bound:vt(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(p?p.$$.context:[])),callbacks:vt(),dirty:a,skip_bound:!1,root:e.target||p.$$.root};r&&r(c.root);let F=!1;if(c.ctx=n?n(t,e.props||{},(_,D,...y)=>{const f=y.length?y[0]:D;return c.ctx&&o(c.ctx[_],c.ctx[_]=f)&&(!c.skip_bound&&c.bound[_]&&c.bound[_](f),F&&oe(t,_)),D}):[],c.update(),F=!0,$(c.before_update),c.fragment=s?s(c.ctx):!1,e.target){if(e.hydrate){const _=Wt(e.target);c.fragment&&c.fragment.l(_),_.forEach(O)}else c.fragment&&c.fragment.c();e.intro&&jt(t.$$.fragment),ne(t,e.target,e.anchor),qt()}et(p)}class Jt{constructor(){G(this,"$$");G(this,"$$set")}$destroy(){se(this,1),this.$destroy=L}$on(e,n){if(!xt(n))return L;const s=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return s.push(n),()=>{const o=s.indexOf(n);o!==-1&&s.splice(o,1)}}$set(e){this.$$set&&!Yt(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const ie="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(ie);const Q=[];function ot(t,e=L){let n;const s=new Set;function o(a){if(_t(t,a)&&(t=a,n)){const p=!Q.length;for(const c of s)c[1](),Q.push(c,t);if(p){for(let c=0;c<Q.length;c+=2)Q[c][0](Q[c+1]);Q.length=0}}}function i(a){o(a(t))}function r(a,p=L){const c=[a,p];return s.add(c),s.size===1&&(n=e(o,i)||L),a(t),()=>{s.delete(c),s.size===0&&n&&(n(),n=null)}}return{set:o,update:i,subscribe:r}}const le={apiKey:"",apiUrl:"",model:"gpt-3.5-turbo",temperature:.7,maxTokens:2e3},ct=ot(le),bt=ot([]),at=ot(null),rt=ot(null);async function ae(t){const e=x(ct);if(!e.apiKey||!e.apiUrl)throw new Error("API Key 或 API URL 未配置");const n=await fetch(e.apiUrl,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e.apiKey}`},body:JSON.stringify({model:e.modelName||"deepseek-chat",messages:t,temperature:e.temperature||.7,max_tokens:e.maxTokens||2e3})});if(!n.ok){const o=await n.text();throw new Error(`API 请求失败: ${n.status} ${o}`)}const s=await n.json();if(!s.choices||s.choices.length===0)throw new Error("API 返回数据格式错误");return s.choices[0].message.content}function tt(t){return window.Lute.New().Md2HTML(t)}function Ct(t,e,n){const s=t.slice();return s[29]=e[n],s}function St(t,e,n){const s=t.slice();return s[32]=e[n],s}function It(t){let e,n,s;return{c(){e=v("button"),e.textContent="保存当前对话",h(e,"class","b3-button b3-button--outline svelte-t24sax")},m(o,i){z(o,e,i),n||(s=j(e,"click",t[8]),n=!0)},p:L,d(o){o&&O(e),n=!1,s()}}}function At(t,e){let n,s=e[32].name+"",o,i;return{key:t,first:null,c(){n=v("option"),o=st(s),n.__value=i=e[32].id,q(n,n.__value),this.first=n},m(r,a){z(r,n,a),g(n,o)},p(r,a){e=r,a[0]&8&&s!==(s=e[32].name+"")&&Ut(o,s),a[0]&8&&i!==(i=e[32].id)&&(n.__value=i,q(n,n.__value))},d(r){r&&O(n)}}}function Et(t){let e,n,s;return{c(){e=v("button"),e.textContent="删除当前",h(e,"class","b3-button b3-button--error svelte-t24sax"),h(e,"title","删除当前对话")},m(o,i){z(o,e,i),n||(s=j(e,"click",t[14]),n=!0)},p:L,d(o){o&&O(e),n=!1,s()}}}function re(t){let e,n=(t[29].html||t[29].content)+"";return{c(){e=v("div"),h(e,"class","message ai svelte-t24sax")},m(s,o){z(s,e,o),e.innerHTML=n},p(s,o){o[0]&32&&n!==(n=(s[29].html||s[29].content)+"")&&(e.innerHTML=n)},d(s){s&&O(e)}}}function ce(t){let e,n,s=t[29].content.replace(/\n/g,"<br/>")+"";return{c(){e=v("div"),n=v("div"),h(e,"class","message user svelte-t24sax")},m(o,i){z(o,e,i),g(e,n),n.innerHTML=s},p(o,i){i[0]&32&&s!==(s=o[29].content.replace(/\n/g,"<br/>")+"")&&(n.innerHTML=s)},d(o){o&&O(e)}}}function Ft(t,e){let n,s;function o(a,p){if(a[29].role==="user")return ce;if(a[29].role==="assistant")return re}let i=o(e),r=i&&i(e);return{key:t,first:null,c(){n=yt(),r&&r.c(),s=yt(),this.first=n},m(a,p){z(a,n,p),r&&r.m(a,p),z(a,s,p)},p(a,p){e=a,i===(i=o(e))&&r?r.p(e,p):(r&&r.d(1),r=i&&i(e),r&&(r.c(),r.m(s.parentNode,s)))},d(a){a&&(O(n),O(s)),r&&r.d(a)}}}function Tt(t){let e;return{c(){e=v("div"),e.innerHTML='<p class="svelte-t24sax">AI 正在思考...</p>',h(e,"class","message ai loading svelte-t24sax")},m(n,s){z(n,e,s)},d(n){n&&O(e)}}}function ue(t){let e,n,s,o,i=x(t[6]).length>1&&!t[4]&&!t[2],r,a,p,c=[],F=new Map,_,D,y,f=[],H=new Map,N,R,E,S,K,C,U,b,T,I,k=i&&It(t),J=lt(t[3]);const V=u=>u[32].id;for(let u=0;u<J.length;u+=1){let w=St(t,J,u),A=V(w);F.set(A,c[u]=At(A,w))}let M=t[4]&&Et(t),l=lt(t[5]);const m=u=>u[29].id;for(let u=0;u<l.length;u+=1){let w=Ct(t,l,u),A=m(w);H.set(A,f[u]=Ft(A,w))}let d=t[2]&&Tt();return{c(){e=v("div"),n=v("div"),s=v("button"),s.textContent="新建对话",o=P(),k&&k.c(),r=P(),a=v("select"),p=v("option"),p.textContent="加载历史对话";for(let u=0;u<c.length;u+=1)c[u].c();_=P(),M&&M.c(),D=P(),y=v("div");for(let u=0;u<f.length;u+=1)f[u].c();N=P(),d&&d.c(),R=P(),E=v("div"),S=v("textarea"),K=P(),C=v("button"),U=st("发送"),h(s,"class","b3-button svelte-t24sax"),p.__value="",q(p,p.__value),p.disabled=!0,p.selected=!0,h(a,"class","b3-select svelte-t24sax"),h(a,"title","加载历史对话"),h(n,"class","conversation-controls svelte-t24sax"),h(y,"class","chat-history svelte-t24sax"),h(S,"placeholder","在此输入您的问题或指令..."),h(S,"rows","3"),S.disabled=t[2],h(S,"class","svelte-t24sax"),C.disabled=b=!t[0].trim()||t[2],h(C,"class","svelte-t24sax"),h(E,"class","input-area svelte-t24sax"),h(e,"class","ai-chat-panel svelte-t24sax")},m(u,w){z(u,e,w),g(e,n),g(n,s),g(n,o),k&&k.m(n,null),g(n,r),g(n,a),g(a,p);for(let A=0;A<c.length;A+=1)c[A]&&c[A].m(a,null);g(n,_),M&&M.m(n,null),g(e,D),g(e,y);for(let A=0;A<f.length;A+=1)f[A]&&f[A].m(y,null);g(y,N),d&&d.m(y,null),t[15](y),g(e,R),g(e,E),g(E,S),q(S,t[0]),g(E,K),g(E,C),g(C,U),T||(I=[j(s,"click",t[7]),j(a,"change",t[13]),j(S,"input",t[16]),j(S,"keydown",t[17]),j(C,"click",t[11])],T=!0)},p(u,w){w[0]&20&&(i=x(u[6]).length>1&&!u[4]&&!u[2]),i?k?k.p(u,w):(k=It(u),k.c(),k.m(n,r)):k&&(k.d(1),k=null),w[0]&8&&(J=lt(u[3]),c=kt(c,w,V,1,u,J,F,a,Dt,At,null,St)),u[4]?M?M.p(u,w):(M=Et(u),M.c(),M.m(n,null)):M&&(M.d(1),M=null),w[0]&32&&(l=lt(u[5]),f=kt(f,w,m,1,u,l,H,y,Dt,Ft,N,Ct)),u[2]?d||(d=Tt(),d.c(),d.m(y,null)):d&&(d.d(1),d=null),w[0]&4&&(S.disabled=u[2]),w[0]&1&&q(S,u[0]),w[0]&5&&b!==(b=!u[0].trim()||u[2])&&(C.disabled=b)},i:L,o:L,d(u){u&&O(e),k&&k.d();for(let w=0;w<c.length;w+=1)c[w].d();M&&M.d();for(let w=0;w<f.length;w+=1)f[w].d();d&&d.d(),t[15](null),T=!1,$(I)}}}function de(){console.log("Loading messages (ensure format is correct)...")}function fe(t,e,n){let s,{pluginData:o}=e,i=ot([]);Qt(t,i,l=>n(5,s=l));let r="",a,p=!1,c,F=[],_=null,D=null,y="";const f=ct.subscribe(l=>{c=l}),H=bt.subscribe(l=>{n(3,F=l.sort((m,d)=>d.timestamp-m.timestamp))}),N=at.subscribe(l=>{D=l}),R=rt.subscribe(l=>{});Ht(async()=>{const l="有什么可以帮您？";i.set([{id:Date.now().toString()+"init",role:"assistant",content:l,html:tt(l)}]),de(),await Z(),b()}),Xt(()=>{f(),H(),N(),R()});async function E(){x(i).length>1&&!_&&!p&&(console.log("Auto-saving previous conversation..."),await S());const l="新对话已开始，有什么可以帮您？",m=tt(l);i.update(d=>[...d,{role:"assistant",content:l,html:m}]),n(4,_=null),n(0,r=""),await Z(),b()}async function S(){if(p||x(i).length<=1||_)return;const l=Date.now(),m=l.toString(),d=`对话 ${new Date(l).toLocaleString()}`,w=[{id:m,name:d,timestamp:l,messages:x(i).filter(A=>A.role==="user"||A.role==="assistant").map(({role:A,content:it})=>({role:A,content:it}))},...F];await o.saveConversations(w),n(4,_=m),console.log("Conversation saved with ID:",m)}function K(l){const m=F.find(d=>d.id===l);m&&(i.update(d=>m.messages.map((u,w)=>({...u,id:w,html:u.role==="assistant"?tt(u.content):void 0}))),n(4,_=m.id),x(i).length,n(0,r=""),Z().then(b),console.log("Conversation loaded:",l))}async function C(l,m){if(m.stopPropagation(),confirm("确定要删除这个对话吗？")){const d=F.filter(u=>u.id!==l);await o.saveConversations(d),_===l&&E(),console.log("Conversation deleted:",l)}}async function U(){if(!r.trim()||p)return;y="",n(2,p=!0);const m={id:Date.now().toString()+Math.random().toString(36).substring(2,9),role:"user",content:r.trim()};i.update(B=>[...B,m]),i.set([...x(i)]),console.log("User message added to store:",x(i)),r.trim(),n(0,r=""),await Z(),b();let d="";if(D)try{console.log(`Attempting to fetch context for document ID: ${D}`),d=await T(),console.log("Fetched document context length:",(d==null?void 0:d.length)??0)}catch(B){console.error("Error fetching document context:",B),y=`获取文档上下文失败: ${B.message}`}else console.log("No currentDocId, skipping context fetch.");const w=x(i).filter(B=>B.role==="user"||B.role==="assistant").slice(-20).map(B=>({role:B.role,content:B.content}));let A="You are a helpful AI assistant integrated into Siyuan Note.";d&&(A+=`

Current document context:
---
${d}
---"`);const it=[{role:"system",content:A},...w];console.log("Messages being sent to API (final format):",it);try{const B=await ae(it,c),ut={id:Date.now().toString()+Math.random().toString(36).substring(2,9),role:"assistant",content:B,html:tt(B)};i.update(dt=>[...dt,ut]),i.set([...x(i)]),console.log("Assistant message added to store:",x(i))}catch(B){console.error("Error fetching chat completion:",B),y=`AI 请求失败: ${B.message}`;const ut={id:Date.now().toString()+Math.random().toString(36).substring(2,9),role:"assistant",content:`抱歉，请求出错: ${y}`,html:tt(`抱歉，请求出错: ${y}`)};i.update(dt=>[...dt,ut]),i.set([...x(i)]),console.log("Error message added to store:",x(i))}finally{n(2,p=!1),await Z(),b()}}function b(){a&&requestAnimationFrame(()=>{n(1,a.scrollTop=a.scrollHeight,a)})}async function T(){if(!D)return console.log("getDocumentContext called without currentDocId"),"";console.log(`Using /api/export/exportMdContent with ID: ${D}`);try{const l=await fetch("/api/export/exportMdContent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:D})}),m=await l.text();if(console.log(`Raw response from /api/export/exportMdContent (Status: ${l.status}):`,m),!l.ok)throw new Error(`API request failed with status ${l.status}: ${m}`);if(!m)return console.log("exportMdContent API returned an empty response body."),"";try{const d=JSON.parse(m);if(d.code!==0)throw new Error(`API returned error code ${d.code}: ${d.msg}`);return d.data&&d.data.content?(console.log("exportMdContent API successful, parsed JSON, returning content."),d.data.content):(console.log("exportMdContent API returned success code, but no data.content found. Response data:",d.data),"")}catch(d){throw console.error("Failed to parse response from exportMdContent as JSON:",d),new Error(`Failed to parse API response: ${d.message}`)}}catch(l){return console.error("Error fetching or processing content via exportMdContent:",l),y=`获取文档上下文时出错: ${l.message}`,""}}const I=l=>K(l.currentTarget.value),k=l=>C(_,l);function J(l){gt[l?"unshift":"push"](()=>{a=l,n(1,a)})}function V(){r=this.value,n(0,r)}const M=l=>{l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),U())};return t.$$set=l=>{"pluginData"in l&&n(12,o=l.pluginData)},[r,a,p,F,_,s,i,E,S,K,C,U,o,I,k,J,V,M]}class he extends Jt{constructor(e){super(),zt(this,e,fe,ue,_t,{pluginData:12},null,[-1,-1])}}function Mt(t){let e,n;return{c(){e=v("span"),n=st(t[3]),h(e,"class","status-message svelte-136cw2s")},m(s,o){z(s,e,o),g(e,n)},p(s,o){o&8&&Ut(n,s[3])},d(s){s&&O(e)}}}function ge(t){let e,n,s,o,i,r,a,p,c,F,_,D,y,f,H,N,R,E,S,K,C,U,b,T,I,k,J,V,M,l=t[3]&&Mt(t);return{c(){e=v("div"),n=v("h2"),n.textContent="AI 助手设置",s=P(),o=v("div"),i=v("label"),i.textContent="AI API Endpoint URL:",r=P(),a=v("input"),p=P(),c=v("p"),c.textContent="请输入您要使用的 AI 服务的完整 URL。",F=P(),_=v("div"),D=v("label"),D.textContent="API Key:",y=P(),f=v("input"),H=P(),N=v("p"),N.textContent="您的 API Key 将被保存在本地配置文件中。",R=P(),E=v("div"),S=v("label"),S.textContent="模型名称:",K=P(),C=v("input"),U=P(),b=v("p"),b.textContent="请输入要调用的具体模型名称。",T=P(),I=v("div"),k=v("button"),k.textContent="保存设置",J=P(),l&&l.c(),h(n,"class","svelte-136cw2s"),h(i,"for","api-url"),h(i,"class","svelte-136cw2s"),h(a,"id","api-url"),h(a,"type","text"),h(a,"placeholder","例如: https://api.openai.com/v1/chat/completions"),h(a,"class","b3-text-field svelte-136cw2s"),h(c,"class","description svelte-136cw2s"),h(o,"class","form-item svelte-136cw2s"),h(D,"for","api-key"),h(D,"class","svelte-136cw2s"),h(f,"id","api-key"),h(f,"type","password"),h(f,"placeholder","请输入您的 API Key"),h(f,"class","b3-text-field svelte-136cw2s"),h(N,"class","description svelte-136cw2s"),h(_,"class","form-item svelte-136cw2s"),h(S,"for","model-name"),h(S,"class","svelte-136cw2s"),h(C,"id","model-name"),h(C,"type","text"),h(C,"placeholder","例如: deepseek-chat, gpt-4o, ..."),h(C,"class","b3-text-field svelte-136cw2s"),h(b,"class","description svelte-136cw2s"),h(E,"class","form-item svelte-136cw2s"),h(k,"class","b3-button b3-button--primary"),h(I,"class","actions svelte-136cw2s"),h(e,"class","settings-panel svelte-136cw2s")},m(m,d){z(m,e,d),g(e,n),g(e,s),g(e,o),g(o,i),g(o,r),g(o,a),q(a,t[0]),g(o,p),g(o,c),g(e,F),g(e,_),g(_,D),g(_,y),g(_,f),q(f,t[1]),g(_,H),g(_,N),g(e,R),g(e,E),g(E,S),g(E,K),g(E,C),q(C,t[2]),g(E,U),g(E,b),g(e,T),g(e,I),g(I,k),g(I,J),l&&l.m(I,null),V||(M=[j(a,"input",t[8]),j(f,"input",t[9]),j(C,"input",t[10]),j(k,"click",t[4])],V=!0)},p(m,[d]){d&1&&a.value!==m[0]&&q(a,m[0]),d&2&&f.value!==m[1]&&q(f,m[1]),d&4&&C.value!==m[2]&&q(C,m[2]),m[3]?l?l.p(m,d):(l=Mt(m),l.c(),l.m(I,null)):l&&(l.d(1),l=null)},i:L,o:L,d(m){m&&O(e),l&&l.d(),V=!1,$(M)}}}function pe(t,e,n){let{loadSettings:s}=e,{saveSettings:o}=e,{currentSettings:i}=e,r="",a="",p="",c="";Ht(async()=>{if(i)n(0,r=i.apiUrl||""),n(1,a=i.apiKey||""),n(2,p=i.modelName||"deepseek-chat");else{const f=await s();n(0,r=f.apiUrl||""),n(1,a=f.apiKey||""),n(2,p=f.modelName||"deepseek-chat")}});async function F(){try{await o({apiUrl:r,apiKey:a,modelName:p}),n(3,c="设置已保存！"),setTimeout(()=>n(3,c=""),3e3)}catch(f){n(3,c=`保存失败: ${f.message}`)}}function _(){r=this.value,n(0,r)}function D(){a=this.value,n(1,a)}function y(){p=this.value,n(2,p)}return t.$$set=f=>{"loadSettings"in f&&n(5,s=f.loadSettings),"saveSettings"in f&&n(6,o=f.saveSettings),"currentSettings"in f&&n(7,i=f.currentSettings)},[r,a,p,c,F,s,o,i,_,D,y]}class me extends Jt{constructor(e){super(),zt(this,e,pe,ge,_t,{loadSettings:5,saveSettings:6,currentSettings:7})}}const Pt="ai-assistant-config",Bt="ai-assistant-conversations",be={apiUrl:"",apiKey:"",modelName:"deepseek-chat"},_e="ai_assistant_dock";class ve extends ft.Plugin{constructor(){super(...arguments);G(this,"isMobile");G(this,"settings");G(this,"settingsDialog",null);G(this,"switchProtyleCallback",this.handleSwitchProtyle.bind(this))}async onload(){console.log("--- siyuan-plugin-canvas onload --- Fired");const n=ft.getFrontend();this.isMobile=n==="mobile"||n==="browser-mobile",await this.loadSettings(),await this.loadConversations(),this.eventBus.on("switch-protyle",this.switchProtyleCallback),console.log("Event listener for 'switch-protyle' added."),this.addIcons('<symbol id="iconComment" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M896 128H128C83.8 128 48 163.8 48 208v448c0 44.2 35.8 80 80 80h176v128l237.6-128H896c44.2 0 80-35.8 80-80V208c0-44.2-35.8-80-80-80z m-48 480H581.8L512 651.7V608H176V256h672v352z" fill="#515151"></path></symbol>'),this.addDock({config:{position:"RightTop",size:{width:300,height:0},icon:"iconComment",title:this.isMobile?"AI助手":`AI助手(${this.name})`,hotkey:"⌥⌘A"},data:{plugin:this,saveConversations:this.saveConversations.bind(this)},type:_e,init(s){new he({target:s.element,props:{pluginData:s.data}}),console.log("AI Assistant Dock initialized with Svelte component")},destroy(){console.log("AI Assistant Dock destroyed")}}),console.log("Icons and Dock added.")}onLayoutReady(){console.log("--- siyuan-plugin-canvas onLayoutReady --- Fired"),setTimeout(()=>{console.log("Executing updateCurrentDocIdFromActiveTab after 500ms delay..."),this.updateCurrentDocIdFromActiveTab()},500)}handleSwitchProtyle({detail:n}){if(console.log("--- handleSwitchProtyle --- Fired"),console.log("Switch Protyle Event detail:",n),n&&n.protyle&&n.protyle.block&&n.protyle.block.rootID){const s=n.protyle.block.rootID;if(console.log(`Doc ID found in protyle.block.rootID: ${s}`),at.set(s),console.log(`Current document ID updated via switch-protyle: ${s}`),n.protyle.path){const o=n.protyle.path;console.log(`Doc Path found in protyle.path: ${o}`),rt.set(o),console.log(`Current document Path updated via switch-protyle: ${o}`)}else console.warn("Doc Path not found in protyle detail."),rt.set(null)}else console.warn("Could not find document ID (rootID) in switch-protyle event detail."),at.set(null),rt.set(null)}updateCurrentDocIdFromActiveTab(){var n;console.log("Attempting to get doc ID from active tab...");try{const s=document.querySelector(".layout__tab--active .protyle:not(.fn__none)");if(s){console.log("Active protyle tab element found.");let o=s,i=o==null?void 0:o.protyle;for(;o&&!i;)i=o==null?void 0:o.protyle,o=o.parentElement;if((n=i==null?void 0:i.block)!=null&&n.rootID){const r=i.block.rootID;at.set(r),console.log(`Updated doc ID from active tab in onLayoutReady: ${r}`)}else{console.log("Found active protyle tab, but failed to get instance or rootID.",{protyleInstance:i});const r=s.getAttribute("data-node-id");r&&console.log(`Found node-id on active tab: ${r}. Attempting to get root via API.`)}}else console.log("No active protyle tab element found in onLayoutReady.")}catch(s){console.error("Error getting doc ID from active tab:",s)}}openSetting(){this.settingsDialog||(this.settingsDialog=new ft.Dialog({title:"AI 助手设置",content:'<div id="ai-assistant-settings" style="height: 100%;"></div>',width:this.isMobile?"92vw":"600px",destroyCallback:()=>{this.settingsDialog=null}}),new me({target:this.settingsDialog.element.querySelector("#ai-assistant-settings"),props:{loadSettings:this.loadSettings.bind(this),saveSettings:this.saveSettings.bind(this),currentSettings:this.settings}}))}async loadSettings(){const n=await this.loadData(Pt);return this.settings=Object.assign({},be,n),ct.set(this.settings),console.log("AI Assistant settings loaded and store updated:",this.settings),this.settings}async saveSettings(n){this.settings=n,await this.saveData(Pt,this.settings),ct.set(this.settings),console.log("AI Assistant settings saved and store updated.")}async loadConversations(){const n=await this.loadData(Bt)||[];bt.set(n),console.log(`${n.length} conversations loaded.`)}async saveConversations(n){await this.saveData(Bt,n),bt.set(n),console.log(`Conversations saved (${n.length} total).`)}onunload(){console.log("--- siyuan-plugin-canvas onunload --- Fired"),this.eventBus.off("switch-protyle",this.switchProtyleCallback),console.log("Event listener for 'switch-protyle' removed."),this.settingsDialog&&this.settingsDialog.destroy()}}module.exports=ve;
