// Daily Board UI. Plain DOM rendering; data comes in through the env adapters (see lib/adapters.js).
/* eslint-disable */
import {nextDue,REPEATS} from "./recur";
import {makeHealth} from "./health";
let started=false;
export function startBoard(env){
"use strict";
if(started)return;started=true;
var G={
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 001.5.86l11-6.5a1 1 0 000-1.72l-11-6.5A1 1 0 008 5.5z"/></svg>',
  sparkle:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9zM18.5 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
  drop:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8c3.6 4.3 6.5 8.1 6.5 11.4a6.5 6.5 0 01-13 0c0-3.3 2.9-7.1 6.5-11.4z"/></svg>',
  north:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l7 17.2a.6.6 0 01-.85.75L12 17l-6.15 3.45a.6.6 0 01-.85-.75z"/></svg>',
  pulse:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2.5-6 4 12 2.5-6H21"/></svg>',
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
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>',
  dark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/></svg>',
  auto:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 010 16z" fill="currentColor"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7.5a2 2 0 002 2h2.5"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4.5M5 4.5h11.5l-2 4 2 4H5"/></svg>',
  pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  ext:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5h5v5M19 5l-8 8M17 14v4a1 1 0 01-1 1H6a1 1 0 01-1-1V8a1 1 0 011-1h4"/></svg>',
  brief:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 4.5A1.5 1.5 0 0110.5 3h3A1.5 1.5 0 0115 4.5V6h4a2 2 0 012 2v3.2l-9 2.6-9-2.6V8a2 2 0 012-2h4zm1.5 0V6h3V4.5z"/><path d="M3 12.8l9 2.6 9-2.6V18a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.3 3.3a1 1 0 011.4 0l8 7.4c.6.6.2 1.6-.7 1.6H19V19a1.5 1.5 0 01-1.5 1.5H14V15h-4v5.5H6.5A1.5 1.5 0 015 19v-6.7H4c-.9 0-1.3-1-.7-1.6z"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.1 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.1 6-.8z"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5.5A2.5 2.5 0 016.5 3H11v16H6.5A2.5 2.5 0 004 20.5zM13 3h4.5A2.5 2.5 0 0120 5.5v15a2.5 2.5 0 00-2.5-1.5H13z"/></svg>',
  camera:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.2 4h5.6l1.5 2.5H19a2 2 0 012 2V18a2 2 0 01-2 2H5a2 2 0 01-2-2V8.5a2 2 0 012-2h2.7zM12 17a4 4 0 100-8 4 4 0 000 8z"/></svg>',
  dollar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3.2c0 4.3 9 2.3 9 6.6 0 1.9-2 3.2-4.5 3.2s-4.5-1.3-4.5-3"/></svg>',
  car:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 5.5h10.8l2.1 5.5h.5a1 1 0 011 1v5a1 1 0 01-1 1H19v1.5a1 1 0 01-1 1h-1.5a1 1 0 01-1-1V18h-7v1.5a1 1 0 01-1 1H6a1 1 0 01-1-1V18h-1a1 1 0 01-1-1v-5a1 1 0 011-1h.5zm1.4 2L6.7 11h10.6L16 7.5zM7 15.5a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6zm10 0a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6z"/></svg>',
  cart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 4h2.3l2.4 10.2a1.5 1.5 0 001.5 1.1h8.7a1.5 1.5 0 001.4-1.1L21 7H6.6L5.9 4.2A1.5 1.5 0 004.5 3H2.5z"/><circle cx="9" cy="19.5" r="1.6"/><circle cx="17" cy="19.5" r="1.6"/></svg>',
  code:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5"/></svg>',
  music:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3.5v12a3 3 0 11-2-2.8V7.6l-8 1.8v8.1a3 3 0 11-2-2.8V6.2a1 1 0 01.8-1l10-2.2a1 1 0 011.2 1z"/></svg>',
  leaf:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5c-9.5 0-16 4.4-16 11.3 0 1.5.4 2.9 1.1 4.1L3.5 21l1.4 1.4 2.2-2.2c1.2.7 2.6 1.1 4.1 1.1 6.9 0 9.3-8.3 9.3-17.8zM8.4 17.1c1.9-3.5 4.7-6.2 8.1-8.1-2.9 2.4-5.3 5.1-6.7 8.6z"/></svg>',
  bolt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2.5L4.8 13.4a.6.6 0 00.5 1h5.2l-1 7.1 8.7-10.9a.6.6 0 00-.5-1h-5.2z"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5c5 0 9 3.4 9 7.6s-4 7.6-9 7.6c-1 0-2-.1-2.9-.4L4.5 20.5l1.2-3.9C4 15.2 3 13.3 3 11.1c0-4.2 4-7.6 9-7.6z"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l7.5 3v5.8c0 4.8-3.2 8.9-7.5 10.2-4.3-1.3-7.5-5.4-7.5-10.2V5.5z"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.3 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.3-3.5-8.5s1.1-6.1 3.5-8.5z"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14.5l6-6 6 6"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5l6 6 6-6"/></svg>',
  img:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-9 8.5"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
var LOGOS={dg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="26" fill="#1E6BFF"/><g transform="translate(19.012 21.768) scale(0.7352)"><path d="M24.198 33.828C22.734 30.17 22.002 26.492 22.002 22.794C22.002 20.539 22.274 18.276 22.819 16.005C24.487 9.053 28.013 3.754 33.397 0.11C37.922 -2.953 43.233 -4.485 49.328 -4.485C56.371 -4.485 62.198 -2.486 66.808 1.513C71.948 5.971 74.518 11.931 74.518 19.394C74.518 25.878 72.381 31.761 68.106 37.042C65.699 40.016 61.697 43.602 56.1 47.8L52.429 50.553L93.775 97.2L81.749 97.2L45.205 55.971L38.5 61C32.919 65.186 29.074 68.604 26.964 71.254C24.656 74.153 23.503 77.162 23.503 80.283C23.503 87.756 29.013 91.493 40.033 91.493C46.745 91.493 52.672 89.52 57.813 85.576C59.428 84.337 61.048 82.848 62.675 81.109L73.983 93.866C72.063 95.826 70.122 97.559 68.161 99.064C59.967 105.35 50.591 108.493 40.033 108.493C30.715 108.493 23.052 106.256 17.043 101.783C10.016 96.552 6.503 89.385 6.503 80.283C6.503 73.202 8.89 66.663 13.664 60.666C16.678 56.879 21.557 52.457 28.3 47.4L30.976 45.393C27.867 41.206 25.608 37.351 24.198 33.828ZM72.467 67.733C72.859 67.083 73.251 66.419 73.644 65.741L83.665 48.433L98.377 56.95L88.356 74.259C86.984 76.628 85.601 78.867 84.205 80.976ZM44.566 35.201L45.9 34.2C50.372 30.846 53.369 28.228 54.892 26.347C56.642 24.184 57.518 21.867 57.518 19.394C57.518 14.808 54.788 12.515 49.328 12.515C43.869 12.515 40.542 15.001 39.35 19.972C39.129 20.89 39.019 21.813 39.019 22.739C39.019 24.319 39.339 25.909 39.981 27.511C40.862 29.713 42.39 32.276 44.566 35.201Z" fill="#FFFFFF"/><path d="M77.162 97.2L98.362 97.2C98.841 97.2 99.221 97.395 99.5 97.784L104.66 104.984C105.203 105.743 105.096 106.394 104.337 106.938C104.094 107.113 103.822 107.2 103.522 107.2L72.002 107.2C71.068 107.2 70.602 106.733 70.602 105.8C70.602 105.5 70.689 105.228 70.864 104.984L76.024 97.784C76.303 97.395 76.682 97.2 77.162 97.2Z" fill="#FFD21F"/></g></svg>',truenorth:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0B1433"/><g transform="translate(20.98 23) scale(1.35) translate(-4 -4)"><path d="M4 4H31.5V13.25H22.75V44H12.75V13.25H4Z" fill="#FFFFFF"/><path d="M22.75 18L35 29.35V4H47V44H35L22.75 32.65Z" fill="#1F5BFF"/></g></svg>'};
// Built-in areas. The owner can rename, recolor, reorder or archive them and add new ones (table public.areas).
// A saved row replaces the default with the same id. logo is "builtin" (LOGOS[id]), a PNG data URL, or "".
var DEFAULT_AREAS=[
  {id:"baselab",name:"Baselab",short:"Baselab",color:"",icon:"play",logo:"",about:"short-form video content agency",order:1},
  {id:"dg",name:"D&G Carpet Cleaning",short:"D&G",color:"",icon:"drop",logo:"builtin",about:"local carpet and upholstery cleaning company",order:2},
  {id:"truenorth",name:"True North",short:"True North",color:"",icon:"north",logo:"builtin",about:"insurance agency and True North Education courses",order:3},
  {id:"personal",name:"Personal",short:"Personal",color:"",icon:"heart",logo:"",about:"personal life, health and personal brand",order:4}
];
var AREAS=DEFAULT_AREAS.slice(),ALL_AREAS=DEFAULT_AREAS.slice();
var SMART=[
  {id:"today",name:"Today",color:"var(--accent)"},
  {id:"scheduled",name:"Scheduled",color:"var(--red)",icon:"cal"},
  {id:"all",name:"All",color:"#636366",icon:"tray"},
  {id:"people",name:"People",color:"var(--green)",icon:"person"}
];
var state={areas:new Map(),tasks:new Map(),people:new Map(),notes:new Map(),plans:new Map(),builds:new Map(),recaps:new Map(),health_logs:new Map(),hseg:"",hday:"",logArea:"",view:"today",day:"",seg:"tasks",q:"",prev:"today",
  ready:false,slow:false,local:false,failed:false,showDone:false,
  cal:{status:"idle",events:[],msg:"",at:0},ai:null,planning:false,focus:null};
var db=null,sample=null,push=env.push||null,lastBadge=-1,chains={},noteTimer=null,undoFn=null,toastTimer=null,lastDay=ymd(new Date()),lastShown="",dumpItems=[];
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
function isDefaultArea(id){return DEFAULT_AREAS.some(function(a){return a.id===id})}
function colorOf(a){return a.color||(isDefaultArea(a.id)?"var(--a-"+a.id+")":"var(--muted)")}
function monogram(a){var w=String(a.short||a.name||"?").replace(/[^\p{L}\p{N}\s&]/gu,"").trim().split(/\s+/).filter(Boolean);var f=w[0]||"?";return (w.length>1?f.charAt(0)+w[1].charAt(0):f.length<=3?f:f.charAt(0)).toUpperCase()}
function safeImg(l){return /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/=]+$/.test(l||"")}
function areaIcon(a,cls){
  cls=cls||"";var l=a.logo||"";
  if(l==="builtin"&&LOGOS[a.id])return '<span class="ic logo '+cls+'">'+LOGOS[a.id]+"</span>";
  if(safeImg(l))return '<span class="ic logo img '+cls+'"><img src="'+l+'" alt=""></span>';
  var st=' style="--c:'+colorOf(a)+'"';
  if(a.icon&&a.icon!=="letter"&&G[a.icon])return '<span class="ic sq '+cls+'"'+st+'>'+G[a.icon]+"</span>";
  return '<span class="ic sq mono '+cls+'"'+st+'>'+esc(monogram(a))+"</span>";
}
function area(id){return ALL_AREAS.find(function(a){return a.id===id})||AREAS.find(function(a){return a.id==="personal"})||AREAS[0]||DEFAULT_AREAS[3]}
function isArea(id){return AREAS.some(function(a){return a.id===id})}
function col(id){return colorOf(area(id))}
function entries(coll){return Array.from(state[coll].entries()).map(function(e){return Object.assign({id:e[0]},e[1])})}
function byOrder(a,b){return (a.order||0)-(b.order||0)}
function byName(a,b){return String(a.name).localeCompare(String(b.name))}
function initials(n){return String(n||"?").trim().split(/\s+/).slice(0,2).map(function(w){return w.charAt(0).toUpperCase()}).join("")}
function lastArea(){var a=null;try{a=localStorage.getItem("db-area")}catch(_){}return isArea(a)?a:(isArea("personal")?"personal":AREAS[0].id)}

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
function sortByDue(x,y){if(!!x.due!==!!y.due)return x.due?-1:1;if(x.due!==y.due)return x.due<y.due?-1:1;return prioRank(x)-prioRank(y)||byOrder(x,y)}
function dueLabel(t,hideDay){
  if(!t.due)return "";var d=today(),m=hmOf(t),tm=m==null?"":hm(m),day;
  if(t.due<d)return '<span class="late">'+esc(fmt(t.due))+(tm?", "+tm:"")+"</span>";
  if(t.due===d){if(tm&&m<nowMins())return '<span class="late">'+tm+"</span>";day="Today"}
  else day=t.due===plus(1)?"Tomorrow":esc(fmt(t.due));
  return hideDay?tm:day+(tm?", "+tm:"");
}
var PRIOS=[["","None"],["high","High"],["medium","Medium"],["low","Low"]];
var WHO=[["","Not set"],["yes","Claude can do it"],["help","Claude helps, needs you"],["you","Needs you"]];
function prioRank(t){var r={high:0,medium:1,low:2}[t.priority];return r==null?3:r}
function prioName(t){var x=PRIOS.find(function(o){return o[0]===t.priority});return t.priority&&x?x[1]:""}
function prioMark(t){var n={high:3,medium:2,low:1}[t.priority];return n&&!t.done?'<span class="prio" title="'+prioName(t)+' priority" aria-label="'+prioName(t)+' priority">'+"!!!".slice(0,n)+"</span>":""}
function clBadge(t){if(t.done)return "";if(t.claude==="yes")return '<span class="cl yes">Claude can do</span>';if(t.claude==="help")return '<span class="cl">Claude helps</span>';return ""}
// Notes written by Claude often start with "Part of: <project>. Step 2 of 3." Pull that out so it can be shown on its own.
function partOf(note){
  var s=String(note||"").trim(),m=/^Part of:\s*(.+?)\.\s*(?:Step\s+([^.]+?)(?:,\s*[^.]*)?\.\s*)?/i.exec(s);
  if(!m)return {project:"",step:"",rest:s};
  return {project:m[1].trim(),step:(m[2]||"").trim(),rest:s.slice(m[0].length).trim()};
}
function whoLine(t){return t.claude==="yes"?"Claude can do this end to end.":t.claude==="help"?"Claude can do most of it, but needs something from you.":t.claude==="you"?"This one needs you.":""}
function summaryLine(t){
  var a=area(t.area),p=partOf(t.note),bits=[],td=today(),m=hmOf(t),when="";
  if(t.due){
    if(t.due<td&&!t.done)when="overdue since "+fmt(t.due);
    else if(t.due===td)when="due today"+(m!=null?" at "+hm(m):"");
    else if(t.due===plus(1))when="due tomorrow"+(m!=null?" at "+hm(m):"");
    else{var n=Math.round((toDate(t.due)-toDate(td))/864e5);when="due "+fmt(t.due)+(m!=null?" at "+hm(m):"")+(n>1&&n<60?" (in "+n+" days)":"")}
  }
  var lead=(t.priority?prioName(t)+" priority":"A")+" "+a.short+" task"+(when?", "+when:"")+".";
  bits.push(lead.charAt(0).toUpperCase()+lead.slice(1));
  if(p.project)bits.push((p.step?"Step "+p.step+(/ of /.test(p.step)?" in ":" of "):"Part of ")+p.project+".");
  if(whoLine(t))bits.push(whoLine(t));
  return bits.join(" ");
}
// A ready-to-paste prompt for handing the task to Claude.
function claudePrompt(t){
  var a=area(t.area),p=partOf(t.note),pp=t.person&&state.people.get(t.person),m=hmOf(t),L=[];
  L.push("I'd like your help with a task from my to-do list.","");
  L.push("Task: "+t.title);
  L.push("Business: "+a.name+(a.about?" ("+a.about+")":""));
  if(p.project)L.push("Part of: "+p.project+(p.step?" (step "+p.step+")":""));
  if(t.priority)L.push("Priority: "+prioName(t));
  if(t.due)L.push("Due: "+fmtLong(t.due)+(m!=null?", "+hm(m):""));
  if(pp)L.push("Person: "+pp.name+(pp.org?", "+pp.org:"")+(pp.contact?" ("+pp.contact+")":""));
  if(p.rest)L.push("","Details: "+p.rest);
  L.push("");
  if(t.claude==="yes")L.push("Please take this on from start to finish. Check what you can reach first (my connected apps, files and the web). Ask me only for access or a decision you can't make yourself. When you're done, tell me what you did and anything left for me.");
  else if(t.claude==="help")L.push("Do every part you can, and tell me exactly what you need from me (logins, files, photos or approvals) to finish. Keep my part as short as possible and say when you need it.");
  else L.push("I'll do this one myself. Give me a short plan: the steps in order, what to prepare, and what done looks like. Point out any part you could do for me.");
  return L.join("\n");
}
function copyText(text,done){
  function fallback(){var ta=document.createElement("textarea");ta.value=text;ta.setAttribute("readonly","");ta.style.cssText="position:fixed;top:0;left:0;opacity:0";document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand("copy")}catch(_){}ta.remove();done(ok)}
  try{if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(text).then(function(){done(true)},fallback);else fallback()}catch(_){fallback()}
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
  if(dl)bits.push('<span class="m'+(/class="late"/.test(dl)?" late":"")+'">'+(hmOf(t)!=null&&(o.hideDue||!!blk)?G.clock:G.cal)+dl+(t.remindMin!=null&&hmOf(t)!=null&&!t.done?'<span class="bell" aria-label="Reminder on">'+G.bell+"</span>":"")+"</span>");
  if(t.repeat)bits.push('<span class="m">'+G.rep+esc(repeatName(t.repeat))+"</span>");
  if(who)bits.push('<span class="m">'+G.person+esc(who)+"</span>");
  if(t.source)bits.push('<span class="m">'+esc(t.source)+"</span>");
  var cl=clBadge(t),pt=partOf(t.note),rest=pt.rest;
  if(pt.project&&!t.done)bits.push('<span class="m">'+G.list+esc(pt.project)+(pt.step?", step "+esc(pt.step.split(/\s+of\s+/)[0]):"")+"</span>");
  return '<li class="row'+(t.done?" done":"")+(t.priority==="high"&&!t.done?" hi":"")+'" data-swipe="'+esc(t.id)+'" style="--c:'+col(t.area)+'">'+
    '<button class="check" data-act="toggle" data-id="'+esc(t.id)+'" aria-label="'+(t.done?"Mark not done: ":"Mark done: ")+esc(t.title)+'"><i></i></button>'+
    '<button class="row-main" data-act="peek" data-id="'+esc(t.id)+'"><span class="row-title">'+prioMark(t)+esc(t.title)+"</span>"+
    (bits.length||cl?'<span class="row-meta">'+bits.join("")+cl+"</span>":"")+(rest&&!t.done?'<span class="row-note">'+esc(rest.split("\n")[0])+"</span>":"")+"</button>"+
    (o.next?'<button class="mini" data-act="do-next" data-id="'+esc(t.id)+'">Do next</button>':"")+
    (o.pull&&!t.done&&!(t.due&&t.due<=today())?'<button class="mini" data-act="to-today" data-id="'+esc(t.id)+'">Today</button>':"")+
    (blk?'<span class="slot">'+hmShort(parseHM(blk.start))+"–"+hm(parseHM(blk.end))+"</span>":"")+
    '<span class="row-go" aria-hidden="true">'+G.chev+"</span></li>";
}
// Split open tasks into Overdue / Today / This week / Later / No date, so a list reads in the order to do it.
function dueGroups(ts){
  var td=today(),wk=plus(7),g=[["Overdue",[],"late"],["Today",[]],["Next 7 days",[]],["Later",[]],["No date",[]]];
  ts.forEach(function(t){var i=!t.due?4:t.due<td?0:t.due===td?1:t.due<=wk?2:3;g[i][1].push(t)});
  return g.filter(function(x){return x[1].length});
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
    return '<button class="arow" style="--c:'+col(a.id)+'" data-act="go" data-view="'+a.id+'"'+(v===a.id?' aria-current="page"':"")+'>'+areaIcon(a)+"<span>"+esc(a.name)+'</span><span class="n">'+(n||"")+"</span>"+G.chev+"</button>"}).join("");
  var hl=$("hlist");if(hl)hl.innerHTML='<button class="arow" style="--c:var(--a-personal)" data-act="go" data-view="health"'+(v==="health"?' aria-current="page"':"")+'><span class="ic sq">'+G.pulse+"</span><span>Health</span><span class=\"n\"></span>"+G.chev+"</button>"+
    '<button class="arow" style="--c:#636366" data-act="go" data-view="log"'+(v==="log"?' aria-current="page"':"")+'><span class="ic sq">'+G.list+"</span><span>Build log</span><span class=\"n\">"+(entries("builds").filter(function(b){return b.day===today()}).length||"")+"</span>"+G.chev+"</button>";
  var c=state.cal.status,dot=c==="ok"?"ok":(c==="idle"||c==="loading"||c==="none")?"":"warn";
  var txt=c==="ok"?"Google Calendar synced":c==="loading"?"Syncing calendar…":c==="none"?"Calendar not set up":"Calendar needs attention";
  $("sidefoot").innerHTML=(dot==="warn"?'<button class="status" data-act="cal-refresh"><i class="warn"></i>'+txt+"</button>":"")+'<button class="status setrow" data-act="settings">'+G.gear+'<span>Settings</span><span class="setgo">'+(pushInfo.on?"Reminders on":"Reminders off")+"</span></button>";
  var tbn=$("themebtn");if(tbn){var th=setting("theme","auto");tbn.innerHTML=G[th==="light"?"sun":th==="dark"?"dark":"auto"];tbn.title="Appearance: "+(th==="auto"?"matches your device":th)}
  var tb=$("tabbar");
  if(tb){
    var cur=v==="search"?state.prev:v,tabs=[["today","Today",'<span class="tdn">'+new Date().getDate()+"</span>"+G.cal],["scheduled","Upcoming",G.cal],["quick","",G.add],["health","Health",G.pulse],["home","Areas",G.list]];
    tb.innerHTML=tabs.map(function(x){
      if(x[0]==="quick")return '<button class="tab add" data-act="quick" aria-label="New task">'+x[2]+"</button>";
      var on=x[0]===cur||(x[0]==="home"&&(isArea(cur)||cur==="all"||cur==="people"||cur==="log"||state.view==="home"));
      return '<button class="tab'+(x[0]==="today"?" today":"")+'" data-act="go" data-view="'+x[0]+'"'+(on?' aria-current="page"':"")+">"+x[2]+"<span>"+x[1]+"</span></button>"}).join("");
  }
}

/* ---------- schedule (right rail) ---------- */
function tcol(m){var h=Math.floor(m/60)%24;return (h%12||12)+(m%60?":"+pad(m%60):"")+"<small>"+(h<12?"AM":"PM")+"</small>"}
function dur(m){var h=Math.floor(m/60),mm=m%60;return (h?h+"h":"")+(h&&mm?" ":"")+(mm?mm+"m":"")}
function agendaItems(d){
  var items=[],plan=planFor(d),inPlan={};
  eventsOn(d).forEach(function(e){if(!e.allDay)items.push({s:e.s,e:Math.max(e.e,e.s+15),title:e.title,kind:"ev",free:e.free,focus:e.focus,loc:e.loc,desc:e.desc,url:e.url})});
  if(plan&&plan.blocks)plan.blocks.forEach(function(b){
    var t=state.tasks.get(b.taskId),s=parseHM(b.start),e=parseHM(b.end);if(!t||s==null||e==null)return;
    if(hmOf(t)!=null&&t.due===d&&t.atTime!==b.start)return;
    if(t.done&&t.doneOn!==d)return;
    inPlan[b.taskId]=1;items.push({s:s,e:e,title:t.title,kind:"task",t:t,id:b.taskId});
  });
  var td=today();
  entries("tasks").forEach(function(t){
    var m=hmOf(t);if(m==null||inPlan[t.id])return;
    if(t.done?t.doneOn!==d:!(t.due===d||(d===td&&t.due<td)))return;
    if(!t.done&&t.due<d)return;
    items.push({s:m,e:m,title:t.title,kind:"task",t:t,id:t.id});
  });
  if(health.agenda&&d===td)health.agenda(d).forEach(function(x){if(x.s!=null)items.push({s:x.s,e:x.s,title:x.title,sub:x.sub,kind:"meal",meal:x.meal,done:x.done})});
  return items.sort(function(a,b){return a.s-b.s||(a.kind==="ev"?-1:1)});
}
function agenda(d){
  var c=state.cal,isToday=d===today(),items=agendaItems(d),nm=isToday?nowMins():-1,h="",allday=eventsOn(d).filter(function(e){return e.allDay});
  h+='<div class="ag-head"><h2>Schedule</h2><span class="ag-date">'+esc(isToday?"Today":fmt(d))+'</span><span class="sp"></span>';
  if(c.status==="ok"||c.status==="error")h+='<button class="iconbtn" data-act="cal-refresh" aria-label="Refresh calendar">'+G.refresh+"</button>";
  h+="</div>";
  if(c.status==="none")h+='<p class="ag-msg">Connect Google Calendar (GCAL_ICS_URL in Vercel) to see meetings here.</p>';
  else if(c.status==="error"||c.status==="blocked")h+='<p class="ag-msg">'+esc(c.msg)+(c.retry?' <button class="link" data-act="cal-connect">Try again</button>':"")+"</p>";
  if(allday.length)h+='<div class="allday">'+allday.map(function(e){return "<span>"+esc(e.title)+"</span>"}).join("")+"</div>";
  if(!items.length){
    h+='<p class="ag-empty">'+(c.status==="loading"?'<span class="shimmer">Loading your calendar…</span>':"Nothing at a set time"+(isToday?" today":"")+'. Give a task a time, like "call Sarah 3pm", or tap Plan my day.')+"</p>";
    return '<section class="agenda">'+h+"</section>";
  }
  var rows="",nowDone=!isToday,lastEnd=null;
  function nowRow(){nowDone=true;return '<li class="ag-now"><span class="ag-t">'+tcol(nm)+'</span><span class="ag-line"></span></li>'}
  items.forEach(function(it){
    var past=isToday&&Math.max(it.e,it.s+1)<=nm;
    if(!nowDone&&it.s>nm){
      if(lastEnd!=null&&it.s-Math.max(lastEnd,nm)>=45&&nm<it.s)rows+=nowRow()+'<li class="ag-free">'+dur(it.s-Math.max(lastEnd,nm))+" free</li>";
      else rows+=nowRow();
    }else if(lastEnd!=null&&it.s-lastEnd>=60&&!past&&lastEnd>=nm)rows+='<li class="ag-free">'+dur(it.s-lastEnd)+" free</li>";
    var t=it.t,mk,body,cls="ag-row "+it.kind+(past?" past":"");
    var range=it.e>it.s?hmShort(it.s)+"–"+hm(it.e):"";
    if(it.kind==="task"){
      cls+=t.done?" done":"";
      mk='<button class="check" data-act="toggle" data-id="'+esc(it.id)+'" aria-label="'+(t.done?"Mark not done: ":"Mark done: ")+esc(t.title)+'"><i></i></button>';
      body='<button class="ag-body" data-act="peek" data-id="'+esc(it.id)+'" data-day="'+d+'"><b>'+esc(it.title)+"</b><small>"+[range,esc(area(t.area).short),t.remindMin!=null&&!t.done?"Reminder on":""].filter(Boolean).join(" · ")+"</small></button>";
      rows+='<li class="'+cls+'" data-swipe="'+esc(it.id)+'" style="--c:'+col(t.area)+'"><span class="ag-t">'+tcol(it.s)+"</span>"+mk+body+"</li>";
    }else if(it.kind==="meal"){
      cls+=it.done?" done":"";
      mk='<button class="check" data-act="h-meal" data-meal="'+esc(it.meal)+'" aria-label="'+(it.done?"Mark not eaten: ":"Mark eaten: ")+esc(it.title)+'"><i></i></button>';
      rows+='<li class="'+cls+'" style="--c:var(--a-personal)"><span class="ag-t">'+tcol(it.s)+"</span>"+mk+'<button class="ag-body" data-act="h-meal-open" data-meal="'+esc(it.meal)+'"><b>'+esc(it.title)+"</b><small>"+esc(it.sub||"")+"</small></button></li>";
    }else{
      rows+='<li class="'+cls+(it.free?" free":"")+'"><span class="ag-t">'+tcol(it.s)+'</span><span class="ag-bar"></span><button class="ag-body" data-act="peek-ev" data-day="'+d+'" data-s="'+it.s+'" data-title="'+esc(it.title)+'"><b>'+esc(it.title)+"</b><small>"+[range,it.loc?esc(it.loc):""].filter(Boolean).join(" · ")+"</small></button></li>";
    }
    lastEnd=Math.max(lastEnd||0,it.e);
  });
  if(!nowDone&&isToday)rows+=nowRow();
  return '<section class="agenda">'+h+'<ul class="ag">'+rows+"</ul></section>";
}

/* ---------- manager card ---------- */
function briefCard(d){
  if(state.ai===false)return "";
  var plan=planFor(d),isToday=d===today(),h='<section class="planbar">';
  if(state.planning)h+='<p><span class="shimmer">Planning around your calendar…</span></p>';
  else if(plan&&plan.brief)h+="<p>"+esc(plan.brief)+"</p>";
  h+='<div class="acts"><button class="btn ghost" data-act="plan"'+(state.planning?" disabled":"")+">"+(plan?"Re-plan":"Plan my day")+'</button><button class="btn ghost" data-act="dump">Brain dump</button>'+
    (isToday&&dayTasks(d).length>5?'<button class="btn ghost" data-act="push-rest">Move extras to tomorrow</button>':"")+"</div>";
  return h+"</section>";
}

/* ---------- pages ---------- */
function ring(done,total){
  var r=15,c=2*Math.PI*r,f=total?done/total:0;
  return '<div class="ring" role="img" aria-label="'+done+" of "+total+' done"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="'+r+'" class="rb"/><circle cx="18" cy="18" r="'+r+'" class="rf" stroke-dasharray="'+(c*f).toFixed(1)+" "+c.toFixed(1)+'"/></svg><span><b>'+done+"</b>/"+total+"</span></div>";
}
function pageToday(){
  var td=today(),d=state.day||td,isToday=d===td,tasks=dayTasks(d),done=doneOn(d),dt=toDate(d),h="";
  var title=isToday?"Today":d===plus(1)?"Tomorrow":dt.toLocaleDateString(undefined,{weekday:"long"});
  var bits=[];if(tasks.length)bits.push(tasks.length+" to do");if(busyCount(d))bits.push(busyCount(d)+" on your calendar");
  h+='<div class="thead"><div class="grow"><div class="kicker">'+esc(dt.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}))+"</div><h1>"+esc(title)+'</h1><div class="sub">'+(bits.join(" · ")||"Nothing planned")+"</div></div>"+ring(done.length,done.length+tasks.length)+"</div>";
  h+='<div class="week" role="group" aria-label="Pick a day">';
  for(var i=0;i<7;i++){
    var dd=plus(i),ts=dayTasks(dd),x=toDate(dd),ne=busyCount(dd);
    h+='<button class="day'+(i===0?" is-today":"")+'" data-act="day" data-day="'+dd+'" aria-pressed="'+(dd===d)+'" aria-label="'+esc(fmtLong(dd))+", "+ts.length+' tasks"><span class="wd">'+esc(x.toLocaleDateString(undefined,{weekday:"narrow"}))+'</span><span class="dn">'+x.getDate()+'</span><span class="dots">'+
      new Array(Math.min(3,ts.length+(ne?1:0))+1).join("<i></i>")+"</span></button>";
  }
  h+="</div>";
  if(isToday)h+=nudge();
  var timed={},ag=agendaItems(d);ag.forEach(function(it){if(it.id)timed[it.id]=1});
  var n=null;
  if(isToday&&tasks.length){
    var soon=tasks.filter(isTimeSoon).sort(function(x,y){return hmOf(x)-hmOf(y)})[0];
    n=soon||tasks.filter(function(x){return !timed[x.id]})[0]||tasks[0];
    var a=area(n.area),who=personName(n.person),f=state.focus&&state.focus.id===n.id?state.focus:null,meta=[];
    if(hmOf(n)!=null)meta.push(dueLabel(n,true));
    if(n.due<td)meta.push('<span class="late">From '+esc(fmt(n.due))+"</span>");
    if(who)meta.push(esc(who));
    if(n.repeat)meta.push(esc(repeatName(n.repeat)));
    h+='<section class="now" style="--c:'+col(n.area)+'"><div class="label"><span class="nowtag">Next up</span><span class="adot"></span>'+esc(a.short)+(meta.length?' <span class="time">· '+meta.join(" · ")+"</span>":"")+'</div><div class="title">'+prioMark(n)+esc(n.title)+clBadge(n)+"</div>"+
      (partOf(n.note).rest?'<div class="meta">'+esc(function(r){return r.length>140?r.slice(0,140)+"…":r}(partOf(n.note).rest))+"</div>":"")+
      '<div class="pills"><button class="btn donebtn" data-act="toggle" data-id="'+esc(n.id)+'">'+G.tick+'Done</button><button class="pill" data-act="snooze" data-id="'+esc(n.id)+'">Snooze</button><button class="pill'+(f?" on":"")+'" data-act="focus" data-id="'+esc(n.id)+'" aria-label="Focus">'+G.timer+(f?'<span class="timer" id="timer">'+timerText()+"</span>":'<span class="ftxt">Focus</span>')+'</button><span class="sp"></span><button class="pill" data-act="peek" data-id="'+esc(n.id)+'">Details</button></div></section>';
  }else if(isToday){
    h+='<section class="now empty"><div class="title">'+(done.length?"All done for today.":"Nothing planned yet.")+'</div><div class="meta">'+(done.length?"Nice work. Tap a day above to plan ahead.":"Tap + to add a task, or brain dump everything on your mind.")+"</div></section>";
  }
  h+=briefCard(d);
  var anytime=tasks.filter(function(t){return t!==n&&!timed[t.id]});
  var ag_html=agenda(d);
  if(mq.matches)h+=ag_html;
  var tip=mq.matches&&anytime.length&&setting("tip-swipe","")!=="1"?'<div class="tip"><span>Swipe a task right to finish it, left to snooze it.</span><button class="link" data-act="tip-off">Got it</button></div>':"";
  h+='<section><h2>'+(isToday?"Anytime today":"To do")+' <span class="n">'+(anytime.length||"")+"</span></h2>"+tip+panel(anytime.map(function(t){return taskRow(t,{showArea:true,hideDue:!isToday||t.due===td,next:isToday})}),addRow("day",null,d))+"</section>";
  if(isToday){
    var fu=followUps();
    if(fu.length)h+='<section style="--c:var(--green)"><h2>Follow up <span class="n">'+fu.length+"</span></h2>"+panel(fu.map(function(p){return personRow(p,{showArea:true})}))+"</section>";
    h+=health.todayCard();
  }
  if(done.length)h+='<section><button class="link" data-act="show-done">'+(state.showDone?"Hide":"Show")+" "+done.length+" completed</button>"+(state.showDone?'<div style="margin-top:8px">'+panel(done.map(function(t){return taskRow(t,{showArea:true,hideDue:true})}))+"</div>":"")+"</section>";
  if(mq.matches)return '<div class="single today">'+h+"</div>";
  return '<div class="cols"><div class="colmain">'+h+'</div><div class="rail">'+ag_html+"</div></div>";
}
function pageScheduled(){
  var td=today(),open=openTasks(),dated=open.filter(function(t){return t.due}),h='<div class="hero" style="--c:var(--red)"><div class="grow"><h1>Scheduled</h1><div class="sub">'+dated.length+" with a date</div></div></div>";
  var late=dated.filter(function(t){return t.due<td}).sort(function(a,b){return a.due<b.due?-1:1});
  if(late.length)h+='<section style="--c:var(--red)"><h2>Overdue <span class="n">'+late.length+'</span><span class="sp"></span><button class="link" data-act="late-today">Move all to today</button></h2>'+panel(late.map(function(t){return taskRow(t,{showArea:true,pull:true})}))+"</section>";
  var days=[td,plus(1)];
  dated.forEach(function(t){if(t.due>=td&&days.indexOf(t.due)<0)days.push(t.due)});
  days.sort().forEach(function(d,i){
    var ts=dated.filter(function(t){return t.due===d}).sort(byOrder);
    h+="<section><h2>"+(d===td?"Today":d===plus(1)?"Tomorrow":esc(fmtLong(d)))+' <span class="n">'+(ts.length||"")+"</span></h2>"+panel(ts.map(function(t){return taskRow(t,{showArea:true,hideDue:true,pull:true})}),i<1?addRow("s"+i,null,d):"")+"</section>";
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
  var h='<div class="hero" style="--c:'+col(id)+'">'+areaIcon(a,"lg")+'<div class="grow"><h1>'+esc(a.name)+'</h1><div class="sub">'+open.length+" open · "+due+" today · "+ppl.length+(ppl.length===1?" person":" people")+'</div></div><button class="iconbtn hero-edit" data-act="area-edit" data-id="'+esc(id)+'" aria-label="Edit '+esc(a.name)+'" title="Edit area">'+G.pen+"</button></div>";
  h+='<div class="seg" role="group" aria-label="Section">'+["tasks","people","notes","log"].map(function(s){return '<button data-act="seg" data-seg="'+s+'" aria-pressed="'+(state.seg===s)+'">'+s.charAt(0).toUpperCase()+s.slice(1)+"</button>"}).join("")+"</div>";
  if(state.seg==="tasks"){
    var done=entries("tasks").filter(function(t){return t.done&&t.area===id}).sort(function(x,y){return x.doneOn<y.doneOn?1:-1}).slice(0,30);
    var nCl=open.filter(function(t){return t.claude==="yes"||t.claude==="help"}).length,shown=state.clOnly&&nCl?open.filter(function(t){return t.claude==="yes"||t.claude==="help"}):open;
    if(nCl)h+='<div class="tfilter" role="group" aria-label="Filter tasks"><button class="chip" data-act="cl-only" data-on="0" aria-pressed="'+!(state.clOnly)+'">All <b>'+open.length+'</b></button><button class="chip" data-act="cl-only" data-on="1" aria-pressed="'+!!state.clOnly+'">Claude can take on <b>'+nCl+"</b></button></div>";
    var grp=dueGroups(shown);
    if(!grp.length)h+="<section>"+panel([],addRow("area-"+id,id,""))+"</section>";
    grp.forEach(function(g,i){h+='<section class="grp'+(g[2]?" "+g[2]:"")+'"><h2>'+g[0]+' <span class="n">'+g[1].length+"</span></h2>"+panel(g[1].map(function(t){return taskRow(t,{pull:true,hideDue:g[0]==="Today"&&hmOf(t)==null})}),i===grp.length-1?addRow("area-"+id,id,""):"")+"</section>"});
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
  o=o||{};var a=area(b.area),bits=[];
  if(b.atTime)bits.push(esc(timeLabel(b.atTime)));
  if(o.showArea)bits.push(esc(a.short));
  if(b.size==="small")bits.push("Small fixes");
  var tags=(b.live?'<span class="bl-pill live">Live</span>':"")+(b.openItems?'<span class="bl-pill open">Open items</span>':"");
  return '<li class="bl-item" style="--c:'+col(b.area)+'"><button class="bl-btn" data-act="open-build" data-id="'+esc(b.id)+'">'+areaIcon(a,"bl-ic")+
    '<span class="bl-main"><span class="bl-title">'+esc(b.title)+"</span>"+(b.summary?'<span class="bl-sum">'+esc(b.summary)+"</span>":"")+
    '<span class="bl-meta">'+bits.join(" · ")+tags+"</span></span>"+G.chev+"</button></li>";
}
function recapBlock(d,areaId){
  var r=state.recaps.get(d);if(!r)return "";
  var t=areaId?(r.areas&&r.areas[areaId])||"":r.text;
  if(!t)return "";
  var ps=t.split(/\n{2,}/).map(function(p){return p.replace(/^[-*]\s+/gm,"").trim()}).filter(Boolean);
  return '<details class="recap"'+(d===today()||d===plus(-1)?" open":"")+'><summary><span>Day recap</span>'+G.chev+"</summary>"+ps.map(function(p){return "<p>"+esc(p)+"</p>"}).join("")+"</details>";
}
function logMatch(b){
  if(state.view!=="log")return true;
  if(state.logOpen&&!b.openItems)return false;
  var q=(state.logQ||"").toLowerCase().trim();if(!q)return true;
  return [b.title,b.summary,b.openItems,(b.points||[]).join(" ")].join(" ").toLowerCase().indexOf(q)>=0;
}
function logDays(areaId,limit){
  var all=buildsFor(areaId),bs=all.filter(logMatch),days=[],h="",filtering=state.view==="log"&&!!(state.logOpen||(state.logQ||"").trim());
  bs.forEach(function(b){if(days.indexOf(b.day)<0)days.push(b.day)});
  if(!filtering)Array.from(state.recaps.keys()).forEach(function(d){if(days.indexOf(d)<0&&recapBlock(d,areaId))days.push(d)});
  days.sort().reverse();
  if(!days.length)return '<div class="panel"><div class="empty">'+(filtering&&all.length?"No entries match.":"Nothing logged yet. When a Claude session finishes real work"+(areaId?" for "+esc(area(areaId).name):"")+", it adds an entry here, and a recap of the day is written at 9 PM.")+"</div></div>";
  days.slice(0,limit||60).forEach(function(d){
    var mine=bs.filter(function(b){return b.day===d});
    h+='<section class="bl-day" id="bl-'+d+'"><div class="bl-dh"><h2>'+esc(dayLabel(d))+"</h2>"+(d===today()||d===plus(-1)?'<span class="bl-date">'+esc(fmtLong(d))+"</span>":"")+'<span class="sp"></span><span class="n">'+(mine.length?mine.length+(mine.length===1?" entry":" entries"):"")+"</span></div>"+
      recapBlock(d,areaId)+(mine.length?'<ul class="bl-list">'+mine.map(function(b){return buildRow(b,{showArea:!areaId})}).join("")+"</ul>":"")+"</section>";
  });
  return h;
}
function pageLog(){
  var a=state.logArea,bs=buildsFor(a),wk=plus(-6),week=bs.filter(function(b){return b.day>=wk});
  var live=week.filter(function(b){return b.live}).length,open=bs.filter(function(b){return b.openItems}).length;
  var h='<div class="hero"><div class="grow"><h1>Build log</h1><div class="sub">What got built, by day'+(a?" in "+esc(area(a).name):"")+"</div></div></div>";
  h+='<div class="bl-stats"><div><b>'+week.length+'</b><span>This week</span></div><div><b>'+live+'</b><span>Shipped live</span></div><button data-act="log-open" aria-pressed="'+!!state.logOpen+'"><b>'+open+"</b><span>"+(state.logOpen?"Showing open items":"With open items")+"</span></button></div>";
  h+='<div class="bl-bar"><label class="bl-search">'+'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'+'<input data-key="log-q" type="search" placeholder="Search the log" aria-label="Search the build log" value="'+esc(state.logQ||"")+'" autocomplete="off"></label>'+
    '<div class="chips bl-chips" role="group" aria-label="Filter by area"><button class="chip'+(a?"":" on")+'" data-act="log-area" data-area="">All</button>'+AREAS.map(function(x){return '<button class="chip'+(a===x.id?" on":"")+'" style="--c:'+col(x.id)+'" data-act="log-area" data-area="'+x.id+'"><span class="dot"></span>'+esc(x.short)+"</button>"}).join("")+"</div></div>";
  var days=[];bs.filter(logMatch).forEach(function(b){if(days.indexOf(b.day)<0)days.push(b.day)});
  var idx=days.length>3?'<nav class="bl-idx" aria-label="Jump to day">'+days.slice(0,30).map(function(d){var n=bs.filter(function(b){return b.day===d&&logMatch(b)}).length;return '<button data-act="log-jump" data-day="'+d+'"><span>'+esc(d===today()?"Today":d===plus(-1)?"Yesterday":fmt(d))+"</span><b>"+n+"</b></button>"}).join("")+"</nav>":"";
  return '<div class="single log">'+h+'<div class="bl-wrap">'+idx+'<div class="bl-days">'+logDays(a)+"</div></div></div>";
}
function buildSheet(id){
  var b=state.builds.get(id);if(!b)return;
  var pts=(b.points||[]).filter(Boolean),a=area(b.area);
  openSheet('<div class="peek" style="--c:'+col(b.area)+'"><div class="pk-top"><span class="pk-tag"><i class="pk-dot"></i>'+esc(a.name)+(b.live?' · <span class="ok">Live</span>':"")+'</span><span class="sp"></span><button class="iconbtn" data-act="close" aria-label="Close">'+G.x+"</button></div>"+
    '<h3 class="pk-title">'+esc(b.title)+"</h3>"+
    '<div class="pk-when">'+G.clock+"<span><b>"+esc(fmtLong(b.day))+(b.atTime?", "+esc(timeLabel(b.atTime)):"")+"</b>"+(b.size==="small"?'<span class="pk-rel">Small fixes</span>':"")+"</span></div>"+
    (b.summary?'<p class="bsum">'+esc(b.summary)+"</p>":"")+
    (pts.length?'<div class="bl-sec"><div class="gh">What changed</div><ul class="bl-pts">'+pts.map(function(x){return "<li>"+G.tick+"<span>"+esc(x)+"</span></li>"}).join("")+"</ul></div>":"")+
    (b.openItems?'<div class="bl-open"><div class="gh">Still open</div><p>'+esc(b.openItems)+"</p></div>":"")+
    '<div class="pk-acts">'+(b.link&&/^https?:\/\//.test(b.link)?'<a class="btn ghost" href="'+esc(b.link)+'" target="_blank" rel="noopener">'+G.ext+"Open</a>":"")+'<button class="btn ghost bl-del" data-act="del-build" data-id="'+esc(id)+'">Delete</button></div>'+
    (b.link&&!/^https?:\/\//.test(b.link)?'<p class="row-meta">Where: '+esc(b.link)+"</p>":"")+"</div>");
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
var railKeep=null;
function render(){
  var v=state.view;if(v==="home"&&!mq.matches)v="today";
  $("app").dataset.view=state.view==="home"&&mq.matches?"home":v;
  renderSide(v);
  var shown=state.view==="home"?"today":v,page=$("page"),keep={},h="",msg="";
  page.querySelectorAll("[data-key]").forEach(function(el){keep[el.dataset.key]={v:el.value,f:document.activeElement===el,s:el.selectionStart,e:el.selectionEnd}});
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
  else if(shown==="health")h+=health.page();
  else if(isArea(shown))h+=pageArea(shown);
  else h+=pageToday();
  if(shown!==lastShown)railKeep=null;
  page.innerHTML=h;
  var rail=page.querySelector(".rail");
  if(rail){
    // Until you scroll the schedule yourself, it follows the current time; after that it stays where you left it.
    if(railKeep!=null)rail.scrollTop=railKeep;
    else{var nw=rail.querySelector(".ag-now");if(nw)rail.scrollTop=Math.max(0,nw.offsetTop-rail.clientHeight/3)}
    var mine=function(){rail.dataset.user="1"};
    rail.addEventListener("wheel",mine,{passive:true});rail.addEventListener("touchstart",mine,{passive:true});rail.addEventListener("keydown",mine);rail.addEventListener("pointerdown",mine);
    rail.addEventListener("scroll",function(){if(rail.dataset.user)railKeep=rail.scrollTop},{passive:true});
  }
  page.querySelectorAll("[data-key]").forEach(function(el){
    var x=keep[el.dataset.key];if(!x)return;
    if(el.tagName!=="TEXTAREA"||x.f)el.value=x.v;
    if(x.f){el.focus();try{el.setSelectionRange(x.s,x.e)}catch(_){}}
  });
  if(push&&state.ready){var bn=dayTasks(today()).length;if(bn!==lastBadge){lastBadge=bn;push.badge(bn)}}
  if(shown!==lastShown){lastShown=shown;$("main").scrollTop=0;page.classList.remove("enter");void page.offsetWidth;page.classList.add("enter")}
}

/* ---------- focus timer ---------- */
var focusTick=null,focusEnd=null,alarmLoop=null,actx=null,baseTitle=document.title;
// How long a task should take: its block in today's plan, else its time range, else 25 minutes.
function focusGuess(t){
  var b=blockFor(t.id,today())||blockFor(t.id,t.due||"");
  if(b){var m=parseHM(b.end)-parseHM(b.start);if(m>=5)return {mins:m,why:"Your plan gives it "+dur(m)+"."}}
  return {mins:25,why:""};
}
function timerText(){if(!state.focus)return "";var left=Math.max(0,Math.round((state.focus.end-Date.now())/1000)),h=Math.floor(left/3600),m=Math.floor(left%3600/60);return (h?h+":"+pad(m):m)+":"+pad(left%60)}
function focusSheet(id){
  var t=state.tasks.get(id);if(!t)return;var g=focusGuess(t),opts=[15,25,45,60,90];if(opts.indexOf(g.mins)<0)opts.push(g.mins);opts.sort(function(x,y){return x-y});
  openSheet('<div class="fs"><div class="fs-top"><h3>Focus on this</h3><button class="pk-x" data-act="close" aria-label="Close">'+G.x+'</button></div><p class="lead">'+esc(t.title)+'</p>'+
    '<button class="btn blue fs-go" data-act="focus-start" data-id="'+esc(id)+'" data-min="'+g.mins+'">'+G.timer+"Start "+dur(g.mins)+"</button>"+
    (g.why?'<p class="fs-why">'+esc(g.why)+"</p>":"")+
    '<div class="fs-lbl">Or pick a length</div><div class="chips">'+opts.map(function(m){return '<button class="chip'+(m===g.mins?" on":"")+'" data-act="focus-start" data-id="'+esc(id)+'" data-min="'+m+'">'+dur(m)+"</button>"}).join("")+"</div>"+
    '<p class="fs-note">An alarm sounds when the time is up. Keep this tab open; it can be in the background.</p></div>');
}
function unlockAudio(){try{var C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!actx)actx=new C();if(actx.state==="suspended")actx.resume()}catch(_){}}
function chime(){
  if(!actx)return;try{var t0=actx.currentTime;
  [0,.22,.44,.9,1.12,1.34].forEach(function(dt,i){var o=actx.createOscillator(),g=actx.createGain();o.type="sine";o.frequency.value=i%3===2?1175:880;g.gain.setValueAtTime(0,t0+dt);g.gain.linearRampToValueAtTime(.35,t0+dt+.02);g.gain.exponentialRampToValueAtTime(.001,t0+dt+.2);o.connect(g);g.connect(actx.destination);o.start(t0+dt);o.stop(t0+dt+.22)})}catch(_){}
}
function saveFocus(){try{if(state.focus)localStorage.setItem("db-focus",JSON.stringify(state.focus));else localStorage.removeItem("db-focus")}catch(_){}}
function armFocus(){
  clearInterval(focusTick);clearTimeout(focusEnd);
  if(!state.focus){document.title=baseTitle;drawFocusBar();return}
  // one plain timeout for the end, so a background tab still fires on time
  focusEnd=setTimeout(focusAlarm,Math.max(0,state.focus.end-Date.now()));
  focusTick=setInterval(function(){
    if(!state.focus){clearInterval(focusTick);return}
    if(Date.now()>=state.focus.end){focusAlarm();return}
    var tx=timerText(),el=$("timer");if(el)el.textContent=tx;var fb=document.querySelector("#focusbar .fb-t");if(fb)fb.textContent=tx;document.title=tx+" · "+((state.tasks.get(state.focus.id)||{}).title||"Focus");
  },1000);
  drawFocusBar();
}
function startFocus(id,mins){
  unlockAudio();
  try{if(window.Notification&&Notification.permission==="default")Notification.requestPermission()}catch(_){}
  state.focus={id:id,end:Date.now()+mins*60000,mins:mins};saveFocus();armFocus();render();
  toast("Focus started: "+dur(mins)+". An alarm sounds at the end.");
}
function stopFocus(){state.focus=null;saveFocus();stopAlarm();armFocus();render()}
function toggleFocus(id){if(state.focus&&state.focus.id===id)stopFocus();else focusSheet(id)}
function stopAlarm(){clearInterval(alarmLoop);alarmLoop=null;document.title=baseTitle}
function focusAlarm(){
  if(!state.focus)return;var f=state.focus,t=state.tasks.get(f.id);
  clearInterval(focusTick);clearTimeout(focusEnd);state.focus=null;saveFocus();
  unlockAudio();chime();var n=0;stopAlarm();alarmLoop=setInterval(function(){if(++n>=20){stopAlarm();return}chime();document.title=n%2?"Time's up":baseTitle},2500);
  document.title="Time's up";
  try{if(window.Notification&&Notification.permission==="granted")new Notification("Time's up",{body:(t?t.title+". ":"")+dur(f.mins||25)+" of focus done.",tag:"db-focus",requireInteraction:true})}catch(_){}
  drawFocusBar();render();
  openSheet('<div class="fs"><div class="fs-top"><h3>Time’s up</h3></div><p class="lead">'+(t?esc(t.title)+". ":"")+dur(f.mins||25)+' of focus done.</p>'+
    '<div class="fs-acts">'+(t&&!t.done?'<button class="btn blue" data-act="alarm-done" data-id="'+esc(f.id)+'">'+G.tick+"Mark done</button>":"")+
    '<button class="btn ghost" data-act="alarm-more" data-id="'+esc(f.id)+'" data-min="5">5 more min</button><button class="btn ghost" data-act="alarm-more" data-id="'+esc(f.id)+'" data-min="15">15 more min</button>'+
    '<button class="btn ghost" data-act="alarm-stop">Stop alarm</button></div></div>');
  $("sheet").dataset.kind="alarm";
}
function drawFocusBar(){
  var fb=$("focusbar");
  if(!state.focus){if(fb)fb.remove();return}
  if(!fb){fb=document.createElement("div");fb.id="focusbar";document.body.appendChild(fb)}
  var t=state.tasks.get(state.focus.id);
  fb.innerHTML='<span class="fb-dot"></span><button class="fb-main" data-fb="open">'+G.timer+'<span class="fb-t">'+timerText()+'</span><span class="fb-n">'+esc(t?t.title:"Focus")+'</span></button><button class="fb-x" data-fb="stop" aria-label="Stop focus">'+G.x+"</button>";
}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-fb]");if(!b)return;if(b.dataset.fb==="stop")stopFocus();else if(state.focus)peekTask(state.focus.id)});
(function(){try{var f=JSON.parse(localStorage.getItem("db-focus")||"null");if(f&&f.end>Date.now()){state.focus=f;setTimeout(armFocus,0)}else localStorage.removeItem("db-focus")}catch(_){}})();

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
    var ex={loc:String(o.location||"").slice(0,200),desc:String(o.description||"").replace(/<[^>]+>/g," ").replace(/[ \t]+/g," ").trim().slice(0,600),url:/^https:\/\//.test(o.htmlLink||o.url||"")?(o.htmlLink||o.url):""};
    res.push(Object.assign({day:s.day,allDay:false,s:s.mins,e:Math.max(endM,s.mins+15),title:title,free:free,focus:focus},ex));
    if(e&&!e.allDay&&e.day>s.day&&e.mins>0)res.push(Object.assign({day:e.day,allDay:false,s:0,e:e.mins,title:title,free:free,focus:focus},ex));
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
function openSheet(html,wide){var s=$("sheet");delete s.dataset.kind;$("overlay").classList.remove("pop");s.style.cssText="";s.className="sheet"+(wide?" wide":"");s.innerHTML=html;$("overlay").classList.add("open");var f=s.querySelector("textarea,input,button");if(f&&!mq.matches)f.focus()}
function closeSheet(){areaDraft=null;if(alarmLoop)stopAlarm();var o=$("overlay"),s=$("sheet");o.classList.remove("open","pop");s.classList.remove("pop");s.style.cssText="";s.innerHTML=""}
// Desktop: show the sheet as a card next to what was clicked (like Apple Calendar). Phone: bottom sheet.
function anchorSheet(anchor){
  var o=$("overlay"),s=$("sheet");
  if(mq.matches||!anchor||!anchor.getBoundingClientRect){return}
  var r=(anchor.closest(".ag-row,.row,.bl-item")||anchor).getBoundingClientRect(),w=s.querySelector(".pk-prompt")?384:360,gap=12;
  o.classList.add("pop");s.classList.add("pop");s.style.width=w+"px";
  var left=r.left-w-gap;if(left<gap)left=Math.min(r.right+gap,innerWidth-w-gap);
  var h=s.offsetHeight,top=Math.min(Math.max(gap,r.top+r.height/2-80),innerHeight-h-gap);
  s.style.left=Math.max(gap,left)+"px";s.style.top=Math.max(gap,top)+"px";
  s.style.setProperty("--ay",Math.min(Math.max(18,r.top+r.height/2-Math.max(gap,top)),h-18)+"px");
  s.classList.toggle("from-right",left>=r.right);
}
function taskSheet(id){
  var t=state.tasks.get(id);if(!t)return;
  var people=entries("people").sort(byName);
  openSheet('<h3>Task</h3><form id="task-form" data-id="'+esc(id)+'" style="display:contents">'+
    '<div class="field"><label for="f-title">Title</label><input id="f-title" type="text" value="'+esc(t.title)+'" required></div>'+
    '<div class="two"><div class="field"><label for="f-area">Area</label><select id="f-area">'+areaOptions(t.area,true)+'</select></div>'+
    '<div class="field"><label for="f-due">Date</label><input id="f-due" type="date" value="'+esc(t.due||"")+'"></div></div>'+
    '<div class="two"><div class="field"><label for="f-prio">Priority</label><select id="f-prio">'+PRIOS.map(function(o){return '<option value="'+o[0]+'"'+((t.priority||"")===o[0]?" selected":"")+">"+o[1]+"</option>"}).join("")+"</select></div>"+
    '<div class="field"><label for="f-claude">Who does it</label><select id="f-claude">'+WHO.map(function(o){return '<option value="'+o[0]+'"'+((t.claude||"")===o[0]?" selected":"")+">"+o[1]+"</option>"}).join("")+"</select></div></div>"+
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
/* ---------- peek: the popup for anything on the schedule ---------- */
function relTime(d,s,e){
  if(d!==today())return "";
  var nm=nowMins();
  if(nm<s)return "In "+dur(s-nm);
  if(e>s&&nm<e)return "Now · "+dur(e-nm)+" left";
  if(e===s&&nm-s<5)return "Now";
  return "Ended "+dur(nm-Math.max(s,e))+" ago";
}
function rangeText(s,e){return e>s?((s<720)===(e<720)?hmShort(s):hm(s))+" – "+hm(e):hm(s)}
function dayText(d){return d===today()?"Today":d===plus(1)?"Tomorrow":fmtLong(d)}
function neighbours(d,s,e,self){
  var items=agendaItems(d),next=null;
  items.forEach(function(it){if(it===self)return;if(it.s>=Math.max(e,s+1)&&(!next||it.s<next.s))next=it});
  if(!next)return '<div class="pk-next"><span>Up next</span><b>Nothing else'+(d===today()?" today":"")+"</b></div>";
  var gap=next.s-Math.max(e,s);
  return '<div class="pk-next"><span>Up next</span><b>'+esc(next.title)+"</b><em>"+hm(next.s)+(gap>=15?" · "+dur(gap)+" free before":"")+"</em></div>";
}
function peekShell(o){
  var live=/Now|Overdue/.test(o.rel),past=/^Ended/.test(o.rel);
  return '<div class="peek" style="--c:'+o.color+'">'+
    '<div class="pk-head"><span class="pk-mark '+o.mark+'"></span><div class="pk-htext"><h3 class="pk-title">'+esc(o.title)+'</h3><div class="pk-sub">'+o.sub+'</div></div><button class="pk-x" data-act="close" aria-label="Close">'+G.x+"</button></div>"+
    (o.range==null?"":'<div class="pk-time"><div class="pk-tt"><b>'+esc(o.range)+"</b><span>"+esc(o.date)+"</span></div>"+(o.rel?'<span class="pk-chip'+(live?" live":past?" past":"")+'">'+esc(o.rel)+"</span>":"")+"</div>")+
    (o.pills&&o.pills.length?'<div class="pk-pills">'+o.pills.join("")+"</div>":"")+
    (o.facts.length?'<ul class="pk-rows">'+o.facts.map(function(f){return "<li>"+f[0]+"<span>"+f[1]+"</span></li>"}).join("")+"</ul>":"")+
    (o.note?'<div class="pk-note">'+esc(o.note).replace(/\n/g,"<br>")+"</div>":"")+
    o.ctx+'<div class="pk-acts">'+o.acts+"</div></div>";
}
// The task popup: a full card that says what the task is, when, how important, who does it, and what to do next.
function daysFrom(a,b){return Math.round((toDate(b)-toDate(a))/864e5)}
function contactLink(c){
  c=String(c||"").trim();if(!c)return "";
  if(/@/.test(c))return '<a href="mailto:'+esc(c)+'">'+esc(c)+"</a>";
  var dg=c.replace(/[^\d+]/g,"");return dg.length>=7?'<a href="tel:'+esc(dg)+'">'+esc(c)+"</a>":esc(c);
}
function peekTask(id,d){
  var t=state.tasks.get(id);if(!t)return;
  d=d||t.due||today();
  var b=blockFor(id,d),s=hmOf(t),e=s,td=today();
  if(b&&(s==null||b.start===t.atTime)){s=parseHM(b.start);e=parseHM(b.end)}
  var a=area(t.area),pt=partOf(t.note),eid=esc(id),late=t.due&&t.due<td&&!t.done;
  var pp=t.person&&state.people.get(t.person),self=agendaItems(d).find(function(x){return x.id===id}),foc=state.focus&&state.focus.id===id;
  // status line at the top
  var status="";
  if(t.done)status='<div class="tk-status ok">'+G.tick+"<span>Done"+(t.doneOn?" on "+esc(fmtLong(t.doneOn)):"")+"</span></div>";
  else if(late){var nl=daysFrom(t.due,td);status='<div class="tk-status late">'+G.cal+"<span><b>Overdue by "+nl+(nl===1?" day":" days")+".</b> It was due "+esc(fmtLong(t.due))+".</span></div>"}
  // the facts grid
  var cells=[],when,whenSub="";
  if(t.due||s!=null){
    var wd=t.due&&t.due>d?t.due:(t.due||d);
    when=esc(dayText(wd))+(s!=null?'<span class="tk-tm">'+esc(rangeText(s,e))+"</span>":"");
    if(late)whenSub='<span class="red">'+daysFrom(t.due,td)+" days late</span>";
    else if(!t.done&&wd===td&&s!=null)whenSub=esc(relTime(td,s,e)||"Today");
    else if(!t.done&&wd>td){var n=daysFrom(td,wd);whenSub=n===1?"Tomorrow":"In "+n+" days"}
    else if(wd===td)whenSub="Any time today";
  }else{when='<span class="mu">No date</span>';whenSub="Add one with Edit"}
  cells.push([G.cal,"When",when,whenSub]);
  var pn={high:3,medium:2,low:1}[t.priority];
  cells.push([G.flag,"Priority",pn?'<span class="prio">'+"!!!".slice(0,pn)+"</span>"+esc(prioName(t)):'<span class="mu">Not set</span>',{high:"Do this first",medium:"Do it soon",low:"When there's time"}[t.priority]||""]);
  var who=t.claude?WHO.find(function(o){return o[0]===t.claude})[1]:"";
  cells.push([G.person,"Who does it",who?(t.claude==="yes"?'<span class="blue">'+esc(who)+"</span>":esc(who)):'<span class="mu">Not set</span>',{yes:"Hand it off below",help:"Claude does most of it",you:"Only you can do this"}[t.claude]||""]);
  if(pt.project)cells.push([G.list,"Project",esc(pt.project),pt.step?"Step "+esc(pt.step):""]);
  if(t.remindMin!=null&&t.remindMin!==""&&!t.done&&s!=null)cells.push([G.bell,"Reminder",+t.remindMin?(+t.remindMin>=60?"1 hour":t.remindMin+" min")+" before":"At the time",t.alarm?"Plus iPhone alarm":""]);
  if(t.repeat)cells.push([G.rep,"Repeats",esc(repeatName(t.repeat)),""]);
  if(t.source)cells.push([G.inbox,"Came from",esc(t.source),""]);
  var h='<div class="tk">'+
    '<div class="tk-top">'+areaIcon(a)+'<span class="tk-crumb"><b>'+esc(a.name)+"</b>"+(pt.project?"<i>/</i>"+esc(pt.project):"")+'</span><button class="pk-x" data-act="close" aria-label="Close">'+G.x+"</button></div>"+
    '<div class="tk-head" style="--c:'+col(t.area)+'"><button class="tk-check'+(t.done?" on":"")+'" data-act="pk-toggle" data-id="'+eid+'" aria-label="'+(t.done?"Mark not done":"Mark done")+'"><i></i></button><h3 class="tk-title">'+esc(t.title)+"</h3></div>"+
    status+
    '<div class="tk-grid">'+cells.map(function(c){return '<div class="tk-cell"><div class="tk-k">'+c[0]+c[1]+'</div><div class="tk-v">'+c[2]+"</div>"+(c[3]?'<div class="tk-s">'+c[3]+"</div>":"")+"</div>"}).join("")+"</div>"+
    '<div class="tk-sec"><div class="tk-lbl">Notes</div>'+(pt.rest?'<div class="tk-notes">'+esc(pt.rest).replace(/\n/g,"<br>")+"</div>":'<div class="tk-notes mu">No notes yet. Add details with Edit.</div>')+"</div>";
  if(pp){
    var fu=pp.followUp?(pp.followUp<=td?'<span class="red">Follow up '+(pp.followUp===td?"today":esc(fmt(pp.followUp)))+"</span>":"Follow up "+esc(fmt(pp.followUp))):pp.lastContact?"Last talked "+esc(fmt(pp.lastContact)):"";
    h+='<div class="tk-sec"><div class="tk-lbl">Person</div><div class="tk-person"><span class="avatar" aria-hidden="true">'+esc(initials(pp.name))+'</span><div class="tk-pmain"><b>'+esc(pp.name)+"</b><span>"+[pp.org?esc(pp.org):"",contactLink(pp.contact),fu].filter(Boolean).join(" · ")+'</span></div><button class="pk-btn" data-act="edit-person" data-id="'+esc(t.person)+'">Open</button></div></div>';
  }
  if(!t.done){
    var pr=claudePrompt(t),cy=t.claude==="yes",ch=t.claude==="help";
    h+='<div class="tk-sec"><div class="tk-claude"><div class="tk-ct"><b>'+(cy?"Claude can do this for you":ch?"Claude can do most of this":"Get a plan from Claude")+"</b><span>"+
      (cy?"Open Claude with this task filled in. It does the work and tells you anything left for you.":ch?"Claude does the parts it can and tells you exactly what it needs from you.":"Claude writes a short step-by-step plan, so you know where to start.")+"</span></div>"+
      '<div class="tk-cacts"><a class="tk-cbtn main" href="https://claude.ai/new?q='+encodeURIComponent(pr)+'" target="_blank" rel="noopener">'+G.ext+"<span>Open in Claude</span></a>"+
      '<button class="tk-cbtn" data-act="copy-prompt" data-id="'+eid+'">'+G.copy+"<span>Copy prompt</span></button></div>"+
      '<details class="tk-more"><summary>See the prompt</summary><div class="pk-prompt" tabindex="0" aria-label="Prompt for Claude">'+esc(pr)+"</div></details></div></div>";
  }
  if(s!=null)h+='<div class="tk-sec tk-around">'+neighbours(d,s,e,self)+"</div>";
  h+='<div class="tk-acts">'+(t.done?'<button class="pk-btn" data-act="pk-toggle" data-id="'+eid+'">Mark not done</button><button class="pk-btn" data-act="edit-task" data-id="'+eid+'">'+G.pen+"Edit</button>":
    '<button class="pk-btn primary" data-act="pk-toggle" data-id="'+eid+'">'+G.tick+'Done</button><button class="pk-btn" data-act="snooze" data-id="'+eid+'">'+G.clock+'Snooze</button><button class="pk-btn" data-act="pk-focus" data-id="'+eid+'">'+G.timer+(foc?"Stop focus":"Focus")+'</button><button class="pk-btn" data-act="edit-task" data-id="'+eid+'">'+G.pen+"Edit</button>")+"</div></div>";
  openSheet(h);var sh=$("sheet");sh.classList.add("tk-sheet");sh.dataset.kind="peek";
}
function peekEvent(d,s,title,anchor){
  var ev=eventsOn(d).find(function(e){return !e.allDay&&e.s===s&&e.title===title});if(!ev)return;
  var facts=[];
  if(ev.loc)facts.push([G.pin,/^https?:\/\//.test(ev.loc)?'<a href="'+esc(ev.loc)+'" target="_blank" rel="noopener">'+esc(ev.loc)+"</a>":/^(zoom|google meet|teams|facetime)$/i.test(ev.loc)?esc(ev.loc):'<a href="https://maps.apple.com/?q='+encodeURIComponent(ev.loc)+'" target="_blank" rel="noopener">'+esc(ev.loc)+"</a>"]);
  if(ev.focus)facts.push([G.timer,"Focus time. Plan my day puts your top tasks here."]);
  else if(ev.free)facts.push([G.cal,"Shown as free, so planning can work around it."]);
  var self=agendaItems(d).find(function(x){return x.kind==="ev"&&x.s===s&&x.title===title});
  var gUrl=ev.url||"https://calendar.google.com/calendar/r/day/"+d.replace(/-/g,"/");
  var acts='<button class="pk-btn" data-act="pk-prep" data-day="'+d+'" data-s="'+s+'" data-title="'+esc(title)+'">'+G.plus+'Prep task</button><a class="pk-btn" href="'+esc(gUrl)+'" target="_blank" rel="noopener">'+G.ext+"Open in Google Calendar</a>";
  openSheet(peekShell({color:"var(--ev)",mark:"bar",title:title,sub:"Calendar",range:rangeText(ev.s,ev.e),date:dayText(d)+" · "+dur(ev.e-ev.s),rel:relTime(d,ev.s,ev.e),facts:facts,note:ev.desc||"",ctx:neighbours(d,ev.s,ev.e,self),acts:acts}));
  $("sheet").dataset.kind="peek";anchorSheet(anchor);
}
function addPrep(d,s,title){
  var at=Math.max(6*60,Math.floor((s-30)/15)*15),id=newId();
  save("tasks",id,{title:"Prep for "+title,area:lastArea(),due:d,done:false,doneOn:"",order:Date.now(),person:"",note:"",source:"",atTime:toHM(at),remindMin:0,alarm:false,repeat:"",created:new Date().toISOString()});
  closeSheet();toast("Added a prep task at "+hm(at),function(){remove("tasks",id)});
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
// #tags for each area: its id, short name, full name (spaces removed), initials, plus the old shortcuts.
function areaTags(){
  var m={};
  AREAS.forEach(function(a){[a.id,a.short,a.name].forEach(function(k){k=String(k||"").toLowerCase().replace(/\s+/g,"");if(k&&!m[k])m[k]=a.id})});
  AREAS.forEach(function(a){var i=monogram(a).toLowerCase();if(i.length>1&&!m[i])m[i]=a.id});
  [["bl","baselab"],["tn","truenorth"],["me","personal"],["dg","dg"]].forEach(function(x){if(!m[x[0]]&&isArea(x[1]))m[x[0]]=x[1]});
  return m;
}
// A plain area name at the very end ("... baselab"). Built-in areas only, so a custom area called "Gym" doesn't eat "go to the gym".
function areaTail(){
  var names=[];AREAS.filter(function(a){return isDefaultArea(a.id)}).forEach(function(a){[a.id,a.short,a.name].forEach(function(k){if(k&&names.indexOf(k)<0)names.push(k)})});
  if(isArea("truenorth")&&names.indexOf("true north")<0)names.push("true north");
  names.sort(function(a,b){return b.length-a.length});
  return new RegExp("\\s(?:for\\s+)?("+names.map(function(n){return n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/\s+/g,"\\s+")}).join("|")+")\\s*$","i");
}
function parseQuick(text){
  var s=" "+String(text||"")+" ",out={due:"",atTime:"",area:"",repeat:"",priority:""};
  function take(rx,fn){var m=rx.exec(s);if(!m)return false;var r=fn(m);if(r===false)return false;s=s.slice(0,m.index)+" "+s.slice(m.index+m[0].length);return true}
  // area: #tag anywhere, or a plain area name at the very end
  var tags=areaTags();
  take(/\s#([^\s#]+)(?=\s)/,function(m){var a=tags[m[1].toLowerCase()];if(!a)return false;out.area=a})||
  take(areaTail(),function(m){var a=tags[m[1].toLowerCase().replace(/\s+/g,"")];if(!a)return false;out.area=a});
  // priority: !, !! or !!! (low, medium, high)
  take(/\s(!{1,3})(?=\s)/,function(m){out.priority=["low","medium","high"][m[1].length-1]});
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
  if(p.priority)bits.push({high:"High",medium:"Medium",low:"Low"}[p.priority]+" priority");
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

/* ---------- my areas: rename, recolor, new logo, reorder, add, archive ---------- */
var SWATCHES=["#ff3b30","#ff9500","#ffcc00","#34c759","#00c7be","#30b0c7","#007aff","#5856d6","#af52de","#ff2d55","#a2845e","#8e8e93","#1d1d1f","#0b1433"];
var GLYPHS=["play","drop","north","heart","pulse","person","brief","home","star","book","camera","dollar","car","cart","code","music","leaf","bolt","chat","shield","globe","cal"];
var areasLocal=false,areaDraft=null,AKEY=env.demo?"demo-areas":"areas";
function readAreaCache(){try{var o=JSON.parse(localStorage.getItem("db-"+AKEY)||"{}");return new Map(Object.entries(o))}catch(_){return new Map()}}
function writeAreaCache(){try{localStorage.setItem("db-"+AKEY,JSON.stringify(Object.fromEntries(state.areas)))}catch(_){}}
function syncAreas(){
  var list=DEFAULT_AREAS.map(function(d){var r=state.areas.get(d.id);return Object.assign({},d,r||{},{id:d.id})});
  state.areas.forEach(function(r,id){if(!isDefaultArea(id))list.push(Object.assign({name:id,short:"",color:"",icon:"letter",logo:"",about:"",order:999},r,{id:id}))});
  list.forEach(function(a){if(!a.short)a.short=a.name});
  list.sort(byOrder);
  ALL_AREAS=list;AREAS=list.filter(function(a){return !a.archived});
  if(!AREAS.length)AREAS=list.slice(0,1);
}
function areaRow(a){return {name:a.name,short:a.short,color:a.color||"",icon:a.icon||"",logo:a.logo||"",about:a.about||"",order:a.order||0,archived:!!a.archived,updated:new Date().toISOString()}}
function saveArea(a,quiet){
  var clean=areaRow(a);state.areas.set(a.id,clean);syncAreas();writeAreaCache();
  if(areasLocal)setSetting(AKEY+"-pending","1");else write("areas",a.id,clean);
  if(!quiet)render();
}
function dropArea(id){
  state.areas.delete(id);syncAreas();writeAreaCache();
  if(areasLocal)setSetting(AKEY+"-pending","1");else write("areas",id,null);
  render();
}
function areaUse(id){return {open:openTasks().filter(function(t){return t.area===id}).length,people:entries("people").filter(function(p){return p.area===id}).length,all:entries("tasks").filter(function(t){return t.area===id}).length}}
function slug(n){var b=String(n||"").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"").slice(0,18)||"area",id=b,i=2;while(ALL_AREAS.some(function(a){return a.id===id})||id==="today"||id==="home"||id==="health"||id==="log"||id==="all"||id==="people"||id==="scheduled"||id==="search")id=b+(i++);return id}

function areasHTML(){
  var arch=ALL_AREAS.filter(function(a){return a.archived});
  var h='<h3>My areas</h3><p class="lead">Tap an area to change its name, color or logo. Use the arrows to reorder.</p>';
  h+='<div class="panel ae-list">'+AREAS.map(function(a,i){var u=areaUse(a.id);
    return '<div class="ae-row">'+areaIcon(a)+'<button class="ae-main" data-act="area-edit" data-id="'+esc(a.id)+'"><b>'+esc(a.name)+'</b><small>'+u.open+" open · "+u.people+(u.people===1?" person":" people")+"</small></button>"+
      '<button class="iconbtn" data-act="area-move" data-id="'+esc(a.id)+'" data-dir="-1" aria-label="Move '+esc(a.short)+' up"'+(i===0?" disabled":"")+">"+G.up+"</button>"+
      '<button class="iconbtn" data-act="area-move" data-id="'+esc(a.id)+'" data-dir="1" aria-label="Move '+esc(a.short)+' down"'+(i===AREAS.length-1?" disabled":"")+">"+G.down+"</button></div>"}).join("")+
    '<button class="ae-row ae-add" data-act="area-new"><span class="ic sq ae-plus">'+G.add+"</span><b>Add area</b></button></div>";
  if(arch.length)h+='<div class="group"><div class="gh">Archived</div><div class="panel ae-list">'+arch.map(function(a){
    return '<div class="ae-row is-arch">'+areaIcon(a)+'<span class="ae-main"><b>'+esc(a.name)+"</b><small>Hidden from your lists</small></span>"+'<button class="btn ghost sm" data-act="area-restore" data-id="'+esc(a.id)+'">Restore</button></div>'}).join("")+"</div></div>";
  if(areasLocal)h+='<p class="gp small warnmsg">Saved on this device only. Run the latest <b>supabase/schema.sql</b> in Supabase to sync areas across your devices.</p>';
  h+='<div class="foot"><span class="sp"></span><button class="btn" data-act="close">Done</button></div>';
  return h;
}
function areasSheet(){openSheet(areasHTML(),true);$("sheet").dataset.kind="areas"}
function drawAreas(){var s=$("sheet");if(s&&s.dataset.kind==="areas"){var y=s.scrollTop;s.innerHTML=areasHTML();s.scrollTop=y}}
function moveArea(id,dir){
  var list=AREAS.slice(),i=list.findIndex(function(a){return a.id===id}),j=i+dir;
  if(i<0||j<0||j>=list.length)return;
  var x=list[i];list[i]=list[j];list[j]=x;
  list.forEach(function(a,k){if(a.order!==k+1){a.order=k+1;saveArea(a,true)}});
  render();drawAreas();
}

function aePreview(){
  var d=areaDraft;
  return areaIcon(d,"lg")+'<div class="grow"><b>'+esc(d.name||"New area")+"</b><small>"+esc(d.short&&d.short!==d.name?d.short:"")+"</small></div>";
}
function aeMarks(){
  var d=areaDraft,h="";
  function tile(on,act,attr,inner,label){return '<button type="button" class="ae-mark'+(on?" on":"")+'" data-act="'+act+'"'+attr+' aria-pressed="'+on+'" aria-label="'+label+'" style="--c:'+colorOf(d)+'">'+inner+"</button>"}
  if(LOGOS[d.id])h+=tile(d.logo==="builtin","ae-logo",' data-logo="builtin"','<span class="ic logo">'+LOGOS[d.id]+"</span>","Original logo");
  if(d.upload)h+=tile(d.logo===d.upload,"ae-logo",' data-logo="upload"','<span class="ic logo img"><img src="'+d.upload+'" alt=""></span>',"Your logo");
  h+=tile(!d.logo&&(d.icon==="letter"||!d.icon),"ae-icon",' data-icon="letter"','<span class="ic sq mono">'+esc(monogram(d))+"</span>","Letters");
  GLYPHS.forEach(function(g){h+=tile(!d.logo&&d.icon===g,"ae-icon",' data-icon="'+g+'"','<span class="ic sq">'+G[g]+"</span>",g)});
  return h;
}
function aeColors(){
  var d=areaDraft,h="";
  if(isDefaultArea(d.id))h+='<button type="button" class="sw" data-act="ae-color" data-color="" style="--c:var(--a-'+d.id+')" aria-pressed="'+(!d.color)+'" aria-label="Original color"></button>';
  SWATCHES.forEach(function(c){h+='<button type="button" class="sw" data-act="ae-color" data-color="'+c+'" style="--c:'+c+'" aria-pressed="'+(d.color===c)+'" aria-label="'+c+'"></button>'});
  var custom=d.color&&SWATCHES.indexOf(d.color)<0;
  h+='<label class="sw sw-custom" aria-pressed="'+!!custom+'" title="Pick any color"'+(custom?' style="--c:'+esc(d.color)+'"':"")+'>'+G.add+'<input type="color" id="ae-custom" value="'+(/^#[0-9a-f]{6}$/i.test(d.color)?d.color:"#007aff")+'" aria-label="Custom color"></label>';
  return h;
}
function aeDraw(){var s=$("sheet");if(!s||s.dataset.kind!=="area")return;var p=s.querySelector(".ae-prev");if(p)p.innerHTML=aePreview();var m=s.querySelector(".ae-marks");if(m)m.innerHTML=aeMarks();var c=s.querySelector(".ae-colors");if(c)c.innerHTML=aeColors()}
function areaEditSheet(id){
  var a=id?ALL_AREAS.find(function(x){return x.id===id}):null,isNew=!a;
  areaDraft=a?Object.assign({},a):{id:"",name:"",short:"",color:SWATCHES[(ALL_AREAS.length*3+1)%SWATCHES.length],icon:"letter",logo:"",about:"",order:ALL_AREAS.reduce(function(m,x){return Math.max(m,x.order||0)},0)+1};
  if(safeImg(areaDraft.logo))areaDraft.upload=areaDraft.logo;
  var u=a?areaUse(a.id):null,modified=a&&isDefaultArea(a.id)&&state.areas.has(a.id);
  var h='<form id="area-form" class="ae" data-id="'+esc(a?a.id:"")+'"><h3>'+(isNew?"New area":"Edit area")+"</h3>"+
    '<div class="ae-prev">'+aePreview()+"</div>"+
    '<div class="two"><div class="field"><label for="ae-name">Name</label><input id="ae-name" type="text" maxlength="40" value="'+esc(areaDraft.name)+'" placeholder="e.g. Real estate" autocomplete="off"'+(isNew?" autofocus":"")+'></div>'+
    '<div class="field"><label for="ae-short">Short name</label><input id="ae-short" type="text" maxlength="16" value="'+esc(a&&a.short!==a.name?a.short:"")+'" placeholder="Same as name" autocomplete="off"></div></div>'+
    '<div class="field"><label>Color</label><div class="ae-colors">'+aeColors()+"</div></div>"+
    '<div class="field"><label>Logo</label><div class="ae-marks">'+aeMarks()+'</div><div class="row2 ae-up"><label class="btn ghost">'+G.img+'<span>Upload a logo</span><input type="file" id="ae-file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" hidden></label><span class="gp small">Square images look best. PNG, JPG or SVG.</span></div></div>'+
    '<div class="field"><label for="ae-about">What it covers</label><textarea id="ae-about" rows="2" maxlength="200" placeholder="e.g. rental properties and tenants">'+esc(areaDraft.about)+'</textarea><p class="gp small">Plan my day and Brain dump use this to sort tasks into the right area.</p></div>'+
    '<div class="foot">'+
      (a&&!a.archived&&AREAS.length>1?'<button type="button" class="btn ghost danger" data-act="area-archive" data-id="'+esc(a.id)+'">Archive</button>':"")+
      (a&&!isDefaultArea(a.id)&&u.all===0&&u.people===0?'<button type="button" class="btn ghost danger" data-act="area-delete" data-id="'+esc(a.id)+'">Delete</button>':"")+
      (modified?'<button type="button" class="btn ghost" data-act="area-reset" data-id="'+esc(a.id)+'">Reset</button>':"")+
      '<span class="sp"></span><button type="button" class="btn ghost" data-act="area-back">Cancel</button><button class="btn" type="submit">'+(isNew?"Add area":"Save")+"</button></div></form>";
  openSheet(h,true);$("sheet").dataset.kind="area";
}
function aeRead(){var d=areaDraft;if(!d)return;var n=$("ae-name"),sh=$("ae-short"),ab=$("ae-about");if(n)d.name=n.value.trim();if(sh)d.short=sh.value.trim();if(ab)d.about=ab.value.trim()}
function aeSubmit(f){
  aeRead();var d=areaDraft;if(!d)return;
  if(!d.name){var n=$("ae-name");if(n){n.focus();n.classList.add("bad")}return}
  var isNew=!f.dataset.id;if(isNew)d.id=slug(d.name);
  if(!d.short)d.short=d.name;
  delete d.upload;saveArea(d);areaDraft=null;
  if(isNew){toast("Added "+d.name);closeSheet();go(d.id)}else{areasSheet()}
}
// Logos are shrunk to 160px PNGs so a row stays small.
function aeUpload(file){
  if(!file)return;
  if(file.size>8e6){toast("That image is too big. Pick one under 8 MB.");return}
  var url=URL.createObjectURL(file),img=new Image();
  img.onload=function(){
    var S=160,c=document.createElement("canvas");c.width=S;c.height=S;var x=c.getContext("2d");
    var w=img.naturalWidth||S,hh=img.naturalHeight||S,k=Math.max(S/w,S/hh),dw=w*k,dh=hh*k;
    x.drawImage(img,(S-dw)/2,(S-dh)/2,dw,dh);URL.revokeObjectURL(url);
    var out;try{out=c.toDataURL("image/png")}catch(_){toast("Couldn't read that image.");return}
    if(!areaDraft)return;areaDraft.upload=out;areaDraft.logo=out;aeDraw();
  };
  img.onerror=function(){URL.revokeObjectURL(url);toast("Couldn't read that image.")};
  img.src=url;
}
function areaHandle(act,el){
  var id=el.dataset.id,a;
  if(act==="areas")areasSheet();
  else if(act==="area-edit")areaEditSheet(id);
  else if(act==="area-new")areaEditSheet("");
  else if(act==="area-back"){areaDraft=null;areasSheet()}
  else if(act==="area-move")moveArea(id,+el.dataset.dir);
  else if(act==="ae-color"){aeRead();areaDraft.color=el.dataset.color;aeDraw()}
  else if(act==="ae-icon"){aeRead();areaDraft.icon=el.dataset.icon;areaDraft.logo="";aeDraw()}
  else if(act==="ae-logo"){aeRead();areaDraft.logo=el.dataset.logo==="upload"?areaDraft.upload:"builtin";aeDraw()}
  else if(act==="area-archive"){a=ALL_AREAS.find(function(x){return x.id===id});if(!a)return;var u=areaUse(id);a=Object.assign({},a,{archived:true});saveArea(a);areasSheet();if(state.view===id)go(mq.matches?"home":"today");
    toast("Archived "+a.name+(u.open?". Its "+u.open+" open "+(u.open===1?"task stays":"tasks stay")+" in Today and Scheduled.":""),function(){saveArea(Object.assign({},a,{archived:false}));drawAreas()})}
  else if(act==="area-restore"){a=ALL_AREAS.find(function(x){return x.id===id});if(a){saveArea(Object.assign({},a,{archived:false}));drawAreas()}}
  else if(act==="area-reset"){var old=state.areas.get(id);dropArea(id);areasSheet();toast("Reset to the original",function(){if(old){state.areas.set(id,old);saveArea(Object.assign({id:id},old))}drawAreas()})}
  else if(act==="area-delete"){var row=state.areas.get(id);dropArea(id);areasSheet();toast("Area deleted",function(){if(row)saveArea(Object.assign({id:id},row));drawAreas()})}
  else return false;
  return true;
}
function loadAreas(){
  state.areas=readAreaCache();syncAreas();
  db.collection("areas").onSnapshot(function(s){
    var m=new Map();s.docs.forEach(function(x){m.set(x.id,x.data())});
    if(areasLocal||setting(AKEY+"-pending","")==="1"){
      // Saved while the table was missing: send the local copy up once the table exists.
      state.areas.forEach(function(r,id){var dbr=m.get(id);if(!dbr||String(dbr.updated||"")<String(r.updated||"")){m.set(id,r);write("areas",id,r)}});
      setSetting(AKEY+"-pending","");
    }
    areasLocal=false;state.areas=m;syncAreas();writeAreaCache();if(state.ready)render();drawAreas();
  },function(){areasLocal=true;drawAreas()});
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
  var p=pushInfo,h='<h3>Settings</h3>',th=setting("theme","auto");
  h+='<div class="group"><div class="gh">Appearance</div><div class="seg wide" role="group" aria-label="Appearance">'+[["auto","Automatic"],["light","Light"],["dark","Dark"]].map(function(o){return '<button data-act="set-theme" data-theme="'+o[0]+'" aria-pressed="'+(th===o[0])+'">'+o[1]+"</button>"}).join("")+"</div></div>";
  h+='<div class="group"><div class="gh">My areas</div><button class="setlink" data-act="areas"><span class="ae-stack">'+AREAS.slice(0,5).map(function(a){return areaIcon(a)}).join("")+'</span><span class="grow">Names, colors and logos</span>'+G.chev+"</button></div>";
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
  h+='<div class="foot">'+(document.getElementById("signout")?'<button class="btn ghost" data-act="signout-s">Sign out</button>':"")+'<span class="sp"></span><button class="btn" data-act="close">Done</button></div>';
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

/* ---------- appearance and sidebar ---------- */
function applyTheme(){var th=setting("theme","auto"),r=document.documentElement;if(th==="auto")delete r.dataset.theme;else r.dataset.theme=th}
function setTheme(th){setSetting("theme",th);applyTheme();render();drawSettings()}
function cycleTheme(){var th=setting("theme","auto"),dark=th==="dark"||(th==="auto"&&window.matchMedia("(prefers-color-scheme: dark)").matches);setTheme(dark?"light":"dark")}
function applySide(){$("app").classList.toggle("side-closed",setting("side","open")==="closed")}
function toggleSide(){setSetting("side",setting("side","open")==="closed"?"open":"closed");applySide()}
applyTheme();applySide();

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
  if(state.focus&&state.focus.id===id){state.focus=null;saveFocus();armFocus()}
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
  if(act.slice(0,2)==="h-"&&health.act(act,el))return;
  if((act==="areas"||act.slice(0,5)==="area-"||act.slice(0,3)==="ae-")&&areaHandle(act,el))return;
  if(act==="go")go(el.dataset.view);
  else if(act==="day"){state.day=el.dataset.day===today()?"":el.dataset.day;state.showDone=false;lastShown="";render()}
  else if(act==="seg"){flushNote();state.seg=el.dataset.seg;render()}
  else if(act==="log-area"){state.logArea=el.dataset.area||"";render()}
  else if(act==="log-open"){state.logOpen=!state.logOpen;render()}
  else if(act==="log-jump"){var tg=$("bl-"+el.dataset.day);if(tg)tg.scrollIntoView({behavior:"smooth",block:"start"})}
  else if(act==="open-build")buildSheet(el.dataset.id);
  else if(act==="del-build"){var bid=el.dataset.id,old=state.builds.get(bid);closeSheet();if(old){state.builds.delete(bid);render();db.doc("builds/"+bid).delete().catch(writeFailed);toast("Entry deleted",function(){state.builds.set(bid,old);render();db.doc("builds/"+bid).set(old).catch(writeFailed)})}}
  else if(act==="toggle")complete(id,el);
  else if(act==="later")patchTask(id,{order:Date.now()});
  else if(act==="tomorrow")patchTask(id,{due:plus(1),order:Date.now()});
  else if(act==="to-today"){patchTask(id,{due:today(),order:Date.now()});toast("Added to Today")}
  else if(act==="do-next"){var first=dayTasks(today())[0];patchTask(id,{due:today(),order:(first?first.order||0:Date.now())-1})}
  else if(act==="late-today"){var td=today(),ids=openTasks().filter(function(x){return x.due&&x.due<td}).map(function(x){return x.id});ids.forEach(function(i){patchTask(i,{due:td},true)});render();toast("Moved "+ids.length+" to today")}
  else if(act==="push-rest"){var ts=dayTasks(today()).slice(3),tm=plus(1);ts.forEach(function(x){patchTask(x.id,{due:tm},true)});render();toast("Moved "+ts.length+" to tomorrow",function(){ts.forEach(function(x){patchTask(x.id,{due:x.due},true)});render()})}
  else if(act==="cl-only"){state.clOnly=el.dataset.on==="1";render()}
  else if(act==="show-done"){state.showDone=!state.showDone;render()}
  else if(act==="focus")toggleFocus(id);
  else if(act==="edit-task")taskSheet(id);
  else if(act==="peek")peekTask(id,el.dataset.day);
  else if(act==="peek-ev")peekEvent(el.dataset.day,+el.dataset.s,el.dataset.title,el);
  else if(act==="pk-toggle"){closeSheet();complete(id,el)}
  else if(act==="pk-focus"){if(state.focus&&state.focus.id===id){closeSheet();stopFocus()}else focusSheet(id)}
  else if(act==="focus-start"){closeSheet();startFocus(id,+el.dataset.min||25)}
  else if(act==="alarm-stop"){stopAlarm();closeSheet()}
  else if(act==="alarm-more"){stopAlarm();closeSheet();startFocus(id,+el.dataset.min||5)}
  else if(act==="alarm-done"){stopAlarm();closeSheet();t=state.tasks.get(id);if(t&&!t.done)complete(id,el)}
  else if(act==="copy-prompt"){t=state.tasks.get(id);if(t)copyText(claudePrompt(t),function(ok){toast(ok?"Prompt copied. Paste it into Claude.":"Couldn't copy. Select the text and copy it.");if(ok){el.classList.add("done");var lb=el.querySelector("span");if(lb)lb.textContent="Copied";setTimeout(function(){el.classList.remove("done");if(lb)lb.textContent="Copy prompt"},2000)}})}
  else if(act==="pk-prep")addPrep(el.dataset.day,+el.dataset.s,el.dataset.title);
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
  else if(act==="theme")cycleTheme();
  else if(act==="set-theme")setTheme(el.dataset.theme);
  else if(act==="side")toggleSide();
  else if(act==="signout-s"){var so=$("signout");if(so)so.click()}
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
      atTime:q.atTime,remindMin:q.atTime?0:null,repeat:q.repeat,alarm:false,priority:q.priority||"",claude:""});
    if(f.closest(".sheet")){closeSheet();toast("Added"+(quickHint(q,true)?": "+quickHint(q,true):""))}
    else if(q.area&&f.dataset.area&&q.area!==f.dataset.area)toast("Added to "+area(q.area).name);
  }else if(f.id==="task-form"){
    id=f.dataset.id;if(!$("f-title").value.trim())return;
    var tm=$("f-time").value,rm=$("f-remind").value,due=$("f-due").value;
    if(tm&&!due)due=today();
    patchTask(id,{title:$("f-title").value.trim(),area:$("f-area").value,due:due,person:$("f-person").value,note:$("f-note").value.trim(),
      atTime:tm,remindMin:tm&&rm!==""?Number(rm):null,repeat:$("f-repeat").value,alarm:!!(tm&&$("f-alarm").checked),priority:$("f-prio").value,claude:$("f-claude").value});
    closeSheet();
  }else if(f.id==="area-form"){aeSubmit(f);
  }else if(health.submit(f)){
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
  else if(tid==="ae-file"){aeRead();aeUpload(e.target.files&&e.target.files[0]);e.target.value=""}
  else if(tid==="ae-custom"&&areaDraft){aeRead();areaDraft.color=e.target.value;aeDraw()}
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
  else if(e.key==="["&&!mq.matches)toggleSide();
  else if(e.key==="p"&&sample)plan();
  else if(e.key==="d"&&sample){e.preventDefault();dumpSheet()}
});
document.addEventListener("input",function(e){
  var af=e.target.closest&&e.target.closest("form.add");
  if(af){var hn=af.querySelector(".qa-hint");if(hn){var q=parseQuick(e.target.value);hn.textContent=q.title&&q.title!==e.target.value.trim()?quickHint(q,!af.dataset.area||q.area!==af.dataset.area):""}return}
  if(areaDraft&&(e.target.id==="ae-name"||e.target.id==="ae-short")){e.target.classList.remove("bad");aeRead();var pv=$("sheet").querySelector(".ae-prev");if(pv)pv.innerHTML=aePreview();var mk=$("sheet").querySelector(".ae-marks");if(mk&&e.target.id!=="ae-about")mk.innerHTML=aeMarks();return}
  if(areaDraft&&e.target.id==="ae-custom"){areaDraft.color=e.target.value;var cs=$("sheet").querySelector(".ae-colors .sw-custom");if(cs){cs.style.setProperty("--c",e.target.value);cs.setAttribute("aria-pressed","true")}var pv2=$("sheet").querySelector(".ae-prev");if(pv2)pv2.innerHTML=aePreview();return}
  if(e.target.dataset&&e.target.dataset.key==="log-q"){state.logQ=e.target.value;render();return}
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
function valid(v){return v==="home"||v==="health"||v==="log"||isArea(v)||SMART.some(function(s){return s.id===v})}
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
function tick(){var d=today();if(d!==lastDay){lastDay=d;state.day="";render();return}if(state.ready&&(state.view==="today"||state.view==="home")&&!$("overlay").classList.contains("open")&&!sw)render()}
setInterval(tick,60000);

/* ---------- health ---------- */
var health=makeHealth({state:state,G:G,$:$,esc:esc,today:today,plus:plus,toDate:toDate,fmt:fmt,fmtLong:fmtLong,hm:hm,parseHM:parseHM,nowMins:nowMins,newId:newId,entries:entries,panel:panel,save:save,remove:remove,render:render,toast:toast,openSheet:openSheet,closeSheet:closeSheet});

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
  loadAreas();
  db.collection("health_logs").onSnapshot(function(s){var m=new Map();s.docs.forEach(function(x){m.set(x.id,x.data())});state.health_logs=m;if(state.ready)render()},function(){});
  initCal();
  refreshPush().then(render);
})();

}
