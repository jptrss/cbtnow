import{initializeApp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import{getAuth,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import{getFirestore,doc,getDoc}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== PASTE YOUR FIREBASE CONFIG HERE (used by every role page) =====
export const CFG={apiKey:"YOUR_API_KEY",authDomain:"YOUR_PROJECT.firebaseapp.com",projectId:"YOUR_PROJECT_ID",appId:"YOUR_APP_ID"};
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
$("#side").innerHTML=`<a class="logo" href="${ROUTES[me.role]}"><div class="mark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l5 5 9-10"/></svg></div>CBT<span>Now</span></a>
<nav class="nv">${nav.map(([k,i,l,h])=>`<a href="${h}" class="${k==active?"on":""}"><span>${i}</span>${l}</a>`).join("")}</nav>
<div class="me"><b>${esc(me.name)}</b><small>${esc(me.email)}</small><span class="chip">${R.label}</span><button class="btn s" id="so" style="width:100%">Sign out</button></div>`;
$("#so").onclick=async()=>{await signOut(auth);location.replace("/login")}}

// Greeting + live clock in the hero card (#gr, #ck, #dtx)
export function hero(me){const t=()=>{const n=new Date();$("#gr").textContent=`${greet()}, ${me.name.split(" ")[0]}`;
$("#ck").textContent=n.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
$("#dtx").textContent=n.toLocaleDateString("en",{weekday:"long",day:"numeric",month:"long",year:"numeric"})};t();setInterval(t,1000)}
export const ready=()=>$("#load").classList.add("h");
