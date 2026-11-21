// Daily Board UI. Plain DOM rendering; data comes in through the env adapters (see lib/adapters.js).
/* eslint-disable */
import {nextDue,REPEATS} from "./recur";
let started=false;
export function startBoard(env){
"use strict";
if(started)return;started=true;
var G={
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 001.5.86l11-6.5a1 1 0 000-1.72l-11-6.5A1 1 0 008 5.5z"/></svg>',
  sparkle:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9zM18.5 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
  drop:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8c3.6 4.3 6.5 8.1 6.5 11.4a6.5 6.5 0 01-13 0c0-3.3 2.9-7.1 6.5-11.4z"/></svg>',
  north:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l7 17.2a.6.6 0 01-.85.75L12 17l-6.15 3.45a.6.6 0 01-.85-.75z"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5s-8-4.9-8-10.6A4.4 4.4 0 0112 7.4a4.4 4.4 0 018 2.5c0 5.7-8 10.6-8 10.6z"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10.5h16M8.5 3.5v3M15.5 3.5v3"/></svg>',
  tray:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13l2.5-7.5h11L20 13v5.5H4z"/><path d="M4 13h4.5a3.5 3.5 0 007 0H20"/></svg>',
  person:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20.5c.7-4 3.9-6.5 8-6.5s7.3 2.5 8 6.5z"/></svg>',
  tick:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  chev:'<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10.5"/><path d="M12 7.5v9M7.5 12h9" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
  wand:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6zM5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9zM19 13l.7 1.8 1.8.7-1.8.7L19 18l-.7-1.8-1.8-.7 1.8-.7z"/></svg>',
  inbox:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v10M8 10l4 4 4-4"/><path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"/></svg>',
  refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
  timer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2H4.5z"/><path d="M10 21h4"/></svg>',
  rep:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V9.5A3.5 3.5 0 017.5 6H19l-3-3M20 13v1.5a3.5 3.5 0 01-3.5 3.5H5l3 3"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r="1.2" fill="currentColor"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor"/><circle cx="4.5" cy="17.5" r="1.2" fill="currentColor"/></svg>',
  add:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
var AREAS=[
  {id:"baselab",name:"Baselab",short:"Baselab",icon:"play",about:"short-form video content agency"},
  {id:"dg",name:"D&G Carpet Cleaning",short:"D&G",icon:"drop",logo:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="26" fill="#1E6BFF"/><g transform="translate(19.012 21.768) scale(0.7352)"><path d="M24.198 33.828C22.734 30.17 22.002 26.492 22.002 22.794C22.002 20.539 22.274 18.276 22.819 16.005C24.487 9.053 28.013 3.754 33.397 0.11C37.922 -2.953 43.233 -4.485 49.328 -4.485C56.371 -4.485 62.198 -2.486 66.808 1.513C71.948 5.971 74.518 11.931 74.518 19.394C74.518 25.878 72.381 31.761 68.106 37.042C65.699 40.016 61.697 43.602 56.1 47.8L52.429 50.553L93.775 97.2L81.749 97.2L45.205 55.971L38.5 61C32.919 65.186 29.074 68.604 26.964 71.254C24.656 74.153 23.503 77.162 23.503 80.283C23.503 87.756 29.013 91.493 40.033 91.493C46.745 91.493 52.672 89.52 57.813 85.576C59.428 84.337 61.048 82.848 62.675 81.109L73.983 93.866C72.063 95.826 70.122 97.559 68.161 99.064C59.967 105.35 50.591 108.493 40.033 108.493C30.715 108.493 23.052 106.256 17.043 101.783C10.016 96.552 6.503 89.385 6.503 80.283C6.503 73.202 8.89 66.663 13.664 60.666C16.678 56.879 21.557 52.457 28.3 47.4L30.976 45.393C27.867 41.206 25.608 37.351 24.198 33.828ZM72.467 67.733C72.859 67.083 73.251 66.419 73.644 65.741L83.665 48.433L98.377 56.95L88.356 74.259C86.984 76.628 85.601 78.867 84.205 80.976ZM44.566 35.201L45.9 34.2C50.372 30.846 53.369 28.228 54.892 26.347C56.642 24.184 57.518 21.867 57.518 19.394C57.518 14.808 54.788 12.515 49.328 12.515C43.869 12.515 40.542 15.001 39.35 19.972C39.129 20.89 39.019 21.813 39.019 22.739C39.019 24.319 39.339 25.909 39.981 27.511C40.862 29.713 42.39 32.276 44.566 35.201Z" fill="#FFFFFF"/><path d="M77.162 97.2L98.362 97.2C98.841 97.2 99.221 97.395 99.5 97.784L104.66 104.984C105.203 105.743 105.096 106.394 104.337 106.938C104.094 107.113 103.822 107.2 103.522 107.2L72.002 107.2C71.068 107.2 70.602 106.733 70.602 105.8C70.602 105.5 70.689 105.228 70.864 104.984L76.024 97.784C76.303 97.395 76.682 97.2 77.162 97.2Z" fill="#FFD21F"/></g></svg>',about:"local carpet and upholstery cleaning company"},
  {id:"truenorth",name:"True North",short:"True North",icon:"north",logo:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0B1433"/><g transform="translate(20.98 23) scale(1.35) translate(-4 -4)"><path d="M4 4H31.5V13.25H22.75V44H12.75V13.25H4Z" fill="#FFFFFF"/><path d="M22.75 18L35 29.35V4H47V44H35L22.75 32.65Z" fill="#1F5BFF"/></g></svg>',about:"insurance agency and True North Education courses"},
  {id:"personal",name:"Personal",short:"Personal",icon:"heart",about:"personal life, health and personal brand"}
];
var SMART=[
  {id:"today",name:"Today",color:"var(--accent)"},
  {id:"scheduled",name:"Scheduled",color:"var(--red)",icon:"cal"},
  {id:"all",name:"All",color:"#636366",icon:"tray"},
  {id:"people",name:"People",color:"var(--green)",icon:"person"}
];
var state={tasks:new Map(),people:new Map(),notes:new Map(),plans:new Map(),builds:new Map(),recaps:new Map(),logArea:"",view:"today",day:"",seg:"tasks",q:"",prev:"today",
  ready:false,slow:false,local:false,failed:false,showDone:false,
  cal:{status:"idle",events:[],msg:"",at:0},ai:null,planning:false,focus:null};
var db=null,sample=null,push=env.push||null,lastBadge=-1,chains={},noteTimer=null,undoFn=null,toastTimer=null,lastDay=ymd(new Date()),lastShown="",tlScroll=null,dumpItems=[];
var mq=window.matchMedia("(max-width:760px)");
var $=function(id){return document.getElementById(id)};

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function pad(n){return String(n).padStart(2,"0")}
function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function today(){return ymd(new Date())}
function plus(n,from){var d=from?toDate(from):new Date();d.setDate(d.getDate()+n);return ymd(d)}
function toDate(s){var p=String(s).split("-").map(Number);return new Date(p[0],p[1]-1,p[2])}
function fmt(s){return toDate(s).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}
function fmtLong(s){return toDate(s).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}
function hm(mins){if(mins>=1440)return "12 AM";var h=Math.floor(mins/60),m=mins%60,ap=h>=12?"PM":"AM",h12=h%12||12;return h12+(m?":"+pad(m):"")+" "+ap}
function hmShort(mins){var h=Math.floor(mins/60),m=mins%60,h12=h%12||12;return h12+(m?":"+pad(m):"")}
function parseHM(s){var m=/^(\d{1,2}):(\d{2})$/.exec(String(s||"").trim());if(!m)return null;var v=+m[1]*60+ +m[2];return v>=0&&v<=1440?v:null}
function hmOf(t){var m=parseHM(t&&t.atTime);return m==null||m>=1440?null:m}
function toHM(m){m=Math.max(0,Math.min(1439,Math.round(m)));return pad(Math.floor(m/60))+":"+pad(m%60)}
function setting(k,def){try{var v=localStorage.getItem("db-"+k);return v==null?def:v}catch(_){return def}}
function setSetting(k,v){try{localStorage.setItem("db-"+k,v)}catch(_){}}
function repeatName(r){var x=REPEATS.find(function(o){return o[0]===r});return x?x[1]:""}
function nowMins(){var d=new Date();return d.getHours()*60+d.getMinutes()}
function iso(d){var o=-d.getTimezoneOffset(),s=o>=0?"+":"-",a=Math.abs(o);return ymd(d)+"T"+pad(d.getHours())+":"+pad(d.getMinutes())+":00"+s+pad(Math.floor(a/60))+":"+pad(a%60)}
function newId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function areaIcon(a,cls){return a.logo?'<span class="ic logo '+(cls||"")+'">'+a.logo+"</span>":'<span class="ic sq '+(cls||"")+'">'+G[a.icon]+"</span>"}
function area(id){return AREAS.find(function(a){return a.id===id})||AREAS[3]}
function isArea(id){return AREAS.some(function(a){return a.id===id})}
function col(id){return "var(--a-"+area(id).id+")"}
function entries(coll){return Array.from(state[coll].entries()).map(function(e){return Object.assign({id:e[0]},e[1])})}
function byOrder(a,b){return (a.order||0)-(b.order||0)}
function byName(a,b){return String(a.name).localeCompare(String(b.name))}
function initials(n){return String(n||"?").trim().split(/\s+/).slice(0,2).map(function(w){return w.charAt(0).toUpperCase()}).join("")}
function lastArea(){var a=null;try{a=localStorage.getItem("db-area")}catch(_){}return isArea(a)?a:"personal"}

/* ---------- saving ---------- */
function write(coll,id,clean){
  if(!db)return;
  var k=coll+"/"+id;
  chains[k]=(chains[k]||Promise.resolve()).then(function(){return clean?db.doc(k).set(clean):db.doc(k).delete()}).catch(writeFailed);
}
function save(coll,id,data,quiet){
  var clean=JSON.parse(JSON.stringify(data));delete clean.id;
  state[coll].set(id,clean);if(!quiet)render();write(coll,id,clean);
}
function remove(coll,id){state[coll].delete(id);render();write(coll,id,null)}
function writeFailed(e){toast(e&&e.code==="quota_exceeded"?"Storage is full. Delete some old tasks, then try again.":"That change didn't save. Check your connection and try again.")}
function patchTask(id,patch,quiet){var t=state.tasks.get(id);if(!t)return;save("tasks",id,Object.assign({},t,patch),quiet)}

/* ---------- derived ---------- */
function openTasks(){return entries("tasks").filter(function(t){return !t.done})}
function dayTasks(d){var td=today();return openTasks().filter(function(t){return t.due&&(d===td?t.due<=td:t.due===d)}).sort(byOrder)}
function doneOn(d){return entries("tasks").filter(function(t){return t.done&&t.doneOn===d})}
function followUps(){var d=today();return entries("people").filter(function(p){return p.followUp&&p.followUp<=d}).sort(function(a,b){return a.followUp<b.followUp?-1:1})}
function sortByDue(x,y){if(!!x.due!==!!y.due)return x.due?-1:1;if(x.due!==y.due)return x.due<y.due?-1:1;return byOrder(x,y)}
function dueLabel(t,hideDay){
  if(!t.due)return "";var d=today(),m=hmOf(t),tm=m==null?"":hm(m),day;
  if(t.due<d)return '<span class="late">'+esc(fmt(t.due))+(tm?", "+tm:"")+"</span>";
  if(t.due===d){if(tm&&m<nowMins())return '<span class="late">'+tm+"</span>";day="Today"}
  else day=t.due===plus(1)?"Tomorrow":esc(fmt(t.due));
  return hideDay?tm:day+(tm?", "+tm:"");
}
function isTimeSoon(t){var m=hmOf(t);return t.due&&t.due<=today()&&m!=null&&m<=nowMins()+30}
function personName(id){var p=id&&state.people.get(id);return p?p.name:""}
function planFor(d){return state.plans.get(d)||null}
function blockFor(taskId,d){var p=planFor(d);if(!p||!p.blocks)return null;return p.blocks.find(function(b){return b.taskId===taskId})||null}
function busyCount(d){return eventsOn(d).filter(function(e){return !e.allDay&&!e.free&&!/^(sleep|lunch)$/i.test(e.title)}).length}
function eventsOn(d){return state.cal.events.filter(function(e){return e.day===d})}

/* ---------- pieces ---------- */
function rings(d){
  var dn=doneOn(d),open=dayTasks(d),tot=dn.length+open.length,bar="";
  AREAS.forEach(function(a){var n=dn.filter(function(t){return t.area===a.id}).length;if(n&&tot)bar+='<i style="--c:'+col(a.id)+';width:'+(n/tot*100)+'%"></i>'});
  return '<div class="prog"><div class="num"><b>'+dn.length+'</b> of '+tot+' done</div><div class="bar" role="img" aria-label="'+dn.length+' of '+tot+' done">'+bar+'</div></div>';
}
function taskRow(t,o){
  o=o||{};var a=area(t.area),bits=[],who=personName(t.person),blk=o.day?blockFor(t.id,o.day):null;
  if(blk&&hmOf(t)!=null&&blk.start!==t.atTime)blk=null;
  var dl=dueLabel(t,o.hideDue||!!blk);
  if(o.showArea)bits.push('<span class="tag">'+esc(a.short)+"</span>");
  if(t.source)bits.push('<span class="tag src">'+esc(t.source)+"</span>");
  if(dl)bits.push(dl+(t.remindMin!=null&&hmOf(t)!=null&&!t.done?'<span class="bell" aria-label="Reminder on">'+G.bell+"</span>":""));
  if(t.repeat)bits.push('<span class="rep">'+G.rep+esc(repeatName(t.repeat))+"</span>");
  if(who)bits.push(esc(who));
  if(t.note)bits.push(esc(t.note.length>64?t.note.slice(0,64)+"…":t.note));
  return '<li class="row'+(t.done?" done":"")+'" data-swipe="'+esc(t.id)+'" style="--c:'+col(t.area)+'">'+
    '<button class="check" data-act="toggle" data-id="'+esc(t.id)+'" aria-label="'+(t.done?"Mark not done: ":"Mark done: ")+esc(t.title)+'"><i></i></button>'+
    '<button class="row-main" data-act="edit-task" data-id="'+esc(t.id)+'"><span class="row-title">'+esc(t.title)+"</span>"+
    (bits.length?'<span class="row-meta">'+bits.join(" · ")+"</span>":"")+"</button>"+
    (o.next?'<button class="mini" data-act="do-next" data-id="'+esc(t.id)+'">Do next</button>':"")+
    (o.pull&&!t.done&&!(t.due&&t.due<=today())?'<button class="mini" data-act="to-today" data-id="'+esc(t.id)+'">Today</button>':"")+
    (blk?'<span class="slot">'+hmShort(parseHM(blk.start))+"–"+hm(parseHM(blk.end))+"</span>":"")+"</li>";
}
function personRow(p,o){
  o=o||{};var a=area(p.area),d=today(),bits=[];
  if(o.showArea)bits.push('<span class="tag">'+esc(a.short)+"</span>");
  if(p.org)bits.push(esc(p.org));
  if(p.followUp)bits.push(p.followUp<=d?'<span class="late">Follow up '+(p.followUp===d?"today":esc(fmt(p.followUp)))+"</span>":"Follow up "+esc(fmt(p.followUp)));
  else if(p.lastContact)bits.push("Last talked "+esc(fmt(p.lastContact)));
  return '<li class="row" style="--c:'+col(p.area)+'"><span class="avatar" aria-hidden="true">'+esc(initials(p.name))+'</span><button class="row-main" data-act="edit-person" data-id="'+esc(p.id)+'"><span class="row-title">'+esc(p.name)+"</span>"+
    (bits.length?'<span class="row-meta">'+bits.join(" · ")+"</span>":"")+'</button><button class="mini" data-act="contacted" data-id="'+esc(p.id)+'">Log contact</button></li>';
}
function areaOptions(sel,long){return AREAS.map(function(a){return '<option value="'+a.id+'"'+(a.id===sel?" selected":"")+">"+esc(long?a.name:a.short)+"</option>"}).join("")}
function addRow(key,areaId,due){
  return '<form class="add" data-area="'+(areaId||"")+'" data-due="'+(due||"")+'"><span class="plus">'+G.plus+'</span><input data-key="add-'+key+'" type="text" placeholder="New task" aria-label="New task" enterkeyhint="done" autocomplete="off"><span class="qa-hint" aria-live="polite"></span>'+
    (areaId?"":'<select data-key="sel-'+key+'" aria-label="Area">'+areaOptions(lastArea())+"</select>")+"</form>";
}
function panel(rows,extra){return '<div class="panel">'+(rows.length?'<ul class="list">'+rows.join("")+"</ul>":"")+(extra||"")+"</div>"}

/* ---------- sidebar ---------- */
function renderSide(v){
  var counts={today:dayTasks(today()).length+followUps().length,scheduled:openTasks().filter(function(t){return t.due}).length,all:openTasks().length,people:state.people.size};
  $("tiles").innerHTML=SMART.map(function(s){
    return '<button class="tile" style="--c:'+s.color+'" data-act="go" data-view="'+s.id+'"'+(v===s.id?' aria-current="page"':"")+'><span class="ic">'+(s.icon?G[s.icon]:new Date().getDate())+'</span><span class="n">'+counts[s.id]+'</span><span class="l">'+s.name+"</span></button>"}).join("");
  $("alist").innerHTML=AREAS.map(function(a){
    var n=openTasks().filter(function(t){return t.area===a.id}).length;
    return '<button class="arow" style="--c:'+col(a.id)+'" data-act="go" data-view="'+a.id+'"'+(v===a.id?' aria-current="page"':"")+'>'+areaIcon(a)+"<span>"+esc(a.name)+'</span><span class="n">'+(n||"")+"</span>"+G.chev+"</button>"}).join("")+
    '<button class="arow logrow" style="--c:var(--accent)" data-act="go" data-view="log"'+(v==="log"?' aria-current="page"':"")+'><span class="ic sq">'+G.list+"</span><span>Build log</span><span class=\"n\">"+(entries("builds").filter(function(b){return b.day===today()}).length||"")+"</span>"+G.chev+"</button>";
  var c=state.cal.status,dot=c==="ok"?"ok":(c==="idle"||c==="loading"||c==="none")?"":"warn";
  var txt=c==="ok"?"Google Calendar synced":c==="loading"?"Syncing calendar…":c==="none"?"Calendar not set up":"Calendar needs attention";
  $("sidefoot").innerHTML='<button class="status setrow" data-act="settings">'+G.bell+'<span>'+(pushInfo.on?"Reminders on":"Reminders off")+'</span><span class="setgo">Settings</span></button><button class="status" data-act="go" data-view="today"><i class="'+dot+'"></i>'+txt+"</button>";
  var tb=$("tabbar");
  if(tb){
    var cur=v==="search"?state.prev:v,tabs=[["today","Today",'<span class="tdn">'+new Date().getDate()+"</span>"+G.cal],["scheduled","Upcoming",G.cal],["quick","",G.add],["people","People",G.person],["home","Areas",G.list]];
    tb.innerHTML=tabs.map(function(x){
      if(x[0]==="quick")return '<button class="tab add" data-act="quick" aria-label="New task">'+x[2]+"</button>";
      var on=x[0]===cur||(x[0]==="home"&&(isArea(cur)||cur==="all"||cur==="log"||state.view==="home"));
      return '<button class="tab'+(x[0]==="today"?" today":"")+'" data-act="go" data-view="'+x[0]+'"'+(on?' aria-current="page"':"")+">"+x[2]+"<span>"+x[1]+"</span></button>"}).join("");
  }
}

/* ---------- schedule (right rail) ---------- */
function schedule(d){
  var c=state.cal,isToday=d===today(),h='<div class="sched-card"><div class="sched-head"><b>'+(isToday?"Schedule":esc(fmt(d)))+"</b>";
  if(c.status==="ok"||c.status==="error")h+='<button class="iconbtn" data-act="cal-refresh" aria-label="Refresh calendar">'+G.refresh+"</button>";
  h+="</div>";
  var msg="";
  if(c.status==="none")msg="Add your Google Calendar's private iCal link as GCAL_ICS_URL in Vercel to see your meetings here.";
    else if(c.status==="loading"&&!c.events.length)msg='<span class="shimmer">Loading your calendar…</span>';
  else if(c.status==="error"||c.status==="blocked")msg=esc(c.msg)+(c.retry?'<div class="row2"><button class="btn ghost" data-act="cal-connect">Try again</button></div>':"");
  if(msg)h+='<div class="cal-msg">'+msg+"</div>";
  var evs=eventsOn(d),plan=planFor(d);
  var allday=evs.filter(function(e){return e.allDay});
  if(allday.length)h+='<div class="allday">'+allday.map(function(e){return "<span>"+esc(e.title)+"</span>"}).join("")+"</div>";
  var items=[];
  evs.filter(function(e){return !e.allDay}).forEach(function(e){items.push({s:e.s,e:Math.max(e.e,e.s+15),title:e.title,ev:true,free:e.free,focus:e.focus})});
  var inPlan={};
  if(plan&&plan.blocks)plan.blocks.forEach(function(b){
    var t=state.tasks.get(b.taskId),s=parseHM(b.start),e=parseHM(b.end);if(!t||s==null||e==null)return;
    if(hmOf(t)!=null&&t.due===d&&t.atTime!==b.start)return;
    inPlan[b.taskId]=1;items.push({s:s,e:e,title:t.title,area:t.area,id:b.taskId,done:!!t.done});
  });
  entries("tasks").forEach(function(t){
    var m=hmOf(t);if(m==null||inPlan[t.id]||t.due!==d)return;
    items.push({s:m,e:Math.min(m+30,1440),title:t.title,area:t.area,id:t.id,done:!!t.done});
  });
  var H0=7,H1=23;
  items.forEach(function(it){H0=Math.min(H0,Math.floor(it.s/60));H1=Math.max(H1,Math.ceil(it.e/60))});
  H1=Math.min(H1,24);
  var PX=54,inner="";
  for(var hh=H0;hh<=H1;hh++)inner+='<div class="hr" style="top:'+(hh-H0)*PX+'px"><span>'+(hh===12?"Noon":hh===24?"12 AM":(hh%12||12)+(hh<12?" AM":" PM"))+"</span></div>";
  items.sort(function(a,b){return a.s-b.s||b.e-a.e});
  var cluster=[],cEnd=-1;
  function flush(){var lanes=[];cluster.forEach(function(it){var l=0;while(lanes[l]!=null&&lanes[l]>it.s)l++;lanes[l]=it.e;it.lane=l});cluster.forEach(function(it){it.lanes=lanes.length});cluster=[]}
  items.forEach(function(it){if(it.s>=cEnd&&cluster.length)flush();cluster.push(it);cEnd=Math.max(cEnd,it.e)});flush();
  items.forEach(function(it){
    var top=(it.s-H0*60)/60*PX,ht=Math.max(22,(it.e-it.s)/60*PX-2),w=100/it.lanes;
    var style="top:"+top+"px;height:"+ht+"px;left:calc("+(it.lane*w)+"% + 1px);width:calc("+w+"% - 3px);"+(it.area?"--c:"+col(it.area):"");
    var inner2="<b>"+esc(it.title)+"</b>"+(ht>34?"<small>"+hmShort(it.s)+"–"+hm(it.e)+"</small>":"");
    inner+=it.ev?'<div class="blk ev'+(it.free?" free":"")+(it.focus?" focus":"")+'" style="'+style+'">'+inner2+"</div>":'<button class="blk'+(it.done?" done":"")+'" style="'+style+'" data-act="edit-task" data-id="'+esc(it.id)+'">'+inner2+"</button>";
  });
  if(isToday){var nm=nowMins();if(nm>=H0*60&&nm<=H1*60)inner+='<div class="nowline" id="nowline" style="top:'+(nm-H0*60)/60*PX+'px"></div>'}
  h+='<div class="tl" id="tl" data-h0="'+H0+'"><div class="tl-inner" style="height:'+((H1-H0)*PX+12)+'px;margin-top:10px">'+inner+"</div></div></div>";
  if(!items.length&&!msg)h=h.replace('<div class="tl"','<div class="cal-msg">Nothing on the calendar. Plan my day will fill this with time blocks.</div><div class="tl"');
  return '<div class="sched">'+h+"</div>";
}

/* ---------- manager card ---------- */
function briefCard(d){
  var plan=planFor(d),isToday=d===today(),h='<section class="brief">';
  if(state.planning)h+='<p class="dim"><span class="shimmer">Planning around your calendar…</span></p>';
  else if(plan&&plan.brief)h+="<p>"+esc(plan.brief)+"</p>";
  else h+='<p class="dim">'+(isToday?"No plan yet. Plan my day puts your tasks in order and gives each one a time slot around your calendar.":"No plan for this day yet.")+"</p>";
  if(state.ai!==false){
    h+='<div class="acts"><button class="btn" data-act="plan"'+(state.planning?" disabled":"")+">"+(plan?"Re-plan":"Plan my day")+'</button><button class="btn ghost" data-act="dump">Brain dump</button>'+
      (isToday&&dayTasks(d).length>3?'<button class="btn ghost" data-act="push-rest">Move the rest to tomorrow</button>':"")+
      (plan&&plan.created&&!state.planning?'<span class="meta" style="margin-left:auto">Planned at '+esc(new Date(plan.created).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}))+"</span>":"")+"</div>";
  }else h+='<div class="meta">Planning needs ANTHROPIC_API_KEY in Vercel.</div>';
  return h+"</section>";
}

/* ---------- pages ---------- */
function pageToday(){
  var td=today(),d=state.day||td,isToday=d===td,tasks=dayTasks(d),done=doneOn(d),dt=toDate(d),h="";
  h+='<div class="hero"><div class="grow"><div class="kicker">'+esc(dt.toLocaleDateString(undefined,{weekday:"long"}))+(isToday?"":" · "+(d===plus(1)?"Tomorrow":"Upcoming"))+"</div><h1>"+esc(dt.toLocaleDateString(undefined,{month:"long",day:"numeric"}))+'</h1><div class="sub">'+
    (tasks.length?tasks.length+" to do":"Nothing planned")+(done.length?" · "+done.length+" done":"")+(busyCount(d)?" · "+busyCount(d)+" on your calendar":"")+"</div></div>"+rings(d)+"</div>";
  if(isToday)h+=nudge();
  h+='<div class="week" role="group" aria-label="Pick a day">';
  for(var i=0;i<7;i++){
    var dd=plus(i),ts=dayTasks(dd),x=toDate(dd),ne=eventsOn(dd).length;
    h+='<button class="day'+(i===0?" is-today":"")+'" data-act="day" data-day="'+dd+'" aria-pressed="'+(dd===d)+'" aria-label="'+esc(fmtLong(dd))+", "+ts.length+' tasks"><span class="wd">'+esc(x.toLocaleDateString(undefined,{weekday:"short"}))+'</span><span class="dn">'+x.getDate()+'</span><span class="dots">'+
      ts.slice(0,4).map(function(t){return '<i style="--c:'+col(t.area)+'"></i>'}).join("")+(ne?'<i style="--c:var(--ev)"></i>':"")+(ts.length>4?"<span>+"+(ts.length-4)+"</span>":"")+"</span></button>";
  }
  h+="</div>";
  var planned=!!(planFor(d)&&planFor(d).brief)&&!state.planning;
  if(!planned||!isToday)h+=briefCard(d);
  var rest=tasks;
  if(isToday&&tasks.length){
    var soon=tasks.filter(isTimeSoon).sort(function(x,y){return hmOf(x)-hmOf(y)})[0],n=soon||tasks[0],a=area(n.area),who=personName(n.person),blk=hmOf(n)==null?blockFor(n.id,d):null;rest=tasks.filter(function(x){return x!==n});
    var f=state.focus&&state.focus.id===n.id?state.focus:null;
    h+='<section class="now" style="--c:'+col(n.area)+'"><button class="bigcheck" data-act="toggle" data-id="'+esc(n.id)+'" aria-label="Mark done: '+esc(n.title)+'">'+G.tick+'</button><div class="body"><div class="label"><span class="nowtag">Do this now</span>'+esc(a.name)+(blk?' <span class="time">'+hmShort(parseHM(blk.start))+"–"+hm(parseHM(blk.end))+"</span>":hmOf(n)!=null?' <span class="time">'+dueLabel(n,true)+"</span>":"")+(n.repeat?' <span class="time">'+esc(repeatName(n.repeat))+"</span>":"")+'</div><div class="title">'+esc(n.title)+"</div>"+
      ((n.due<td||who)?'<div class="meta">'+(n.due<td?'<span class="late">From '+esc(fmt(n.due))+"</span>":"")+(n.due<td&&who?" · ":"")+esc(who)+"</div>":"")+
      (n.note?'<div class="meta">'+esc(n.note)+"</div>":"")+
      '<div class="pills"><button class="btn donebtn" data-act="toggle" data-id="'+esc(n.id)+'">'+G.tick+'Done</button><button class="pill" data-act="snooze" data-id="'+esc(n.id)+'">Snooze</button><button class="pill'+(f?" on":"")+'" data-act="focus" data-id="'+esc(n.id)+'">'+G.timer+(f?'<span class="timer" id="timer">'+timerText()+"</span>":"Focus")+'</button><button class="pill" data-act="edit-task" data-id="'+esc(n.id)+'">Details</button></div></div></section>';
  }else if(isToday){
    h+='<section class="now"><div class="body"><div class="label">Now</div><div class="title">'+(done.length?"Everything for today is done.":"Nothing planned yet.")+'</div><div class="meta">'+(done.length?"Nice work. Plan tomorrow from the week strip, or pull something forward.":"Type a task below, brain dump everything on your mind, or tap Today on anything in your areas.")+"</div></div></section>";
  }
  var tip=mq.matches&&rest.length&&setting("tip-swipe","")!=="1"?'<div class="tip"><span>Swipe a task right to finish it, left to snooze it. Tap it for details.</span><button class="link" data-act="tip-off">Got it</button></div>':"";
  h+="<section><h2>"+(isToday?"Up next":"Planned")+' <span class="n">'+(rest.length||"")+"</span></h2>"+tip+panel(rest.map(function(t){return taskRow(t,{showArea:true,hideDue:!isToday||t.due===td,next:isToday,day:d})}),addRow("day",null,d))+"</section>";
  if(isToday){
    var fu=followUps();
    if(fu.length)h+='<section style="--c:var(--green)"><h2>Follow up <span class="n">'+fu.length+"</span></h2>"+panel(fu.map(function(p){return personRow(p,{showArea:true})}))+"</section>";
    if(planned)h+=briefCard(d);
  }
  if(done.length)h+='<section><button class="link" data-act="show-done">'+(state.showDone?"Hide":"Show")+" "+done.length+" completed</button>"+(state.showDone?'<div style="margin-top:8px">'+panel(done.map(function(t){return taskRow(t,{showArea:true,hideDue:true})}))+"</div>":"")+"</section>";
  return '<div class="cols"><div class="colmain">'+h+"</div>"+schedule(d)+"</div>";
}
function pageScheduled(){
  var td=today(),open=openTasks(),dated=open.filter(function(t){return t.due}),h='<div class="hero" style="--c:var(--red)"><div class="grow"><h1>Scheduled</h1><div class="sub">'+dated.length+" with a date</div></div></div>";
  var late=dated.filter(function(t){return t.due<td}).sort(function(a,b){return a.due<b.due?-1:1});
  if(late.length)h+='<section style="--c:var(--red)"><h2>Overdue <span class="n">'+late.length+'</span><span class="sp"></span><button class="link" data-act="late-today">Move all to today</button></h2>'+panel(late.map(function(t){return taskRow(t,{showArea:true,pull:true})}))+"</section>";
  var days=[td,plus(1)];
  dated.forEach(function(t){if(t.due>=td&&days.indexOf(t.due)<0)days.push(t.due)});
  days.sort().forEach(function(d,i){
    var ts=dated.filter(function(t){return t.due===d}).sort(byOrder);
    h+="<section><h2>"+(d===td?"Today":d===plus(1)?"Tomorrow":esc(fmtLong(d)))+' <span class="n">'+(ts.length||"")+"</span></h2>"+panel(ts.map(function(t){return taskRow(t,{showArea:true,hideDue:true,pull:true})}),i<2?addRow("s"+i,null,d):"")+"</section>";
  });
  return '<div class="single">'+h+"</div>";
}
function pageAll(){
  var open=openTasks(),td=today(),h='<div class="hero"><div class="grow"><h1>All</h1><div class="sub">'+open.length+" open across "+AREAS.length+" areas</div></div></div>";
  h+='<div class="acards">'+AREAS.map(function(a){
    var mine=open.filter(function(t){return t.area===a.id}),due=mine.filter(function(t){return t.due&&t.due<=td}).length;
    return '<button class="acard" style="--c:'+col(a.id)+'" data-act="go" data-view="'+a.id+'"><span class="top">'+areaIcon(a)+'<span class="big">'+mine.length+'</span></span><span><span class="nm">'+esc(a.short)+'</span><br><span class="st">'+due+" due today · "+entries("people").filter(function(p){return p.area===a.id}).length+" people</span></span></button>"}).join("")+"</div>";
  AREAS.forEach(function(a){
    var ts=open.filter(function(t){return t.area===a.id}).sort(sortByDue);
    h+='<section style="--c:'+col(a.id)+'"><h2>'+esc(a.name)+' <span class="n">'+(ts.length||"")+"</span></h2>"+panel(ts.map(function(t){return taskRow(t,{pull:true})}),addRow("all-"+a.id,a.id,""))+"</section>";
  });
  return '<div class="single">'+h+"</div>";
}
function pagePeople(){
  var ps=entries("people"),h='<div class="hero" style="--c:var(--green)"><div class="grow"><h1>People</h1><div class="sub">'+ps.length+(ps.length===1?" person":" people")+" · "+followUps().length+' to follow up</div></div><button class="btn" data-act="new-person">Add person</button></div>';
  if(!ps.length)return '<div class="single">'+h+'<div class="panel"><div class="empty">Add clients, leads and anyone you need to stay in touch with. Give them a follow-up date and they show up in Today when it arrives.</div></div></div>';
  AREAS.forEach(function(a){
    var mine=ps.filter(function(p){return p.area===a.id}).sort(byName);
    if(mine.length)h+='<section style="--c:'+col(a.id)+'"><h2>'+esc(a.name)+' <span class="n">'+mine.length+"</span></h2>"+panel(mine.map(function(p){return personRow(p)}))+"</section>";
  });
  return '<div class="single">'+h+"</div>";
}
function pageArea(id){
  var a=area(id),td=today(),open=openTasks().filter(function(t){return t.area===id}).sort(sortByDue),ppl=entries("people").filter(function(p){return p.area===id}).sort(byName);
  var due=open.filter(function(t){return t.due&&t.due<=td}).length;
  var h='<div class="hero" style="--c:'+col(id)+'">'+areaIcon(a,"lg")+'<div class="grow"><h1>'+esc(a.name)+'</h1><div class="sub">'+open.length+" open · "+due+" today · "+ppl.length+(ppl.length===1?" person":" people")+"</div></div></div>";
  h+='<div class="seg" role="group" aria-label="Section">'+["tasks","people","notes","log"].map(function(s){return '<button data-act="seg" data-seg="'+s+'" aria-pressed="'+(state.seg===s)+'">'+s.charAt(0).toUpperCase()+s.slice(1)+"</button>"}).join("")+"</div>";
  if(state.seg==="tasks"){
    var done=entries("tasks").filter(function(t){return t.done&&t.area===id}).sort(function(x,y){return x.doneOn<y.doneOn?1:-1}).slice(0,30);
    h+="<section>"+panel(open.map(function(t){return taskRow(t,{pull:true})}),addRow("area-"+id,id,""))+"</section>";
    if(done.length)h+='<section><button class="link" data-act="show-done">'+(state.showDone?"Hide":"Show")+" "+done.length+" completed</button>"+(state.showDone?'<div style="margin-top:8px">'+panel(done.map(function(t){return taskRow(t,{hideDue:true})}))+"</div>":"")+"</section>";
  }else if(state.seg==="people"){
    h+="<section>"+panel(ppl.map(function(p){return personRow(p)}),ppl.length?"":'<div class="empty">Nobody here yet.</div>')+'<div style="margin-top:12px"><button class="btn" data-act="new-person" data-area="'+id+'">Add person</button></div></section>';
  }else if(state.seg==="log"){
    h+=logDays(id,14);
  }else{
    var n=state.notes.get(id);
    h+='<section class="notes"><textarea data-key="note-'+id+'" data-area="'+id+'" aria-label="Notes for '+esc(a.name)+'" placeholder="Ideas, numbers and things to remember for '+esc(a.name)+'">'+esc(n&&n.text||"")+'</textarea><div class="saved" id="note-saved"></div></section>';
  }
  return '<div class="single" style="--c:'+col(id)+'">'+h+"</div>";
}
/* ---------- build log ---------- */
function buildsFor(areaId){return entries("builds").filter(function(b){return !areaId||b.area===areaId}).sort(function(a,b){return a.day===b.day?(a.atTime<b.atTime?1:-1):(a.day<b.day?1:-1)})}
function dayLabel(d){var td=today();return d===td?"Today":d===plus(-1)?"Yesterday":fmtLong(d)}
function timeLabel(s){var m=parseHM(s);return m==null?"":hm(m)}
function buildRow(b,o){
  o=o||{};var bits=[];
  if(o.showArea)bits.push('<span class="tag">'+esc(area(b.area).short)+"</span>");
  if(b.atTime)bits.push(esc(timeLabel(b.atTime)));
  if(b.live)bits.push('<span class="live">Live</span>');
  if(b.openItems)bits.push("Open items");
  if(b.size==="small")bits.push("Small fixes");
  return '<li class="row done build" style="--c:'+col(b.area)+'"><span class="check" aria-hidden="true"><i></i></span><button class="row-main" data-act="open-build" data-id="'+esc(b.id)+'"><span class="row-title">'+esc(b.title)+"</span>"+
    (b.summary?'<span class="row-sum">'+esc(b.summary)+"</span>":"")+(bits.length?'<span class="row-meta">'+bits.join(" · ")+"</span>":"")+"</button></li>";
}
function recapBlock(d,areaId){
  var r=state.recaps.get(d);if(!r)return "";
  var t=areaId?(r.areas&&r.areas[areaId])||"":r.text;
  if(!t)return "";
  return '<div class="recap">'+t.split(/\n{2,}/).map(function(p){return "<p>"+esc(p.replace(/^[-*]\s+/gm,""))+"</p>"}).join("")+"</div>";
}
function logDays(areaId,limit){
  var bs=buildsFor(areaId),days=[],h="";
  bs.forEach(function(b){if(days.indexOf(b.day)<0)days.push(b.day)});
  Array.from(state.recaps.keys()).forEach(function(d){if(days.indexOf(d)<0&&recapBlock(d,areaId))days.push(d)});
  days.sort().reverse();
  if(!days.length)return '<div class="panel"><div class="empty">Nothing logged yet. When a Claude session finishes real work'+(areaId?" for "+esc(area(areaId).name):"")+', it adds an entry here, and a recap of the day is written at 9 PM.</div></div>';
  days.slice(0,limit||30).forEach(function(d){
    var mine=bs.filter(function(b){return b.day===d});
    h+="<section><h2>"+esc(dayLabel(d))+' <span class="n">'+(mine.length||"")+"</span></h2>"+recapBlock(d,areaId)+(mine.length?panel(mine.map(function(b){return buildRow(b,{showArea:!areaId})})):"")+"</section>";
  });
  return h;
}
function pageLog(){
  var a=state.logArea,bs=buildsFor(a),wk=plus(-6),n=bs.filter(function(b){return b.day>=wk}).length;
  var h='<div class="hero"><div class="grow"><h1>Build log</h1><div class="sub">'+n+" this week"+(a?" in "+esc(area(a).short):"")+"</div></div></div>";
  h+='<div class="chips" role="group" aria-label="Filter by area"><button class="chip'+(a?"":" on")+'" data-act="log-area" data-area="">All</button>'+AREAS.map(function(x){return '<button class="chip'+(a===x.id?" on":"")+'" style="--c:'+col(x.id)+'" data-act="log-area" data-area="'+x.id+'"><span class="dot"></span>'+esc(x.short)+"</button>"}).join("")+"</div>";
  return '<div class="single">'+h+logDays(a)+"</div>";
}
function buildSheet(id){
  var b=state.builds.get(id);if(!b)return;
  var pts=(b.points||[]).filter(Boolean);
  openSheet('<h3>'+esc(b.title)+'</h3><p class="lead">'+esc(area(b.area).name)+" · "+esc(fmtLong(b.day))+(b.atTime?" · "+esc(timeLabel(b.atTime)):"")+(b.live?" · Live":"")+"</p>"+
    (b.summary?'<p class="bsum">'+esc(b.summary)+"</p>":"")+
    (pts.length?'<div class="field"><label>What changed</label><ul class="bpts">'+pts.map(function(x){return "<li>"+esc(x)+"</li>"}).join("")+"</ul></div>":"")+
    (b.openItems?'<div class="field"><label>Still open</label><p class="bsum">'+esc(b.openItems)+"</p></div>":"")+
    (b.link?'<div class="field"><label>Where</label><p class="bsum">'+(/^https?:\/\//.test(b.link)?'<a href="'+esc(b.link)+'" target="_blank" rel="noopener">'+esc(b.link)+"</a>":esc(b.link))+"</p></div>":"")+
    '<div class="foot"><button class="link" data-act="del-build" data-id="'+esc(id)+'" style="color:var(--red)">Delete</button><span class="sp"></span><button class="btn" data-act="close">Done</button></div>');
}

function pageSearch(){
  var q=state.q.toLowerCase(),ts=entries("tasks").filter(function(t){return (t.title+" "+(t.note||"")).toLowerCase().indexOf(q)>=0}).sort(function(a,b){return (a.done?1:0)-(b.done?1:0)}).slice(0,60);
  var ps=entries("people").filter(function(p){return (p.name+" "+(p.org||"")+" "+(p.note||"")).toLowerCase().indexOf(q)>=0}).slice(0,30);
  var h='<div class="hero"><div class="grow"><h1>Results</h1><div class="sub">'+esc('"'+state.q+'"')+"</div></div></div>";
  if(!ts.length&&!ps.length)return '<div class="single">'+h+'<div class="panel"><div class="empty">Nothing matches.</div></div></div>';
  if(ts.length)h+="<section><h2>Tasks</h2>"+panel(ts.map(function(t){return taskRow(t,{showArea:true})}))+"</section>";
  if(ps.length)h+="<section><h2>People</h2>"+panel(ps.map(function(p){return personRow(p,{showArea:true})}))+"</section>";
  return '<div class="single">'+h+"</div>";
}

/* ---------- render ---------- */
function render(){
  var v=state.view;if(v==="home"&&!mq.matches)v="today";
  $("app").dataset.view=state.view==="home"&&mq.matches?"home":v;
  renderSide(v);
  var shown=state.view==="home"?"today":v,page=$("page"),keep={},h="",msg="";
  page.querySelectorAll("[data-key]").forEach(function(el){keep[el.dataset.key]={v:el.value,f:document.activeElement===el,s:el.selectionStart,e:el.selectionEnd}});
  var tl=$("tl");if(tl)tlScroll=tl.scrollTop;
  if(state.local)msg="Can't reach your database. Check your connection.";
  else if(state.failed)msg="Your saved board stopped responding. Reopen the page to reconnect.";
  else if(state.slow)msg="Can't reach your saved tasks yet. Still trying.";
  if(msg)h+='<div class="banner" style="margin-bottom:18px">'+msg+"</div>";
  if(!state.ready)h+='<div class="single"><div class="hero"><div class="grow"><h1>Daily Board</h1><div class="sub"><span class="shimmer">Loading your board…</span></div></div></div></div>';
  else if(shown==="search")h+=pageSearch();
  else if(shown==="scheduled")h+=pageScheduled();
  else if(shown==="all")h+=pageAll();
  else if(shown==="people")h+=pagePeople();
  else if(shown==="log")h+=pageLog();
  else if(isArea(shown))h+=pageArea(shown);
  else h+=pageToday();
  page.innerHTML=h;
  page.querySelectorAll("[data-key]").forEach(function(el){
    var x=keep[el.dataset.key];if(!x)return;
    if(el.tagName!=="TEXTAREA"||x.f)el.value=x.v;
    if(x.f){el.focus();try{el.setSelectionRange(x.s,x.e)}catch(_){}}
  });
  tl=$("tl");
  if(tl){
    if(tlScroll!=null&&shown===lastShown)tl.scrollTop=tlScroll;
    else{var nl=$("nowline"),first=tl.querySelector(".blk");tl.scrollTop=Math.max(0,(nl?nl.offsetTop:first?first.offsetTop:2*54)-90)}
  }
  if(push&&state.ready){var bn=dayTasks(today()).length;if(bn!==lastBadge){lastBadge=bn;push.badge(bn)}}
  if(shown!==lastShown){lastShown=shown;$("main").scrollTop=0;page.classList.remove("enter");void page.offsetWidth;page.classList.add("enter")}
}

/* ---------- focus timer ---------- */
var focusTick=null;
function timerText(){if(!state.focus)return "";var left=Math.max(0,Math.round((state.focus.end-Date.now())/1000));return Math.floor(left/60)+":"+pad(left%60)}
function toggleFocus(id){
  if(state.focus&&state.focus.id===id){state.focus=null;clearInterval(focusTick);render();return}
  state.focus={id:id,end:Date.now()+25*60000};clearInterval(focusTick);
  focusTick=setInterval(function(){
    if(!state.focus){clearInterval(focusTick);return}
    if(Date.now()>=state.focus.end){var t=state.tasks.get(state.focus.id);state.focus=null;clearInterval(focusTick);render();toast("Focus session done"+(t?": "+t.title:""));return}
    var el=$("timer");if(el)el.textContent=timerText();
  },1000);
  render();
}

/* ---------- Google Calendar ---------- */
function setCal(p){Object.assign(state.cal,p);render()}
function calError(e){
  var code=e&&e.code;
  if(code==="not_configured")return {status:"none",msg:""};
  if(code==="unauthorized"||code==="forbidden")return {status:"error",msg:"Your account isn't allowed to read the calendar. Check ALLOWED_EMAIL in Vercel.",retry:false};
  if(code==="fetch_failed")return {status:"error",msg:"Google Calendar didn't answer. Check that the private calendar link is still valid.",retry:true};
  return {status:"error",msg:"Couldn't load your calendar.",retry:true};
}
function localISO(d){return ymd(d)+"T"+pad(d.getHours())+":"+pad(d.getMinutes())+":00"}
function calInput(){return {startTime:localISO(toDate(today())),endTime:localISO(toDate(plus(8))),pageSize:250,orderBy:"startTime"}}
function cleanTitle(t){return String(t||"").replace(/^[^\p{L}\p{N}]+/u,"").trim()||"Busy"}
function parseWhen(v){
  if(!v)return null;
  if(typeof v==="object")v=v.dateTime||v.date_time||v.datetime||v.date||v.value||null;
  if(typeof v!=="string")return null;
  if(/^\d{4}-\d{2}-\d{2}$/.test(v))return {day:v,mins:0,allDay:true};
  var d=new Date(v);if(isNaN(d))return null;
  return {day:ymd(d),mins:d.getHours()*60+d.getMinutes(),allDay:false,date:d};
}
function findEvents(p){
  if(typeof p==="string"){try{p=JSON.parse(p)}catch(_){return null}}
  var out=null;
  function isEv(o){return o&&typeof o==="object"&&!Array.isArray(o)&&(o.start||o.startTime||o.start_time)&&(o.summary||o.title||o.name||o.subject)}
  (function walk(x,depth){
    if(out||depth>6||!x||typeof x!=="object")return;
    if(Array.isArray(x)){if(x.some(isEv)){out=x.filter(isEv);return}x.forEach(function(y){walk(y,depth+1)})}
    else Object.keys(x).forEach(function(key){walk(x[key],depth+1)});
  })(p,0);
  if(!out&&p&&typeof p==="object")out=[];
  return out;
}
function normEvents(list){
  var res=[];
  list.forEach(function(o){
    if(o.status==="cancelled")return;
    var s=parseWhen(o.start||o.startTime||o.start_time),e=parseWhen(o.end||o.endTime||o.end_time);if(!s)return;
    var title=cleanTitle(o.summary||o.title||o.name||o.subject),free=o.transparency==="transparent"||o.availability==="AVAILABILITY_FREE",focus=/focus/i.test(title)||o.eventType==="FOCUS_TIME";
    if(s.allDay){
      var last=e&&e.allDay?plus(-1,e.day):s.day;
      for(var d=s.day,i=0;d<=last&&i<14;d=plus(1,d),i++)res.push({day:d,allDay:true,title:title});
      return;
    }
    var endM=e&&!e.allDay?(e.day===s.day?e.mins:1440):s.mins+30;
    res.push({day:s.day,allDay:false,s:s.mins,e:Math.max(endM,s.mins+15),title:title,free:free,focus:focus});
    if(e&&!e.allDay&&e.day>s.day&&e.mins>0)res.push({day:e.day,allDay:false,s:0,e:e.mins,title:title,free:free,focus:focus});
  });
  return res;
}
async function fetchCal(fromClick){
  if(!env.calendar)return;
  setCal({status:"loading",retry:false});
  try{
    var res=await env.calendar();
    var list=findEvents(res);
    if(list==null){setCal({status:"error",msg:"The calendar answered in a format this app can't read.",retry:true});return}
    setCal({status:"ok",events:normEvents(list),at:Date.now(),msg:""});
  }catch(e){setCal(calError(e))}
}
function initCal(){fetchCal(false);setInterval(function(){if(!document.hidden)fetchCal(false)},10*60000)}

/* ---------- manager (Claude) ---------- */
function planPrompt(d){
  var isToday=d===today(),start=isToday?Math.max(nowMins()+10,7*60):8*60;
  start=Math.ceil(start/15)*15;
  var tasks=openTasks().filter(function(t){return !t.due||t.due<=d}).sort(sortByDue).slice(0,45).map(function(t){
    return {id:t.id,title:t.title,area:area(t.area).name,due:t.due||"none",overdue:!!(t.due&&t.due<d),fixedTime:t.due===d&&hmOf(t)!=null&&!planSetTime(t,d)?t.atTime:undefined,person:personName(t.person)||undefined,note:(t.note||"").slice(0,180)||undefined}});
  var evs=eventsOn(d).map(function(e){return e.allDay?{title:e.title,allDay:true}:{title:e.title,flexible:!!e.free||undefined,focusSlot:!!e.focus||undefined,start:pad(Math.floor(e.s/60))+":"+pad(e.s%60),end:pad(Math.floor(Math.min(e.e,1439)/60))+":"+pad(Math.min(e.e,1439)%60)}});
  var fu=isToday?followUps().map(function(p){return {name:p.name,area:area(p.area).name,org:p.org||undefined}}):[];
  return "You are the calm, sharp chief of staff for a solo entrepreneur who runs several businesses at once:\n"+
    AREAS.map(function(a){return "- "+a.name+": "+a.about}).join("\n")+
    "\n\nPlan "+(isToday?"the rest of today":"the day")+", "+fmtLong(d)+". Schedule work from "+hm(start)+" until 9:00 PM at the latest.\n"+
    "Rules:\n- Never overlap a calendar event, except: events marked focusSlot are time reserved for deep work, so put the most important tasks inside them; events marked flexible can be worked around or moved past.\n- Leave 10 minutes after meetings. Events that cover sleep are not work time.\n- Do overdue items and client or revenue work first. Batch small admin tasks into one block.\n- Each block is 15 to 90 minutes. Give real estimates, not every task an hour.\n- Plan only what realistically fits. Leave the rest out.\n- Use only task ids from the list.\n- Tasks with fixedTime are appointments: give them a block that starts at exactly that time.\n"+
    "- The brief is 2 short sentences, written to the person as 'you': what matters most today and one practical tip. No greetings, no emoji.\n\n"+
    "Return only JSON in this shape: {\"brief\":\"...\",\"blocks\":[{\"taskId\":\"...\",\"start\":\"HH:MM\",\"end\":\"HH:MM\"}]}\n\n"+
    "Calendar events: "+JSON.stringify(evs)+"\nPeople to follow up with today: "+JSON.stringify(fu)+"\nOpen tasks: "+JSON.stringify(tasks);
}
function planSetTime(t,d){var b=blockFor(t.id,d);return !!(b&&b.start===t.atTime)}
async function plan(){
  if(!sample||state.planning)return;
  var d=state.day||today();
  if(!openTasks().some(function(t){return !t.due||t.due<=d})){toast("Add a few tasks first, then plan.");return}
  state.planning=true;render();
  try{
    var out=await sample.json(planPrompt(d),{modelTier:"default"});
    var blocks=(out&&Array.isArray(out.blocks)?out.blocks:[]).filter(function(b){
      var s=parseHM(b&&b.start),e=parseHM(b&&b.end);return b&&state.tasks.has(b.taskId)&&s!=null&&e!=null&&e>s;
    }).map(function(b){return {taskId:String(b.taskId),start:b.start,end:b.end}}).sort(function(a,b){return parseHM(a.start)-parseHM(b.start)});
    var seen={};blocks=blocks.filter(function(b){if(seen[b.taskId])return false;seen[b.taskId]=1;return true});
    var p={brief:String(out&&out.brief||"").slice(0,400),blocks:blocks,created:new Date().toISOString()};
    state.planning=false;
    var base=Date.now()-blocks.length-10,remindBlocks=setting("plan-remind","1")==="1";
    blocks.forEach(function(b,i){var t=state.tasks.get(b.taskId);var patch={order:base+i};if(!t.due||t.due>d)patch.due=d;
      if(remindBlocks&&(hmOf(t)==null||t.due!==d||planSetTime(t,d))){patch.atTime=b.start;if(t.remindMin==null)patch.remindMin=0}
      patchTask(b.taskId,patch,true)});
    save("plans",d,p);
    toast(blocks.length?"Planned "+blocks.length+" blocks":"Couldn't fit any tasks around your calendar.");
  }catch(e){
    state.planning=false;
    if(e&&e.code==="not_configured"){state.ai=false;render();toast("Add ANTHROPIC_API_KEY in Vercel to use planning.");return}
    render();
    toast(e&&e.code==="rate_limited"?"Too many requests. Try again in a minute.":"Couldn't make a plan. Try again.");
  }
}
function dumpSheet(){
  openSheet('<h3>Brain dump</h3><p class="lead">Type everything on your mind, messy is fine. It becomes a list of tasks, each filed under the right business.</p>'+
    '<div class="field"><textarea id="dump-text" class="dump" placeholder="call sarah back re upholstery quote, film 2 hooks for gym client thursday, renew van insurance, finish lesson 4 script…"></textarea></div>'+
    '<div id="dump-out"></div><div class="foot" id="dump-foot"><span class="sp"></span><button class="btn ghost" data-act="close">Cancel</button><button class="btn" data-act="dump-go">'+"Sort it</button></div>",true);
}
async function dumpGo(){
  var txt=($("dump-text")||{}).value||"";if(!txt.trim()||!sample)return;
  var btn=document.querySelector('[data-act="dump-go"]');if(btn){btn.disabled=true;btn.innerHTML='<span class="shimmer">Sorting…</span>'}
  var prompt="Turn this brain dump into clear, short, actionable tasks (start with a verb). Assign each to one area:\n"+
    AREAS.map(function(a){return "- "+a.id+": "+a.name+" ("+a.about+")"}).join("\n")+
    "\nToday is "+fmtLong(today())+" ("+today()+"). Set due to an ISO date only when the text implies one (today, tomorrow, a weekday, a date); otherwise \"\".\n"+
    "Return only JSON: {\"tasks\":[{\"title\":\"...\",\"area\":\"baselab|dg|truenorth|personal\",\"due\":\"YYYY-MM-DD or empty\"}]}\n\nBrain dump:\n"+txt.slice(0,6000);
  try{
    var out=await sample.json(prompt,{modelTier:"quick"});
    dumpItems=(out&&Array.isArray(out.tasks)?out.tasks:[]).filter(function(t){return t&&t.title}).slice(0,40).map(function(t){
      return {title:String(t.title).slice(0,200),area:isArea(t.area)?t.area:lastArea(),due:/^\d{4}-\d{2}-\d{2}$/.test(t.due||"")?t.due:"",on:true}});
    if(!dumpItems.length){toast("Couldn't find any tasks in that.");if(btn){btn.disabled=false;btn.innerHTML="Sort it"}return}
    $("dump-out").innerHTML='<div class="preview">'+dumpItems.map(function(t,i){
      return '<label class="prow" style="--c:'+col(t.area)+'"><input type="checkbox" data-dump="'+i+'" checked><span class="t">'+esc(t.title)+(t.due?' <span class="row-meta" style="display:inline">· '+esc(fmt(t.due))+"</span>":"")+'</span><select data-dump-area="'+i+'" aria-label="Area">'+areaOptions(t.area)+"</select></label>"}).join("")+"</div>";
    $("dump-foot").innerHTML='<span class="row-meta">'+dumpItems.length+' tasks</span><span class="sp"></span><button class="btn ghost" data-act="close">Cancel</button><button class="btn" data-act="dump-add">Add tasks</button>';
  }catch(e){
    if(btn){btn.disabled=false;btn.innerHTML="Sort it"}
    toast(e&&e.code==="not_configured"?"Add ANTHROPIC_API_KEY in Vercel to use this.":e&&e.code==="rate_limited"?"Too many requests. Try again in a minute.":"Couldn't sort that. Try again.");
  }
}
function dumpAdd(){
  var n=0,base=Date.now();
  dumpItems.forEach(function(t,i){
    var cb=document.querySelector('[data-dump="'+i+'"]'),sel=document.querySelector('[data-dump-area="'+i+'"]');
    if(cb&&!cb.checked)return;
    save("tasks",newId(),{title:t.title,area:sel?sel.value:t.area,due:t.due,done:false,doneOn:"",order:base+i,person:"",note:"",created:new Date().toISOString()},true);n++;
  });
  closeSheet();render();toast("Added "+n+" task"+(n===1?"":"s"));
}

/* ---------- sheets ---------- */
function openSheet(html,wide){var s=$("sheet");delete s.dataset.kind;s.className="sheet"+(wide?" wide":"");s.innerHTML=html;$("overlay").classList.add("open");var f=s.querySelector("textarea,input,button");if(f&&!mq.matches)f.focus()}
function closeSheet(){$("overlay").classList.remove("open");$("sheet").innerHTML=""}
function taskSheet(id){
  var t=state.tasks.get(id);if(!t)return;
  var people=entries("people").sort(byName);
  openSheet('<h3>Task</h3><form id="task-form" data-id="'+esc(id)+'" style="display:contents">'+
    '<div class="field"><label for="f-title">Title</label><input id="f-title" type="text" value="'+esc(t.title)+'" required></div>'+
    '<div class="two"><div class="field"><label for="f-area">Area</label><select id="f-area">'+areaOptions(t.area,true)+'</select></div>'+
    '<div class="field"><label for="f-due">Date</label><input id="f-due" type="date" value="'+esc(t.due||"")+'"></div></div>'+
    '<div class="two"><div class="field"><label for="f-time">Time</label><input id="f-time" type="time" value="'+esc(hmOf(t)==null?"":t.atTime)+'"></div>'+
    '<div class="field"><label for="f-remind">Reminder</label><select id="f-remind">'+REMINDS.map(function(o){return '<option value="'+o[0]+'"'+(String(t.remindMin==null?"":t.remindMin)===o[0]?" selected":"")+">"+o[1]+"</option>"}).join("")+"</select></div></div>"+
    '<div class="two"><div class="field"><label for="f-repeat">Repeat</label><select id="f-repeat">'+REPEATS.map(function(o){return '<option value="'+o[0]+'"'+((t.repeat||"")===o[0]?" selected":"")+">"+o[1]+"</option>"}).join("")+"</select></div>"+
    '<label class="toggle"><input id="f-alarm" type="checkbox"'+(t.alarm?" checked":"")+'><span>iPhone alarm<small>Rings even on silent, through the Shortcut in Settings</small></span></label></div>'+
    '<div class="chips"><button type="button" class="chip" data-act="set-due" data-due="'+today()+'">Today</button><button type="button" class="chip" data-act="set-due" data-due="'+plus(1)+'">Tomorrow</button><button type="button" class="chip" data-act="set-due" data-due="'+plus(7)+'">Next week</button><button type="button" class="chip" data-act="set-due" data-due="">No date</button></div>'+
    '<div class="field"><label for="f-person">Person</label><select id="f-person"><option value="">Nobody</option>'+people.map(function(p){return '<option value="'+esc(p.id)+'"'+(p.id===t.person?" selected":"")+">"+esc(p.name)+"</option>"}).join("")+"</select></div>"+
    '<div class="field"><label for="f-note">Details</label><textarea id="f-note">'+esc(t.note||"")+"</textarea></div>"+
    (t.source?'<div class="row-meta">From '+esc(t.source)+"</div>":"")+
    '<div class="foot"><button type="button" class="btn danger" data-act="delete-task" data-id="'+esc(id)+'">Delete</button><span class="sp"></span><button type="button" class="btn ghost" data-act="close">Cancel</button><button class="btn blue" type="submit">Save</button></div></form>');
}
function personSheet(id,areaId){
  var p=id?state.people.get(id):{name:"",org:"",area:areaId||lastArea(),contact:"",followUp:"",note:""};if(!p)return;
  openSheet("<h3>"+(id?"Person":"New person")+'</h3><form id="person-form" data-id="'+esc(id||"")+'" style="display:contents">'+
    '<div class="field"><label for="p-name">Name</label><input id="p-name" type="text" value="'+esc(p.name)+'" required></div>'+
    '<div class="two"><div class="field"><label for="p-org">Company or role</label><input id="p-org" type="text" value="'+esc(p.org||"")+'"></div>'+
    '<div class="field"><label for="p-area">Area</label><select id="p-area">'+areaOptions(p.area,true)+"</select></div></div>"+
    '<div class="two"><div class="field"><label for="p-contact">Phone or email</label><input id="p-contact" type="text" value="'+esc(p.contact||"")+'"></div>'+
    '<div class="field"><label for="p-follow">Follow up on</label><input id="p-follow" type="date" value="'+esc(p.followUp||"")+'"></div></div>'+
    '<div class="field"><label for="p-note">Notes</label><textarea id="p-note">'+esc(p.note||"")+"</textarea></div>"+
    (p.lastContact?'<div class="row-meta">Last talked '+esc(fmt(p.lastContact))+"</div>":"")+
    '<div class="foot">'+(id?'<button type="button" class="btn danger" data-act="delete-person" data-id="'+esc(id)+'">Delete</button>':"")+'<span class="sp"></span><button type="button" class="btn ghost" data-act="close">Cancel</button><button class="btn blue" type="submit">Save</button></div></form>');
}
function contactSheet(id){
  var p=state.people.get(id);if(!p)return;
  openSheet("<h3>Talked to "+esc(p.name)+'?</h3><p class="lead">This logs today as your last contact. When should they come back up?</p><div class="chips">'+
    [["In 1 week",plus(7)],["In 2 weeks",plus(14)],["In 1 month",plus(30)],["No follow-up",""]].map(function(o){return '<button class="chip" data-act="log-contact" data-id="'+esc(id)+'" data-due="'+o[1]+'">'+o[0]+"</button>"}).join("")+
    '</div><div class="foot"><span class="sp"></span><button class="btn ghost" data-act="close">Cancel</button></div>');
}

/* ---------- quick add: "call sarah tomorrow 3pm #dg" ---------- */
var REMINDS=[["","No reminder"],["0","At the time"],["5","5 min before"],["10","10 min before"],["15","15 min before"],["30","30 min before"],["60","1 hour before"]];
var WDN=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
var MON=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
var WDRX="(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)(?:day|nesday|sday|urday|rsday)?";
function wdIndex(w){w=w.toLowerCase().slice(0,3);return ["sun","mon","tue","wed","thu","fri","sat"].indexOf(w)}
function parseQuick(text){
  var s=" "+String(text||"")+" ",out={due:"",atTime:"",area:"",repeat:""};
  function take(rx,fn){var m=rx.exec(s);if(!m)return false;var r=fn(m);if(r===false)return false;s=s.slice(0,m.index)+" "+s.slice(m.index+m[0].length);return true}
  // area: #tag anywhere, or a plain area name at the very end
  take(/\s#(d&g|dg|baselab|bl|truenorth|tn|personal|me)(?=\s)/i,function(m){out.area={"d&g":"dg",dg:"dg",baselab:"baselab",bl:"baselab",truenorth:"truenorth",tn:"truenorth",personal:"personal",me:"personal"}[m[1].toLowerCase()]})||
  take(/\s(?:for\s+)?(d&g|dg|baselab|true north|truenorth|personal)\s*$/i,function(m){out.area={"d&g":"dg",dg:"dg",baselab:"baselab","true north":"truenorth",truenorth:"truenorth",personal:"personal"}[m[1].toLowerCase()];});
  // repeats
  take(/\s(every\s?day|daily)(?=\s)/i,function(){out.repeat="daily"})||
  take(/\s(every\s+weekday|weekdays)(?=\s)/i,function(){out.repeat="weekdays"})||
  take(new RegExp("\\severy\\s+"+WDRX+"(?=\\s)","i"),function(m){out.repeat="weekly";out.due=plus((wdIndex(m[1])-new Date().getDay()+7)%7)})||
  take(/\s(every\s+week|weekly)(?=\s)/i,function(){out.repeat="weekly"})||
  take(/\s(every\s+month|monthly)(?=\s)/i,function(){out.repeat="monthly"});
  // times
  take(/\s(?:at\s+|@)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)(?=\s)/i,function(m){var h=+m[1]%12,mm=+(m[2]||0);if(h>12||mm>59)return false;if(/^p/i.test(m[3]))h+=12;out.atTime=pad(h)+":"+pad(mm)})||
  take(/\s(?:at\s+|@)?([01]?\d|2[0-3]):([0-5]\d)(?=\s)/i,function(m){out.atTime=pad(+m[1])+":"+m[2]})||
  take(/\s(?:at\s+|@)(\d{1,2})(?=\s)/i,function(m){var h=+m[1];if(h<1||h>12)return false;if(h<7)h+=12;out.atTime=pad(h)+":00"})||
  take(/\s(?:at\s+)?noon(?=\s)/i,function(){out.atTime="12:00"});
  // dates
  take(/\s(today|tod)(?=\s)/i,function(){out.due=today()})||
  take(/\s(tonight)(?=\s)/i,function(){out.due=today();if(!out.atTime)out.atTime="19:00"})||
  take(/\s(tomorrow|tmrw|tmr|tomo)(?=\s)/i,function(){out.due=plus(1)})||
  take(/\sin\s+(\d{1,2})\s+(day|days|week|weeks)(?=\s)/i,function(m){out.due=plus(+m[1]*(/^w/i.test(m[2])?7:1))})||
  take(/\s(next\s+week)(?=\s)/i,function(){out.due=plus(7)})||
  take(new RegExp("\\s(?:on\\s+|this\\s+|next\\s+)?"+WDRX+"(?=\\s)","i"),function(m){var i=wdIndex(m[1]);if(i<0)return false;out.due=plus((i-new Date().getDay()+7)%7||7)})||
  take(/\s(?:on\s+)?(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?=\s)/,function(m){var mo=+m[1],dd=+m[2];if(mo<1||mo>12||dd<1||dd>31)return false;var y=m[3]?(+m[3]<100?2000+ +m[3]:+m[3]):new Date().getFullYear(),c=y+"-"+pad(mo)+"-"+pad(dd);if(!m[3]&&c<today())c=(y+1)+"-"+pad(mo)+"-"+pad(dd);out.due=c})||
  take(new RegExp("\\s(?:on\\s+)?("+MON.join("|")+")[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?=\\s)","i"),function(m){var mo=MON.indexOf(m[1].toLowerCase().slice(0,3))+1,dd=+m[2];if(dd<1||dd>31)return false;var y=new Date().getFullYear(),c=y+"-"+pad(mo)+"-"+pad(dd);if(c<today())c=(y+1)+"-"+pad(mo)+"-"+pad(dd);out.due=c});
  if(out.atTime&&!out.due)out.due=out.atTime>toHM(nowMins())?today():plus(1);
  if(out.repeat&&!out.due)out.due=today();
  if(out.repeat==="weekdays"){var wd=toDate(out.due).getDay();if(wd===6)out.due=plus(2,out.due);else if(wd===0)out.due=plus(1,out.due)}
  out.title=s.replace(/\s+(at|on|by|for)\s*$/i," ").replace(/\s{2,}/g," ").trim();out.title=out.title.charAt(0).toUpperCase()+out.title.slice(1);
  return out;
}
function quickHint(p,areaShown){
  var bits=[];
  if(p.due)bits.push(p.due===today()?"Today":p.due===plus(1)?"Tomorrow":fmt(p.due));
  if(p.atTime)bits.push(hm(parseHM(p.atTime))+" reminder");
  if(p.repeat)bits.push(repeatName(p.repeat));
  if(p.area&&areaShown)bits.push(area(p.area).short);
  return bits.join(" · ");
}
function quickSheet(){
  openSheet('<h3>New task</h3><p class="lead">Try "call Sarah tomorrow 3pm #dg" or "post reel every weekday 9am baselab".</p>'+
    '<form class="add qa" data-area="" data-due=""><span class="plus">'+G.plus+'</span><input data-key="add-sheet" type="text" placeholder="New task" aria-label="New task" enterkeyhint="done" autocomplete="off"><span class="qa-hint" aria-live="polite"></span><select aria-label="Area">'+areaOptions(lastArea())+"</select></form>"+
    '<div class="foot"><span class="sp"></span><button class="btn ghost" data-act="close">Cancel</button><button class="btn" data-act="qa-submit">Add</button></div>');
  var i=$("sheet").querySelector("input");if(i)i.focus();
}

/* ---------- snooze ---------- */
function snoozeSheet(id){
  var t=state.tasks.get(id);if(!t)return;
  var nm=nowMins(),opts=[];
  function r5(m){return Math.ceil(m/5)*5}
  if(nm<23*60)opts.push(["In 1 hour",today(),toHM(r5(nm+60))]);
  if(nm<20*60)opts.push(["In 3 hours",today(),toHM(r5(nm+180))]);
  if(nm<17*60)opts.push(["This evening, 6 PM",today(),"18:00"]);
  opts.push(["Tomorrow morning, 9 AM",plus(1),"09:00"]);
  opts.push(["Tomorrow, no time",plus(1),""]);
  opts.push(["Next week",plus(7),t.atTime||""]);
  openSheet("<h3>Snooze</h3><p class=\"lead\">"+esc(t.title)+'</p><div class="opts">'+opts.map(function(o){
    return '<button class="opt" data-act="snooze-to" data-id="'+esc(id)+'" data-due="'+o[1]+'" data-time="'+o[2]+'"><span>'+esc(o[0])+"</span>"+(o[2]?'<span class="row-meta">Reminds you then</span>':"")+"</button>"}).join("")+
    '<button class="opt" data-act="edit-task" data-id="'+esc(id)+'"><span>Pick a date and time</span></button></div><div class="foot"><span class="sp"></span><button class="btn ghost" data-act="close">Cancel</button></div>');
}
function snoozeTo(id,due,time){
  var t=state.tasks.get(id);if(!t)return;
  var patch={due:due,order:Date.now()};
  if(time){patch.atTime=time;patch.remindMin=t.remindMin!=null?t.remindMin:0}
  else if(due!==t.due&&hmOf(t)!=null&&!t.repeat){patch.atTime="";patch.remindMin=null}
  var before={due:t.due,atTime:t.atTime||"",remindMin:t.remindMin==null?null:t.remindMin,order:t.order};
  closeSheet();patchTask(id,patch);
  toast("Snoozed to "+(due===today()?"":due===plus(1)?"tomorrow ":fmt(due)+" ")+(time?hm(parseHM(time)):"").trim(),function(){patchTask(id,before)});
}

/* ---------- settings: reminders, morning summary, iPhone alarms ---------- */
var pushInfo={on:null,perm:"default",morning:setting("morning","08:00"),busy:false,msg:"",link:""};
function isIOS(){return /iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1)}
function isStandalone(){return !!(navigator.standalone||window.matchMedia("(display-mode: standalone)").matches)}
async function refreshPush(){
  if(!push||!push.supported){pushInfo.on=false;pushInfo.perm="unsupported";return}
  pushInfo.perm=push.permission();
  try{pushInfo.on=!!(await push.current())&&pushInfo.perm==="granted"}catch(_){pushInfo.on=false}
}
function settingsHTML(){
  var p=pushInfo,h='<h3>Settings</h3>';
  h+='<div class="group"><div class="gh">Reminders on this device</div>';
  if(p.perm==="unsupported"&&isIOS()&&!isStandalone())
    h+='<p class="gp">To get reminders on your iPhone, add Daily Board to your Home Screen first. In Safari, tap the Share button, then <b>Add to Home Screen</b>. Open it from the Home Screen icon and come back here.</p>';
  else if(p.perm==="unsupported")h+='<p class="gp">This browser can\'t show notifications. On iPhone, use the app from your Home Screen (iOS 16.4 or later).</p>';
  else if(p.perm==="denied")h+='<p class="gp">Notifications are blocked. On iPhone open <b>Settings → Notifications → Daily Board</b> and turn on Allow Notifications, then come back.</p>';
  else if(p.on)h+='<p class="gp"><span class="okdot"></span>On. Tasks with a time remind you here, even when the app is closed.</p><div class="row2"><button class="btn ghost" data-act="push-test"'+(p.busy?" disabled":"")+'>Send a test</button><button class="btn ghost" data-act="push-off"'+(p.busy?" disabled":"")+">Turn off</button></div>";
  else h+='<p class="gp">Get a notification when a task\'s time comes up, plus a short summary each morning.</p><div class="row2"><button class="btn" data-act="push-on"'+(p.busy?" disabled":"")+">"+(p.busy?"Turning on…":"Turn on reminders")+"</button></div>";
  if(p.msg)h+='<p class="gp warnmsg">'+esc(p.msg)+"</p>";
  h+="</div>";
  var times=[["","Off"]];for(var m=5*60;m<=10*60;m+=30)times.push([toHM(m),hm(m)]);
  h+='<div class="group"><div class="gh">Morning summary</div><div class="field"><select id="s-morning" aria-label="Morning summary time"'+(p.on?"":" disabled")+">"+times.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===p.morning?" selected":"")+">"+o[1]+"</option>"}).join("")+'</select></div><p class="gp small">What\'s on today, what carried over and who to follow up with.</p></div>';
  h+='<div class="group"><label class="toggle"><input id="s-plan" type="checkbox"'+(setting("plan-remind","1")==="1"?" checked":"")+'><span>Remind me at each planned block<small>Plan my day gives each task a time and a reminder</small></span></label></div>';
  h+='<div class="group"><div class="gh">iPhone alarms</div><p class="gp">A web app can\'t set Clock alarms itself. A Shortcut can: each morning it reads today\'s tasks marked <b>iPhone alarm</b> and creates real alarms that ring on silent.</p>';
  if(p.link)h+='<div class="field"><input id="s-link" type="text" readonly value="'+esc(p.link)+'" aria-label="Alarms link"></div><div class="row2"><button class="btn ghost" data-act="copy-link">Copy link</button></div>'+
    '<ol class="steps"><li>Open <b>Shortcuts</b>, tap <b>Automation</b>, then <b>+</b> and <b>Time of Day</b>. Pick 6:30 AM, Daily, and <b>Run Immediately</b>.</li><li>Add <b>Get Contents of URL</b> and paste the link.</li><li>Add <b>Get Dictionary Value</b> for key <b>alarms</b>, then <b>Repeat with Each</b>.</li><li>Inside the repeat, add <b>Get Dictionary Value</b> for <b>time</b>, then <b>Create Alarm</b> with that time. Set its label to the item\'s <b>label</b>.</li></ol><p class="gp small">Keep this link private. Anyone with it can see today\'s alarm titles.</p>';
  else h+='<p class="gp small">'+(p.linkErr?esc(p.linkErr):'<span class="shimmer">Getting your link…</span>')+"</p>";
  h+="</div>";
  h+='<div class="foot"><span class="sp"></span><button class="btn" data-act="close">Done</button></div>';
  return h;
}
function drawSettings(){var s=$("sheet");if(s&&s.dataset.kind==="settings"){var y=s.scrollTop;s.innerHTML=settingsHTML();s.scrollTop=y}}
async function settingsSheet(){
  openSheet(settingsHTML(),true);$("sheet").dataset.kind="settings";
  await refreshPush();drawSettings();
  if(push&&!pushInfo.link)push.alarmsLink().then(function(r){pushInfo.link=r.url;pushInfo.linkErr="";drawSettings()}).catch(function(e){pushInfo.linkErr=e&&e.code==="not_configured"?"Alarms need the reminder keys set in Vercel first.":"Couldn't get your link. Try again later.";drawSettings()});
}
async function pushOn(){
  pushInfo.busy=true;pushInfo.msg="";drawSettings();
  try{await push.enable({morning:pushInfo.morning});pushInfo.on=true;toast("Reminders are on");render()}
  catch(e){pushInfo.msg=e&&e.code==="denied"?"Notifications weren't allowed.":e&&e.code==="not_configured"?"Reminders need VAPID keys and the Supabase service key in Vercel.":e&&e.code==="unsupported"?"This browser can't show notifications.":"Couldn't turn on reminders. Try again."}
  pushInfo.busy=false;await refreshPush();drawSettings();
}
async function pushOff(){pushInfo.busy=true;drawSettings();try{await push.disable()}catch(_){}pushInfo.busy=false;await refreshPush();drawSettings();render()}
async function pushTest(){pushInfo.busy=true;pushInfo.msg="";drawSettings();try{await push.test();pushInfo.msg="Sent. It should appear in a few seconds."}catch(e){pushInfo.msg="The test didn't send. Try turning reminders off and on."}pushInfo.busy=false;drawSettings()}
function nudge(){
  if(!push||pushInfo.on!==false||setting("nudge-off","")==="1"||pushInfo.perm==="denied")return "";
  if(pushInfo.perm==="unsupported"&&!isIOS())return "";
  return '<section class="nudge"><span class="ic sq" style="--c:var(--accent)">'+G.bell+'</span><div class="grow"><b>Get reminders on your phone</b><span>'+(isIOS()&&!isStandalone()?"Add Daily Board to your Home Screen, then turn on reminders.":"Tasks with a time will notify you, even when the app is closed.")+'</span></div><button class="btn" data-act="settings">Set up</button><button class="iconbtn" data-act="nudge-off" aria-label="Hide">'+G.add.replace("<path",'<path transform="rotate(45 12 12)"')+"</button></section>";
}

/* ---------- toast ---------- */
function toast(text,undo){
  $("toast-text").textContent=text;undoFn=undo||null;$("toast-undo").hidden=!undo;
  $("toast").classList.add("open");clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){$("toast").classList.remove("open");undoFn=null},5000);
}
$("toast-undo").addEventListener("click",function(){if(undoFn)undoFn();undoFn=null;$("toast").classList.remove("open")});

/* ---------- actions ---------- */
function complete(id,el){
  var t=state.tasks.get(id);if(!t)return;
  if(t.done){patchTask(id,{done:false,doneOn:""});return}
  if(state.focus&&state.focus.id===id){state.focus=null;clearInterval(focusTick)}
  var row=el.closest(".row");if(row)row.classList.add("done","leaving");
  setTimeout(function(){
    patchTask(id,{done:true,doneOn:today()},!!t.repeat);
    var nid=null;
    if(t.repeat){
      nid=newId();
      var nx=Object.assign({},t,{due:nextDue(t.due,t.repeat,today()),done:false,doneOn:"",order:Date.now(),created:new Date().toISOString()});
      save("tasks",nid,nx);
    }
    toast(nid?"Done. Next one "+(state.tasks.get(nid).due===plus(1)?"tomorrow":fmt(state.tasks.get(nid).due)):"Completed: "+t.title,function(){if(nid)remove("tasks",nid);patchTask(id,{done:false,doneOn:""})});
  },row?420:0);
}
var swipeAt=0;
document.addEventListener("click",function(e){
  if(Date.now()-swipeAt<450){e.preventDefault();return}
  var el=e.target.closest("[data-act]");
  if(!el){if(e.target===$("overlay"))closeSheet();return}
  var act=el.dataset.act,id=el.dataset.id,t,p;
  if(act==="go")go(el.dataset.view);
  else if(act==="day"){state.day=el.dataset.day===today()?"":el.dataset.day;state.showDone=false;tlScroll=null;lastShown="";render()}
  else if(act==="seg"){flushNote();state.seg=el.dataset.seg;render()}
  else if(act==="log-area"){state.logArea=el.dataset.area||"";render()}
  else if(act==="open-build")buildSheet(el.dataset.id);
  else if(act==="del-build"){var bid=el.dataset.id,old=state.builds.get(bid);closeSheet();if(old){state.builds.delete(bid);render();db.doc("builds/"+bid).delete().catch(writeFailed);toast("Entry deleted",function(){state.builds.set(bid,old);render();db.doc("builds/"+bid).set(old).catch(writeFailed)})}}
  else if(act==="toggle")complete(id,el);
  else if(act==="later")patchTask(id,{order:Date.now()});
  else if(act==="tomorrow")patchTask(id,{due:plus(1),order:Date.now()});
  else if(act==="to-today"){patchTask(id,{due:today(),order:Date.now()});toast("Added to Today")}
  else if(act==="do-next"){var first=dayTasks(today())[0];patchTask(id,{due:today(),order:(first?first.order||0:Date.now())-1})}
  else if(act==="late-today"){var td=today(),ids=openTasks().filter(function(x){return x.due&&x.due<td}).map(function(x){return x.id});ids.forEach(function(i){patchTask(i,{due:td},true)});render();toast("Moved "+ids.length+" to today")}
  else if(act==="push-rest"){var ts=dayTasks(today()).slice(3),tm=plus(1);ts.forEach(function(x){patchTask(x.id,{due:tm},true)});render();toast("Moved "+ts.length+" to tomorrow",function(){ts.forEach(function(x){patchTask(x.id,{due:x.due},true)});render()})}
  else if(act==="show-done"){state.showDone=!state.showDone;render()}
  else if(act==="focus")toggleFocus(id);
  else if(act==="edit-task")taskSheet(id);
  else if(act==="set-due")$("f-due").value=el.dataset.due;
  else if(act==="delete-task"){t=state.tasks.get(id);closeSheet();remove("tasks",id);toast("Task deleted",function(){save("tasks",id,t)})}
  else if(act==="new-person")personSheet("",el.dataset.area);
  else if(act==="edit-person")personSheet(id);
  else if(act==="delete-person"){p=state.people.get(id);closeSheet();remove("people",id);toast("Person deleted",function(){save("people",id,p)})}
  else if(act==="contacted")contactSheet(id);
  else if(act==="log-contact"){p=state.people.get(id);if(p)save("people",id,Object.assign({},p,{lastContact:today(),followUp:el.dataset.due}));closeSheet()}
  else if(act==="cal-connect"||act==="cal-refresh")fetchCal(true);
  else if(act==="plan")plan();
  else if(act==="dump")dumpSheet();
  else if(act==="dump-go")dumpGo();
  else if(act==="dump-add")dumpAdd();
  else if(act==="close")closeSheet();
  else if(act==="snooze")snoozeSheet(id);
  else if(act==="snooze-to")snoozeTo(id,el.dataset.due,el.dataset.time);
  else if(act==="quick")quickSheet();
  else if(act==="qa-submit"){var qf=$("sheet").querySelector("form.add");if(qf)qf.requestSubmit()}
  else if(act==="settings")settingsSheet();
  else if(act==="push-on")pushOn();
  else if(act==="push-off")pushOff();
  else if(act==="push-test")pushTest();
  else if(act==="copy-link"){var li=$("s-link");if(li){li.select();try{navigator.clipboard.writeText(li.value).then(function(){toast("Link copied")},function(){document.execCommand("copy");toast("Link copied")})}catch(_){document.execCommand("copy");toast("Link copied")}}}
  else if(act==="nudge-off"){setSetting("nudge-off","1");render()}
  else if(act==="tip-off"){setSetting("tip-swipe","1");render()}
});
document.addEventListener("submit",function(e){
  e.preventDefault();
  var f=e.target,id;
  if(f.classList.contains("add")){
    var inp=f.querySelector("input"),sel=f.querySelector("select"),raw=inp.value.trim();if(!raw)return;
    var q=parseQuick(raw),title=q.title||raw;
    var a=q.area||f.dataset.area||(sel?sel.value:lastArea());
    if(sel&&!q.area){try{localStorage.setItem("db-area",a)}catch(_){}}
    inp.value="";var hint=f.querySelector(".qa-hint");if(hint)hint.textContent="";
    save("tasks",newId(),{title:title,area:a,due:q.due||f.dataset.due||"",done:false,doneOn:"",order:Date.now(),person:"",note:"",created:new Date().toISOString(),
      atTime:q.atTime,remindMin:q.atTime?0:null,repeat:q.repeat,alarm:false});
    if(f.closest(".sheet")){closeSheet();toast("Added"+(quickHint(q,true)?": "+quickHint(q,true):""))}
    else if(q.area&&f.dataset.area&&q.area!==f.dataset.area)toast("Added to "+area(q.area).name);
  }else if(f.id==="task-form"){
    id=f.dataset.id;if(!$("f-title").value.trim())return;
    var tm=$("f-time").value,rm=$("f-remind").value,due=$("f-due").value;
    if(tm&&!due)due=today();
    patchTask(id,{title:$("f-title").value.trim(),area:$("f-area").value,due:due,person:$("f-person").value,note:$("f-note").value.trim(),
      atTime:tm,remindMin:tm&&rm!==""?Number(rm):null,repeat:$("f-repeat").value,alarm:!!(tm&&$("f-alarm").checked)});
    closeSheet();
  }else if(f.id==="person-form"){
    id=f.dataset.id;if(!$("p-name").value.trim())return;
    var old=id?state.people.get(id)||{}:{};
    save("people",id||newId(),Object.assign({},old,{name:$("p-name").value.trim(),org:$("p-org").value.trim(),area:$("p-area").value,contact:$("p-contact").value.trim(),followUp:$("p-follow").value,note:$("p-note").value.trim(),lastContact:old.lastContact||""}));
    closeSheet();
  }
});
document.addEventListener("change",function(e){
  var tid=e.target.id;
  if(tid==="f-time"){var r=$("f-remind");if(r&&e.target.value&&r.value==="")r.value="0"}
  else if(tid==="s-morning"){pushInfo.morning=e.target.value;setSetting("morning",e.target.value);if(push)push.save({morning:e.target.value}).then(function(){toast(e.target.value?"Morning summary at "+hm(parseHM(e.target.value)):"Morning summary off")}).catch(function(){toast("Couldn't save that. Try again.")})}
  else if(tid==="s-plan")setSetting("plan-remind",e.target.checked?"1":"0");
  var i=e.target.dataset&&e.target.dataset.dumpArea;
  if(i!=null){var row=e.target.closest(".prow");if(row)row.style.setProperty("--c",col(e.target.value))}
});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){closeSheet();return}
  var tag=(e.target.tagName||"").toLowerCase();
  if(tag==="input"||tag==="textarea"||tag==="select"||e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.key==="n"){var i=$("page").querySelector(".add input");e.preventDefault();if(i)i.focus();else quickSheet()}
  else if(e.key==="/"){e.preventDefault();$("search").focus()}
  else if(e.key==="t")go("today");
  else if(e.key==="p"&&sample)plan();
  else if(e.key==="d"&&sample){e.preventDefault();dumpSheet()}
});
document.addEventListener("input",function(e){
  var af=e.target.closest&&e.target.closest("form.add");
  if(af){var hn=af.querySelector(".qa-hint");if(hn){var q=parseQuick(e.target.value);hn.textContent=q.title&&q.title!==e.target.value.trim()?quickHint(q,!af.dataset.area||q.area!==af.dataset.area):""}return}
  if(e.target.id==="search"){
    var q=e.target.value.trim();
    if(q&&state.view!=="search"){state.prev=state.view;state.view="search"}
    if(!q&&state.view==="search")state.view=state.prev;
    state.q=q;render();return;
  }
  if(e.target.tagName==="TEXTAREA"&&e.target.dataset.key){
    var s=$("note-saved");if(s)s.textContent="";
    clearTimeout(noteTimer);noteTimer=setTimeout(flushNote,900);
  }
});
function flushNote(){
  clearTimeout(noteTimer);noteTimer=null;
  var ta=$("page").querySelector("textarea[data-key]");if(!ta)return;
  var a=ta.dataset.area,cur=state.notes.get(a);
  if((cur&&cur.text||"")===ta.value)return;
  var clean={text:ta.value,updated:new Date().toISOString()};
  state.notes.set(a,clean);
  if(!db)return;
  var k="notes/"+a;
  chains[k]=(chains[k]||Promise.resolve()).then(function(){return db.doc(k).set(clean)}).then(function(){var x=$("note-saved");if(x)x.textContent="Saved"}).catch(writeFailed);
}

/* ---------- swipe rows: right = done, left = snooze ---------- */
var sw=null;
document.addEventListener("touchstart",function(e){
  var row=e.target.closest&&e.target.closest("[data-swipe]");
  sw=row&&e.touches.length===1?{row:row,x:e.touches[0].clientX,y:e.touches[0].clientY,dx:0,lock:null}:null;
},{passive:true});
document.addEventListener("touchmove",function(e){
  if(!sw)return;var p=e.touches[0],dx=p.clientX-sw.x,dy=p.clientY-sw.y;
  if(sw.lock==null){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;sw.lock=Math.abs(dx)>Math.abs(dy)*1.3?"x":"y"}
  if(sw.lock!=="x"){sw=null;return}
  if(e.cancelable)e.preventDefault();
  dx=Math.max(-160,Math.min(160,dx));sw.dx=dx;
  var r=sw.row;r.classList.add("swiping");r.classList.toggle("sw-r",dx>0);r.classList.toggle("sw-l",dx<0);r.classList.toggle("sw-go",Math.abs(dx)>84);r.style.setProperty("--dx",dx+"px");
},{passive:false});
function endSwipe(){
  if(!sw)return;var x=sw;sw=null;var r=x.row;
  r.classList.remove("swiping","sw-r","sw-l","sw-go");r.style.removeProperty("--dx");
  if(x.lock!=="x")return;swipeAt=Date.now();
  if(x.dx>84)complete(r.dataset.swipe,r.querySelector(".check")||r);
  else if(x.dx<-84)snoozeSheet(r.dataset.swipe);
}
document.addEventListener("touchend",endSwipe);
document.addEventListener("touchcancel",function(){if(sw){sw.lock=null;endSwipe()}});

/* ---------- opened from a notification ---------- */
function openFromUrl(u){
  try{
    var url=new URL(u,location.href),id=url.searchParams.get("task");
    if(url.hash&&url.hash.slice(1)!==state.view)go(url.hash.slice(1));
    if(id&&state.tasks.has(id))taskSheet(id);
  }catch(_){}
}
if("serviceWorker" in navigator)navigator.serviceWorker.addEventListener("message",function(e){if(e.data&&e.data.type==="open")openFromUrl(e.data.url)});

/* ---------- navigation ---------- */
function valid(v){return v==="home"||v==="log"||isArea(v)||SMART.some(function(s){return s.id===v})}
function go(v){
  if(!valid(v))v=mq.matches?"home":"today";
  flushNote();
  if(state.view==="search"){$("search").value="";state.q=""}
  if(v!==state.view){state.showDone=false;if(v==="today")state.day=""}
  state.view=v;
  if(location.hash.slice(1)!==v){try{history.replaceState(null,"","#"+v)}catch(_){location.hash=v}}
  render();
}
window.addEventListener("hashchange",function(){var v=location.hash.slice(1);if(v!==state.view)go(v)});
mq.addEventListener("change",render);
document.addEventListener("visibilitychange",function(){if(document.hidden)flushNote();else{tick();if(state.cal.status==="ok"&&Date.now()-state.cal.at>300000)fetchCal(false)}});
function tick(){var d=today();if(d!==lastDay){lastDay=d;state.day="";render();return}var nl=$("nowline"),tl=$("tl");if(nl&&tl){var h0=+tl.dataset.h0;nl.style.top=(nowMins()-h0*60)/60*54+"px"}}
setInterval(tick,60000);

/* ---------- start ---------- */
go(location.hash.slice(1)||(mq.matches?"home":"today"));
(function(){
  var timer=setTimeout(function(){if(!state.ready){state.slow=true;render()}},10000);
  db=env.db;sample=env.sample||null;state.ai=sample?true:false;
  var got={};
  ["tasks","people","notes","plans"].forEach(function(c){
    db.collection(c).onSnapshot(function(s){
      var m=new Map();s.docs.forEach(function(x){m.set(x.id,x.data())});
      if(c==="notes"&&noteTimer){var ta=$("page").querySelector("textarea[data-key]"),a=ta&&ta.dataset.area,mine=a&&state.notes.get(a);if(mine)m.set(a,mine)}
      state[c]=m;got[c]=true;
      if(got.tasks&&got.people&&got.notes&&got.plans){
        var first=!state.ready;state.ready=true;state.failed=false;state.slow=false;clearTimeout(timer);
        if(first&&/[?&]task=/.test(location.search)){var u=location.href;try{history.replaceState(null,"",location.pathname+location.hash)}catch(_){}setTimeout(function(){openFromUrl(u)},0)}
      }
      render();
    },function(){clearTimeout(timer);state.ready=true;state.slow=false;state.failed=true;render()});
  });
  ["builds","recaps"].forEach(function(c){
    db.collection(c).onSnapshot(function(s){var m=new Map();s.docs.forEach(function(x){m.set(x.id,x.data())});state[c]=m;if(state.ready)render()},function(){});
  });
  initCal();
  refreshPush().then(render);
})();

}
