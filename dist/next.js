(()=>{
"use strict";
const BASE="eosdo-next-base-v1", NEXT="eosdo-next-v1";
const $=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const base=()=>{try{return JSON.parse(localStorage.getItem(BASE))||{docs:[],orders:[]}}catch{return{docs:[],orders:[]}}};
const saveBase=s=>{localStorage.setItem(BASE,JSON.stringify(s));window.dispatchEvent(new Event("eosdo-next-change"))};
let nx;try{nx=JSON.parse(localStorage.getItem(NEXT))||{}}catch{nx={}};
nx={favorites:[],recent:[],notifications:[],routes:[],versions:{},savedSearches:[],...nx};
const save=()=>localStorage.setItem(NEXT,JSON.stringify(nx));
const toast=t=>{let x=$("#toast");if(x){x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}};
function docs(){return base().docs||[]}
function attention(){
 const d=docs(), b=base(), items=[];
 d.filter(x=>["На согласовании","На подписании","На доработке"].includes(x.status)).forEach(x=>items.push({kind:x.status,text:x.title,doc:x.id}));
 (b.orders||[]).filter(x=>x.status!=="Исполнено").forEach(x=>items.push({kind:"Поручение",text:x.text||x.title||"Поручение",doc:x.docId}));
 return items.slice(0,12);
}
function renderAttention(){
 const el=$("#nextAttention");if(!el)return;const a=attention();
 el.innerHTML=a.length?a.map(x=>`<div class="next-item"><span class="next-dot"></span><div><b>${esc(x.kind)}</b><small>${esc(x.text)}</small></div>${x.doc?`<button data-next-open="${x.doc}">Открыть</button>`:""}</div>`).join(""):"<p>Срочных действий нет.</p>";
 $("#nextAttentionCount").textContent=a.length;
}
function renderFavorites(){
 const el=$("#nextFavorites");if(!el)return;let d=docs().filter(x=>nx.favorites.includes(x.id));
 el.innerHTML=d.length?d.map(x=>`<div class="next-item"><div><b>★ ${esc(x.number)}</b><small>${esc(x.title)}</small></div><button data-next-open="${x.id}">Открыть</button></div>`).join(""):"<p>Закрепите нужные документы из реестра.</p>";
}
function renderManager(){
 const el=$("#managerWorkspace");if(!el)return;let d=docs(),b=base(), by={};d.forEach(x=>by[x.status]=(by[x.status]||0)+1);
 let active=(b.orders||[]).filter(x=>x.status!=="Исполнено").length, signed=d.filter(x=>x.status==="На подписании").length, appr=d.filter(x=>x.status==="На согласовании").length;
 el.innerHTML=`<div class="next-kpis"><article><span>Документов</span><strong>${d.length}</strong></article><article><span>На согласовании</span><strong>${appr}</strong></article><article><span>На подписании</span><strong>${signed}</strong></article><article><span>Активных поручений</span><strong>${active}</strong></article></div><div class="next-bars">${Object.entries(by).map(([k,v])=>`<div><span>${esc(k)}</span><progress max="${d.length||1}" value="${v}"></progress><b>${v}</b></div>`).join("")}</div>`;
}
function renderRoutes(){
 const el=$("#routeWorkspace");if(!el)return;
 el.innerHTML=`<div class="route-builder"><label>Название маршрута<input id="routeName" placeholder="Например: Договор поставки"></label><label>Этапы согласования<textarea id="routeSteps" placeholder="Юрист → Руководитель отдела → Директор"></textarea></label><label>Режим<select id="routeMode"><option>Последовательный</option><option>Параллельный</option></select></label><button class="primary" data-route-save>Сохранить маршрут</button></div><div class="route-list">${nx.routes.map(r=>`<div class="next-item"><div><b>${esc(r.name)}</b><small>${esc(r.mode)} · ${esc(r.steps.join(" → "))}</small></div><button data-route-delete="${r.id}">Удалить</button></div>`).join("")||"<p>Маршрутов пока нет.</p>"}</div>`;
}
function renderVersions(){
 const el=$("#versionsWorkspace");if(!el)return;let d=docs();
 el.innerHTML=`<label>Документ<select id="versionDoc"><option value="">Выберите</option>${d.map(x=>`<option value="${x.id}">${esc(x.number)} — ${esc(x.title)}</option>`).join("")}</select></label><div id="versionList"><p>Выберите документ.</p></div>`;
}
function showVersions(id){
 const el=$("#versionList");if(!el)return;let d=docs().find(x=>x.id===id),v=nx.versions[id]||[];
 el.innerHTML=d?`<div class="actions"><button class="primary" data-version-add="${id}">Создать версию</button></div>${v.map((x,i)=>`<div class="next-item"><div><b>Версия ${i+1}</b><small>${esc(x.at)} · ${esc(x.note)}</small></div></div>`).join("")||"<p>Версий пока нет.</p>"}`:"<p>Выберите документ.</p>";
}
function renderNotifications(){
 const el=$("#smartNotifications");if(!el)return;let a=attention();
 let notes=a.map(x=>({text:`${x.kind}: ${x.text}`}));
 el.innerHTML=notes.length?notes.map(n=>`<div class="notice">${esc(n.text)}</div>`).join(""):"<p>Новых предупреждений нет.</p>";
}
function enhanceDocs(){
 document.querySelectorAll("#docTable tr[data-doc],#docTable tr").forEach(tr=>{let id=tr.dataset.doc||tr.querySelector("[data-doc]")?.dataset.doc;if(!id||tr.querySelector(".next-quick"))return;let td=document.createElement("td");td.className="next-quick";td.innerHTML=`<button data-fav="${id}" title="Избранное">${nx.favorites.includes(id)?"★":"☆"}</button><button data-quick="${id}" title="Быстрое действие">⋯</button>`;tr.appendChild(td)});
}
function renderAll(){renderAttention();renderFavorites();renderManager();renderRoutes();renderVersions();renderNotifications();setTimeout(enhanceDocs,0)}
document.addEventListener("click",e=>{
 let o=e.target.closest("[data-next-open]");if(o){nx.recent=[o.dataset.nextOpen,...nx.recent.filter(x=>x!==o.dataset.nextOpen)].slice(0,10);save();document.querySelector(`[data-doc="${o.dataset.nextOpen}"]`)?.click();return}
 let f=e.target.closest("[data-fav]");if(f){let id=f.dataset.fav;nx.favorites=nx.favorites.includes(id)?nx.favorites.filter(x=>x!==id):[...nx.favorites,id];save();renderAll();toast("Избранное обновлено");return}
 let q=e.target.closest("[data-quick]");if(q){let s=base(),d=s.docs.find(x=>x.id===q.dataset.quick);if(!d)return;let choices=d.status==="На согласовании"?"Согласовать":d.status==="На подписании"?"Подписать":d.status==="Черновик"?"На согласование":"Открыть";if(choices==="Открыть"){document.querySelector(`[data-doc="${d.id}"]`)?.click();return}if(confirm(choices+" документ?")){d.history=d.history||[];if(choices==="Согласовать"){d.status="Согласован";d.history.push("Быстро согласовано")}if(choices==="Подписать"){d.status="Подписан";d.history.push("Быстро подписано")}saveBase(s);location.reload()}return}
 if(e.target.closest("[data-route-save]")){let name=$("#routeName").value.trim(),steps=$("#routeSteps").value.split(/→|,|\n/).map(x=>x.trim()).filter(Boolean);if(!name||!steps.length)return toast("Заполните название и этапы");nx.routes.push({id:"r"+Date.now(),name,steps,mode:$("#routeMode").value});save();renderRoutes();toast("Маршрут сохранён");return}
 let rd=e.target.closest("[data-route-delete]");if(rd){nx.routes=nx.routes.filter(x=>x.id!==rd.dataset.routeDelete);save();renderRoutes();return}
 let va=e.target.closest("[data-version-add]");if(va){let id=va.dataset.versionAdd,note=prompt("Комментарий к версии","Сохранено перед изменениями")||"Версия документа";nx.versions[id]=nx.versions[id]||[];nx.versions[id].push({at:new Date().toLocaleString("ru-RU"),note,snapshot:docs().find(x=>x.id===id)});save();showVersions(id);toast("Версия сохранена");return}
});
document.addEventListener("change",e=>{if(e.target.id==="versionDoc")showVersions(e.target.value)});
document.addEventListener("click",e=>{if(e.target.matches(".nav,[data-go]"))setTimeout(renderAll,30)});
window.addEventListener("eosdo-next-change",renderAll);
new MutationObserver(()=>enhanceDocs()).observe(document.body,{subtree:true,childList:true});
renderAll();
})();