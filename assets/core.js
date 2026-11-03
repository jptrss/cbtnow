import{initializeApp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import{getAuth,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import{getFirestore,doc,getDoc}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== PASTE YOUR FIREBASE CONFIG HERE (used by every role page) =====
export const CFG={apiKey:"AIzaSyDHGqit0SiTiIL5Z2Xv28oWueH6sHdTlSw",authDomain:"cbtnow-myown.firebaseapp.com",projectId:"cbtnow-myown",appId:"1:550333230262:web:f6aca07372fbe950f64a17"};
// Usernames without "@" become username@USERNAME_DOMAIN (same value as in the login page)
export const USERNAME_DOMAIN="cbtnow.app";
// =====================================================================

export const app=initializeApp(CFG),auth=getAuth(app),db=getFirestore(app);
export const ROUTES={OPERATOR:"/operator",MANAGEMENT:"/management",PROBLEM_SETTER:"/probset",PROCTOR:"/proctor",PARTICIPANT:"/participant"};
export const ROLES={OPERATOR:{label:"Operator",ac:"#22d3ee"},MANAGEMENT:{label:"Management",ac:"#6366f1"},PROBLEM_SETTER:{label:"Problem Setter",ac:"#a855f7"},PROCTOR:{label:"Proctor",ac:"#fbbf24"},PARTICIPANT:{label:"Participant",ac:"#34d399"}};
export const $=s=>document.querySelector(s);
export const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export const toEmail=v=>{v=v.trim();return v.includes("@")?v:v.toLowerCase()+"@"+USERNAME_DOMAIN};
const ERR={"auth/email-already-in-use":"That email/username is already used.","auth/invalid-email":"Invalid email or username.","auth/weak-password":"Password is too weak (min. 8 characters).","auth/wrong-password":"Current password is incorrect.","auth/invalid-credential":"Current password is incorrect.","auth/too-many-requests":"Too many attempts. Try again later.","auth/network-request-failed":"Network error.","permission-denied":"Permission denied. Check your Firestore rules."};
export const errMsg=x=>ERR[x.code]||x.message||"Something went wrong.";
export const toast=t=>{const e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove("show"),2600)};
export const greet=()=>{const h=new Date().getHours();return h<5?"Good night":h<12?"Good morning":h<17?"Good afternoon":h<21?"Good evening":"Good night"};

// Resolves with the signed-in user's profile when it matches `role`; otherwise redirects.
export function guard(role){return new Promise(res=>onAuthStateChanged(auth,async u=>{
if(!u)return location.replace("/login");
const s=await getDoc(doc(db,"users",u.uid)),d=s.exists()?s.data():null;
if(!d||!ROUTES[d.role]){await signOut(auth);return location.replace("/login")}
if(d.role!==role)return location.replace(ROUTES[d.role]);
res({uid:u.uid,...d})}))}

// Sidebar: nav = [[key, icon, label, href], ...]
export function shell(me,nav,active){const R=ROLES[me.role];document.documentElement.style.setProperty("--ac",R.ac);
$("#side").innerHTML=`<div class="lr"><a class="logo" href="${ROUTES[me.role]}"><div class="mark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l5 5 9-10"/></svg></div>CBT<span>Now</span></a><button class="th" id="th" aria-label="Switch between dark and light mode"></button></div>
<nav class="nv">${nav.map(([k,i,l,h])=>`<a ${h?`href="${h}"`:"data-soon"} class="${k==active?"on":""}"><span>${i}</span>${l}</a>`).join("")}</nav>
<div class="me"><b>${esc(me.name)}</b><small>${esc(me.email)}</small><span class="chip">${R.label}</span><button class="btn s" id="so" style="width:100%">Sign out</button></div>`;
$("#so").onclick=async()=>{await signOut(auth);location.replace("/login")};$("#th").onclick=()=>setTheme(document.documentElement.dataset.theme=="dark"?"light":"dark");setTheme(document.documentElement.dataset.theme);document.querySelectorAll("[data-soon]").forEach(a=>a.onclick=()=>toast("This page is coming in the next step."))}

// Greeting + live clock in the hero card (#gr, #ck, #dtx)
export function hero(me){const t=()=>{const n=new Date();if($("#gr"))$("#gr").textContent=`${greet()}, ${me.greetName||me.name.split(" ")[0]}`;
$("#ck").textContent=n.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
$("#dtx").textContent=n.toLocaleDateString("en",{weekday:"long",day:"numeric",month:"long",year:"numeric"})};t();setInterval(t,1000)}
export const ready=()=>$("#load").classList.add("h");

// ---- Light / dark mode (saved in this browser) ----
export const setTheme=t=>{document.documentElement.dataset.theme=t;try{localStorage.setItem("cbtnow-theme",t)}catch{}const b=$("#th");if(b)b.textContent=t=="dark"?"☀️":"🌙"};
let _t="dark";try{_t=localStorage.getItem("cbtnow-theme")||"dark"}catch{}setTheme(_t);

// ---- Resize an image file to max 256px and return a data URL (stored in Firestore, no Storage needed) ----
export const logoData=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const s=Math.min(1,256/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=Math.round(i.width*s);c.height=Math.round(i.height*s);c.getContext("2d").drawImage(i,0,0,c.width,c.height);ok(c.toDataURL("image/webp",.85))};i.onerror=()=>no(new Error("That file isn't a valid image."));i.src=r.result};r.readAsDataURL(f)});

// ---- Sidebar menus per role. Set href to null for pages not built yet (shows "coming soon"). ----
export const NAV={MANAGEMENT:[["dash","🏠","Dashboard","/management/dashboard"],["accounts","👥","Accounts","/management/accounts"],["question","📚","Questions","/management/question"],["exam","🗓","Exams","/management/exam"],["profile","👤","Profile","/management/profile"]]};

// Participant menu (the exam room page is built in a later step: set its href then)
NAV.PARTICIPANT=[["dash","🏠","Dashboard","/participant/dashboard"],["exam","📝","My exams","/participant/dashboard"],["profile","👤","Profile","/participant/profile"]];
