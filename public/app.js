/* Learn C Language - single page app */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem("lc_" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("lc_" + k, JSON.stringify(v)); } catch {} },
};
const THEMES = [["#ff7eb6", "#8b5cf6"], ["#ff9a6c", "#e8478b"], ["#5eead4", "#6366f1"], ["#ffd36e", "#f472b6"], ["#a78bfa", "#38bdf8"], ["#fb7185", "#f59e0b"]];
const D = { theory: [], pq: null, prog: [], iq: null, ia: {} };
const S = { user: LS.get("user", null), theory: LS.get("theory", {}), done: LS.get("done", {}), set: LS.get("set", { theme: 0, mode: "dark" }), last: LS.get("last", null), code: LS.get("code", null), view: "home", arg: null, ctx: null, hist: [] };

const toast = (m) => { const t = $("#toast"); t.textContent = m; t.className = "show"; clearTimeout(toast.t); toast.t = setTimeout(() => (t.className = ""), 2400); };
function applyTheme() {
  const [a, b] = THEMES[S.set.theme] || THEMES[0], r = document.documentElement.style;
  r.setProperty("--accent", a); r.setProperty("--accent2", b); document.documentElement.dataset.mode = S.set.mode;
  document.querySelector('meta[name=theme-color]').content = S.set.mode === "dark" ? "#1d1230" : "#fff6fb";
}
async function jget(u) { const r = await fetch(u); if (!r.ok) throw new Error(u); return r.json(); }
async function post(u, b) { const r = await fetch(u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || "Server error"); return j; }

// ---------- progress ----------
const progress = () => {
  const t = Object.keys(S.theory).length / (D.theory.length || 20), p = Object.keys(S.done).length / (D.prog.length || 100);
  return Math.min(100, Math.round(t * 60 + p * 40));
};
const LEVELS = ["Seedling", "Beginner", "Explorer", "Coder", "Builder", "Problem Solver", "Debugger", "Specialist", "Expert", "Master", "C Queen"];
const level = () => { const p = progress(); return { n: Math.floor(p / 10) + (p >= 100 ? 0 : 1), name: LEVELS[Math.floor(p / 10)] }; };

// ---------- syntax highlight ----------
function hl(code) {
  const KW = "auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while";
  const re = new RegExp(`(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)|("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')|(^\\s*#\\s*\\w+)|\\b(${KW.split(" ").join("|")})\\b|\\b(\\d+\\.?\\d*f?)\\b`, "gm");
  let out = "", last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "p" : m[4] ? "k" : "n";
    out += `<span class="${cls}">${esc(m[0])}</span>`; last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}

// ---------- illustrations (inline SVG) ----------
const ART = {
  book: `<svg viewBox="0 0 100 100"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7eb6"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="14" y="18" width="72" height="64" rx="10" fill="url(#a)"/><rect x="24" y="26" width="52" height="48" rx="6" fill="#fff" opacity=".92"/><path d="M32 40h36M32 50h36M32 60h22" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/><circle cx="78" cy="24" r="9" fill="#ffd36e"/><path d="M74 24l3 3 5-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  code: `<svg viewBox="0 0 100 100"><rect x="10" y="18" width="80" height="58" rx="10" fill="#150c25" stroke="#ff7eb6" stroke-width="3"/><circle cx="21" cy="28" r="3" fill="#ff7eb6"/><circle cx="31" cy="28" r="3" fill="#ffd36e"/><circle cx="41" cy="28" r="3" fill="#5eead4"/><path d="M30 48l-9 8 9 8M70 48l9 8-9 8M54 44l-8 24" stroke="#5eead4" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="34" y="82" width="32" height="6" rx="3" fill="#8b5cf6"/></svg>`,
  play: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#8b5cf6"/><circle cx="50" cy="50" r="38" fill="none" stroke="#ff7eb6" stroke-width="6" stroke-dasharray="120 120" stroke-linecap="round"/><path d="M42 34l26 16-26 16z" fill="#fff"/><circle cx="82" cy="20" r="6" fill="#ffd36e"/></svg>`,
  chat: `<svg viewBox="0 0 100 100"><rect x="12" y="16" width="52" height="38" rx="14" fill="#ff7eb6"/><path d="M26 54l-4 14 16-14z" fill="#ff7eb6"/><rect x="38" y="42" width="50" height="36" rx="14" fill="#8b5cf6"/><path d="M74 78l6 12-18-12z" fill="#8b5cf6"/><path d="M24 30h28M24 40h18M52 56h26M52 66h16" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  cap: `<svg viewBox="0 0 100 100"><path d="M50 22L10 42l40 20 40-20z" fill="#8b5cf6"/><path d="M26 54v16c0 6 48 6 48 0V54L50 66z" fill="#ff7eb6"/><path d="M90 42v22" stroke="#ffd36e" stroke-width="4" stroke-linecap="round"/><circle cx="90" cy="68" r="5" fill="#ffd36e"/></svg>`,
  go: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ff7eb6" opacity=".25"/><circle cx="50" cy="38" r="12" fill="#ffd9ec"/><path d="M26 82c2-18 14-26 24-26s22 8 24 26z" fill="#8b5cf6"/><rect x="34" y="60" width="32" height="20" rx="4" fill="#150c25"/><path d="M42 66l-4 4 4 4M58 66l4 4-4 4" stroke="#5eead4" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
};

// ---------- router ----------
function go(view, arg, push = true) {
  if (view === "compiler" && arg !== "ctx") S.ctx = null;
  if (push) S.hist.push([S.view, S.arg]);
  S.view = view; S.arg = arg; render(); window.scrollTo(0, 0);
}
function back() { const h = S.hist.pop(); if (h) go(h[0], h[1], false); else go("home", null, false); }
window.go = go; window.back = back;
const NAV = [["home", "🏠", "Home"], ["theory", "📘", "Theory"], ["programs", "💻", "Programs"], ["compiler", "▶️", "Compiler"], ["interview", "🎯", "Interview"]];
const navFor = (v) => ({ topic: "theory", plist: "programs", prog: "programs", ilist: "interview", college: "interview", settings: "home" }[v] || v);
function shell(inner) {
  const cur = navFor(S.view);
  return inner + `<nav class="nav">${NAV.map(([v, i, l]) => `<button class="${cur === v ? "on" : ""}" onclick="S.hist=[];go('${v}',null,false)"><span>${i}</span>${l}</button>`).join("")}</nav>`;
}
const hdr = (t, extra = "") => `<div class="top"><button class="back" onclick="back()">←</button><h2>${t}</h2>${extra}</div>`;

function render() {
  const a = $("#app"); applyTheme();
  if (!S.user) return (a.innerHTML = loginView());
  const v = { home, theory: theoryList, topic: topicView, programs: progTopics, plist: progList, prog: progView, compiler: compilerView, interview: interviewSecs, ilist: interviewList, college: collegeView, settings: settingsView }[S.view] || home;
  a.className = S.view === "compiler" ? "full" : "";
  a.innerHTML = S.view === "compiler" ? v() : shell(v());
  document.querySelectorAll("pre[data-hl]").forEach((p) => { p.innerHTML = hl(p.textContent); p.removeAttribute("data-hl"); });
  if (S.view === "login") return;
  const f = $("[data-after]"); if (f) new Function("return " + f.dataset.after)()();
}

// ---------- LOGIN ----------
const L = { step: 0, country: "", email: "", q: "", sent: null, busy: false, msg: null };
let COUNTRIES = [];
function countries() {
  if (COUNTRIES.length) return COUNTRIES;
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" }), A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (const x of A) for (const y of A) { const c = x + y; let n; try { n = dn.of(c); } catch { continue; } if (n && n !== c && !/Unknown|Region/.test(n)) COUNTRIES.push(n); }
  } catch {}
  if (COUNTRIES.length < 150) COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "China", "Brazil", "Nepal", "Bangladesh", "Sri Lanka", "Pakistan", "Singapore", "UAE", "South Africa", "Nigeria", "Kenya", "Egypt"];
  return (COUNTRIES = [...new Set(COUNTRIES)].sort());
}
function loginView() {
  const dots = `<div class="steps">${[0, 1, 2].map((i) => `<i class="${i <= L.step ? "on" : ""}"></i>`).join("")}</div>`;
  const msg = L.msg ? `<div class="msg ${L.msg[0]}">${esc(L.msg[1])}</div>` : "";
  let body = "";
  if (L.step === 0) {
    const list = countries().filter((c) => c.toLowerCase().includes(L.q.toLowerCase()));
    body = `<h3>Select your country</h3><input class="field" id="cq" placeholder="🔍 Search country…" value="${esc(L.q)}" oninput="L.q=this.value;cl()" autocomplete="off">
      <div class="cl" id="cl">${clHtml(list)}</div>
      <div class="btns" style="margin:18px 0"><button class="btn" style="width:100%" ${L.country ? "" : "disabled"} onclick="L.step=1;L.msg=null;render()">Next →</button></div>`;
  } else if (L.step === 1) {
    body = `<h3>Your Gmail address</h3><p class="muted">Country: <b>${esc(L.country)}</b> · <a href="#" onclick="L.step=0;render();return false" style="color:var(--accent)">change</a></p>
      <input class="field" id="em" type="email" inputmode="email" placeholder="you@gmail.com" value="${esc(L.email)}" autocomplete="email">${msg}
      <div class="btns" style="margin:18px 0"><button class="btn" style="width:100%" ${L.busy ? "disabled" : ""} onclick="sendOtp()">${L.busy ? "Sending…" : "Send OTP"}</button></div>
      <div id="gwrap" style="display:none"><div class="muted" style="text-align:center;margin:6px 0">— or —</div><div id="gbtn" style="display:flex;justify-content:center;min-height:44px"></div></div>`;
    setTimeout(gInit, 0);
  } else {
    body = `<h3>Enter the 6-digit code</h3><p class="muted">We sent it to <b>${esc(L.email)}</b></p>
      ${L.sent && L.sent.dev ? `<div class="msg ok">Demo mode: your code is <b>${L.sent.devOtp}</b></div>` : ""}
      <div class="otp">${[0, 1, 2, 3, 4, 5].map((i) => `<input maxlength="1" inputmode="numeric" data-i="${i}" oninput="otpIn(this)" onkeydown="otpKey(event,this)" onpaste="otpPaste(event)">`).join("")}</div>${msg}
      <div class="btns" style="margin:12px 0"><button class="btn" style="width:100%" onclick="verify()">Verify & Start</button>
      <button class="btn sec" style="width:100%" onclick="L.step=1;L.msg=null;render()">Change e-mail</button></div>`;
  }
  return `<div class="login"><div class="hero"><div class="hero-row" style="justify-content:center"><div><h1>Learn C Language</h1><small>Theory • Programs • Compiler • Interviews</small></div></div></div>${dots}${body}</div>`;
}
const clHtml = (list) => list.map((c) => `<button class="${c === L.country ? "on" : ""}" onclick="L.country=this.dataset.c;cl()" data-c="${esc(c)}">${c === L.country ? "✅ " : ""}${esc(c)}</button>`).join("") || `<div class="muted" style="padding:14px">No match</div>`;
window.cl = () => { const list = countries().filter((c) => c.toLowerCase().includes(L.q.toLowerCase())); $("#cl").innerHTML = clHtml(list); const b = $(".login .btn"); if (b) b.disabled = !L.country; };
window.sendOtp = async () => {
  L.email = $("#em").value.trim(); L.msg = null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(L.email)) { L.msg = ["bad", "Enter a valid e-mail address."]; return render(); }
  L.busy = true; render();
  try { L.sent = await post("/api/send-otp", { email: L.email }); L.step = 2; L.msg = null; } catch (e) { L.msg = ["bad", e.message]; }
  L.busy = false; render();
};
// ---------- Google Sign-In (shown only when the server has GOOGLE_CLIENT_ID) ----------
let GCID;
window.gInit = async () => {
  try {
    if (GCID === undefined) GCID = (await (await fetch("/api/config")).json()).googleClientId || "";
    const box = $("#gbtn"); if (!GCID || !box) return;
    if (!window.google || !google.accounts) await new Promise((ok, no) => { const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    google.accounts.id.initialize({ client_id: GCID, callback: gDone });
    google.accounts.id.renderButton(box, { theme: "filled_blue", size: "large", shape: "pill", text: "continue_with", width: 280 });
    $("#gwrap").style.display = "block";
  } catch {}
};
window.gDone = async (resp) => {
  try { const r = await post("/api/google", { credential: resp.credential }); S.user = { email: r.email, country: L.country, token: r.token }; LS.set("user", S.user); S.view = "home"; S.hist = []; render(); toast("Welcome! 🎉"); }
  catch (e) { L.msg = ["bad", e.message]; render(); }
};
window.otpIn = (el) => { el.value = el.value.replace(/\D/g, ""); if (el.value && el.nextElementSibling) el.nextElementSibling.focus(); };
window.otpKey = (e, el) => { if (e.key === "Backspace" && !el.value && el.previousElementSibling) el.previousElementSibling.focus(); };
window.otpPaste = (e) => { const t = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6); if (!t) return; e.preventDefault(); document.querySelectorAll(".otp input").forEach((x, i) => (x.value = t[i] || "")); };
window.verify = async () => {
  const code = [...document.querySelectorAll(".otp input")].map((x) => x.value).join("");
  if (code.length !== 6) { L.msg = ["bad", "Enter all 6 digits."]; return render(); }
  try { const r = await post("/api/verify-otp", { email: L.email, code }); S.user = { email: L.email, country: L.country, token: r.token }; LS.set("user", S.user); S.view = "home"; S.hist = []; render(); toast("Welcome! 🎉"); }
  catch (e) { L.msg = ["bad", e.message]; render(); }
};

// ---------- HOME ----------
function home() {
  const p = progress(), lv = level();
  const l = S.last;
  return `<div class="hero"><div class="hero-row"><div class="ring" style="--p:${p}"><div>${p}%</div></div><div><h1>Learn C Language</h1><span class="lvl">Level ${lv.n} · ${lv.name}</span></div></div></div>
  <div class="toolbar"><span class="pill">✨ Hi, ${esc(S.user.email.split("@")[0])}</span><div class="icons"><button class="ic" onclick="go('settings')">⚙️</button><button class="ic" onclick="location.href='mailto:support@learnc.app?subject=Learn C feedback'">✉️</button><button class="ic" onclick="share()">↗️</button></div></div>
  <div class="grid">
    <button class="tile" onclick="go('theory')">${ART.book}<b>Theory Notes</b><em>${Object.keys(S.theory).length}/${D.theory.length} topics passed</em></button>
    <button class="tile" onclick="go('programs')">${ART.code}<b>Programs</b><em>${Object.keys(S.done).length}/${D.prog.length || 100} solved</em></button>
    <button class="tile" onclick="go('compiler')">${ART.play}<b>C Compiler</b><em>Write & run code</em></button>
    <button class="tile" onclick="go('interview')">${ART.chat}<b>Interview Q&A</b><em>2000 questions</em></button>
    <button class="tile wide" onclick="resume()">${ART.go}<div><b>Pick Up Where You Left Off</b><br><em>${l ? esc(l.label) : "Start your first lesson"}</em></div></button>
    ${S.user.country === "India" ? `<button class="tile wide" onclick="go('college')">${ART.cap}<div><b>Your College</b><br><em>Important questions & sample paper</em></div></button>` : ""}
  </div>`;
}
window.share = async () => { const d = { title: "Learn C Language", text: "Learn C with theory, 2000 programs, an online compiler and interview Q&A!", url: location.origin }; try { if (navigator.share) await navigator.share(d); else { await navigator.clipboard.writeText(d.text + " " + d.url); toast("Link copied"); } } catch {} };
const remember = (view, arg, label) => { S.last = { view, arg, label }; LS.set("last", S.last); };
window.resume = () => { if (S.last) { S.hist = [["home", null]]; go(S.last.view, S.last.arg, false); } else go("theory"); };

// ---------- SETTINGS ----------
function settingsView() {
  return hdr("Settings") + `<div class="card"><h3>🎨 Colour theme</h3><div class="sw">${THEMES.map((t, i) => `<button class="${S.set.theme === i ? "on" : ""}" style="background:linear-gradient(135deg,${t[0]},${t[1]})" onclick="S.set.theme=${i};LS.set('set',S.set);render()"></button>`).join("")}</div>
  <h3 style="margin-top:20px">🌗 Mode</h3><div class="btns" style="margin:0"><button class="btn ${S.set.mode === "dark" ? "" : "sec"}" onclick="S.set.mode='dark';LS.set('set',S.set);render()">Dark</button><button class="btn ${S.set.mode === "light" ? "" : "sec"}" onclick="S.set.mode='light';LS.set('set',S.set);render()">Light</button></div></div>
  <div class="card"><h3>👤 Account</h3><p class="muted">${esc(S.user.email)}<br>${esc(S.user.country)}</p><button class="btn sec" onclick="logout()">Log out</button></div>
  <div class="card"><h3>♻️ Progress</h3><button class="btn sec" onclick="if(confirm('Reset all progress?')){S.theory={};S.done={};S.last=null;LS.set('theory',{});LS.set('done',{});LS.set('last',null);toast('Progress reset');render()}">Reset progress</button></div>`;
}
window.logout = () => { localStorage.removeItem("lc_user"); S.user = null; L.step = 0; L.sent = null; L.msg = null; render(); };

// ---------- THEORY ----------
function theoryList() {
  return hdr("Theory Notes") + `<div class="list">${D.theory.map((t) => `<button class="row" onclick="go('topic',${t.id})"><div class="em">${t.icon}</div><div class="tx"><b>${t.id}. ${esc(t.title)}</b><small>${t.quiz.length}-question quiz</small></div><span class="badge ${S.theory[t.id] ? "ok" : ""}">${S.theory[t.id] ? "✓ Passed" : "Learn"}</span></button>`).join("")}</div>`;
}
const QZ = { i: 0, score: 0, picked: null, run: false };
function topicView() {
  const t = D.theory.find((x) => x.id === S.arg); remember("topic", t.id, `Theory: ${t.title}`);
  const next = D.theory.find((x) => x.id === t.id + 1);
  return hdr(`${t.icon} ${esc(t.title)}`) + `<div class="card"><div class="notes">${t.html}</div></div>
  <div class="card" id="quiz">${quizHtml(t)}</div>
  <div class="btns">${next ? `<button class="btn sec" onclick="QZ.run=false;go('topic',${next.id},false)">Next topic →</button>` : ""}</div>`;
}
function quizHtml(t) {
  if (S.theory[t.id] && !QZ.run) return `<h3>✅ Topic completed</h3><p class="muted">You passed this quiz. Want to try again?</p><button class="btn sec" onclick="QZ.run=true;QZ.i=0;QZ.score=0;QZ.picked=null;$('#quiz').innerHTML=quizHtml(D.theory.find(x=>x.id===${t.id}))">Retake quiz</button>`;
  if (!QZ.run) return `<h3>📝 Test yourself</h3><p class="muted">Pass this ${t.quiz.length}-question quiz to count this topic in your progress. You need every answer right.</p><button class="btn" onclick="QZ.run=true;QZ.i=0;QZ.score=0;QZ.picked=null;$('#quiz').innerHTML=quizHtml(D.theory.find(x=>x.id===${t.id}))">Start quiz</button>`;
  if (QZ.i >= t.quiz.length) {
    const ok = QZ.score === t.quiz.length;
    if (ok && !S.theory[t.id]) { S.theory[t.id] = true; LS.set("theory", S.theory); }
    return `<h3>${ok ? "🎉 Perfect! Topic passed" : "Almost there"}</h3><p class="muted">Score: ${QZ.score}/${t.quiz.length}${ok ? "" : " — read the notes again and retry."}</p><button class="btn" onclick="QZ.run=true;QZ.i=0;QZ.score=0;QZ.picked=null;$('#quiz').innerHTML=quizHtml(D.theory.find(x=>x.id===${t.id}))">${ok ? "Retake" : "Try again"}</button>`;
  }
  const q = t.quiz[QZ.i];
  return `<div class="muted">Question ${QZ.i + 1} of ${t.quiz.length}</div><div class="q" style="margin:8px 0">${esc(q.q)}</div>` +
    q.opts.map((o, k) => `<button class="opt ${QZ.picked == null ? "" : k === q.a ? "good" : k === QZ.picked ? "wrong" : ""}" ${QZ.picked != null ? "disabled" : ""} onclick="pick(${t.id},${k})">${esc(o)}</button>`).join("") +
    (QZ.picked != null ? `<button class="btn" style="margin-top:8px" onclick="QZ.i++;QZ.picked=null;$('#quiz').innerHTML=quizHtml(D.theory.find(x=>x.id===${t.id}))">Continue</button>` : "");
}
window.pick = (id, k) => { const t = D.theory.find((x) => x.id === id); QZ.picked = k; if (k === t.quiz[QZ.i].a) QZ.score++; $("#quiz").innerHTML = quizHtml(t); };

// ---------- PROGRAMS ----------
function progTopics() {
  const P = D.pq.topics, have = {}; D.prog.forEach((x) => (have[x.topic] = (have[x.topic] || 0) + 1));
  const total = D.pq.items.length;
  return hdr("Programs · " + total) + `<div class="list"><button class="row" onclick="PS.topic=0;PS.q='';PS.page=0;go('plist',0)"><div class="em">🔎</div><div class="tx"><b>All programs</b><small>Search across all ${total}</small></div></button>${P.map((t) => `<button class="row" onclick="PS.topic=${t.no};PS.q='';PS.page=0;go('plist',${t.no})"><div class="em">${String(t.no).padStart(2, "0")}</div><div class="tx"><b>${esc(t.title)}</b><small>${t.level} · Q${t.range[0]}–${t.range[1]}${have[t.no] ? ` · ${have[t.no]} with solutions` : ""}</small></div></button>`).join("")}</div>`;
}
const PS = { topic: 0, q: "", page: 0 }, PPER = 25;
function plistItems() {
  const terms = PS.q.toLowerCase().split(/\s+/).filter(Boolean), base = D.pq.items.filter((x) => !PS.topic || x.topic === PS.topic);
  if (!terms.length) return base;
  const code = new Map(D.prog.map((p) => [p.id, p.code.toLowerCase()]));
  const inQ = base.filter((x) => { const t = (x.id + " " + x.q).toLowerCase(); return terms.every((w) => t.includes(w)); });
  const seen = new Set(inQ.map((x) => x.id));
  const inCode = base.filter((x) => !seen.has(x.id) && terms.every((w) => ((x.q + " " + (code.get(x.id) || "")).toLowerCase()).includes(w)));
  return inQ.concat(inCode);
}
function progList() {
  PS.topic = S.arg || 0;
  const t = PS.topic ? D.pq.topics.find((x) => x.no === PS.topic) : null, all = plistItems(), pages = Math.max(1, Math.ceil(all.length / PPER));
  PS.page = Math.min(PS.page, pages - 1);
  const items = all.slice(PS.page * PPER, PS.page * PPER + PPER), solved = new Set(D.prog.map((p) => p.id));
  return hdr(t ? esc(t.title) : "All programs") + `<input class="field search" placeholder="🔍 Search programs… (e.g. palindrome)" value="${esc(PS.q)}" onchange="PS.q=this.value;PS.page=0;render()">
  <div class="list">${items.map((x) => `<button class="row" onclick="go('prog',${x.id})"><div class="em" style="font-size:14px;font-weight:700">${x.id}</div><div class="tx"><b style="font-weight:500">${esc(x.q)}</b></div><span class="badge ${S.done[x.id] ? "ok" : ""}">${S.done[x.id] ? "✓" : solved.has(x.id) ? "Code" : "Try"}</span></button>`).join("") || `<p class="muted" style="padding:0 18px">No programs found.</p>`}</div>
  <div class="pager"><button class="btn sec" ${PS.page ? "" : "disabled"} onclick="PS.page--;render();scrollTo(0,0)">← Prev</button><span class="muted">${PS.page + 1} / ${pages}</span><button class="btn sec" ${PS.page < pages - 1 ? "" : "disabled"} onclick="PS.page++;render();scrollTo(0,0)">Next →</button></div>`;
}
function progView() {
  const q = D.pq.items.find((x) => x.id === S.arg), p = D.prog.find((x) => x.id === q.id);
  remember("prog", q.id, `Program ${q.id}: ${q.q.slice(0, 40)}…`);
  return hdr(`Program ${q.id}`) + `<div class="card"><div class="q">${esc(q.q)}</div></div>` + (p
    ? `<div class="card"><h3>💻 Code</h3><pre>${hl(p.code)}</pre>${p.stdin ? `<div class="muted">Sample input:</div><pre>${esc(p.stdin)}</pre>` : ""}<h3>📤 Sample output</h3><pre class="out">${esc(p.output)}</pre></div>`
    : `<div class="card"><p class="muted">The solution for this question is being added. Try writing it yourself in the compiler!</p></div>`) +
    `<div class="btns">${p ? `<button class="btn" onclick="runProg(${q.id})">▶ Run</button><button class="btn sec" onclick="openIn(${q.id})">✏️ Edit & run</button>` : `<button class="btn" onclick="openIn(${q.id})">✏️ Write it yourself</button>`}</div><div class="btns">${q.id > 1 ? `<button class="btn sec" onclick="go('prog',${q.id - 1},false)">← Prev</button>` : ""}${q.id < D.pq.items[D.pq.items.length - 1].id ? `<button class="btn sec" onclick="go('prog',${q.id + 1},false)">Next →</button>` : ""}</div>`;
}
window.runProg = (id) => { const p = D.prog.find((x) => x.id === id); S.ctx = id; termOpen(p.code, `Program ${id}`, id); };
window.openIn = (id) => { const p = D.prog.find((x) => x.id === id); S.ctx = id; S.code = { code: p ? p.code : `#include <stdio.h>\n\nint main(void)\n{\n    /* ${D.pq.items.find((x) => x.id === id).q.replace(/\*\//g, "")} */\n\n    return 0;\n}\n`, stdin: "" }; go("compiler", "ctx"); };

// ---------- COMPILER (full page editor + full screen interactive terminal) ----------
const TEMPLATE = `#include <stdio.h>\n\nint main(void)\n{\n    printf("Hello, World!\\n");\n    return 0;\n}\n`;
const SYMS = ["{", "}", "(", ")", "[", "]", ";", '"', "'", "<", ">", "#", "&", "*", "=", "+", "-", "/", "\\", "%", "!", ",", ".", "|"];
function compilerView() {
  const c = S.code || LS.get("code", { code: TEMPLATE, stdin: "" });
  return `<div class="cp-top"><button class="back" onclick="back()">←</button><h2>C Compiler</h2><button class="tbtn" onclick="if(confirm('Reset to the Hello World template?')){S.code={code:TEMPLATE,stdin:''};S.ctx=null;render()}">Reset</button><button class="btn run" onclick="runCode()">▶ Run</button></div>
  <textarea class="cp-edit" id="code" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" oninput="saveCode()" onkeydown="edKey(event)">${esc(c.code)}</textarea>
  <div class="cp-syms"><button onmousedown="event.preventDefault()" onclick="ins('    ')">Tab</button>${SYMS.map((x) => `<button onmousedown="event.preventDefault()" onclick="ins(this.textContent)">${esc(x)}</button>`).join("")}</div>`;
}
window.ins = (t) => { const e = $("#code"); if (!e) return; const a = e.selectionStart, b = e.selectionEnd; e.setRangeText(t, a, b, "end"); e.focus(); saveCode(); };
window.edKey = (ev) => {
  const e = ev.target;
  if (ev.key === "Tab") { ev.preventDefault(); ins("    "); }
  else if (ev.key === "Enter") {      // keep indentation, like a real editor
    const a = e.selectionStart, line = e.value.slice(0, a).split("\n").pop(), ind = (line.match(/^\s*/) || [""])[0] + (/\{\s*$/.test(line) ? "    " : "");
    ev.preventDefault(); ins("\n" + ind);
  }
};
window.saveCode = () => { const e = $("#code"); S.code = { code: e ? e.value : (S.code || {}).code || "", stdin: "" }; LS.set("code", S.code); };
window.runCode = () => { saveCode(); termOpen(S.code.code, S.ctx ? `Program ${S.ctx}` : "C Compiler", S.ctx, ""); };

// ----- terminal -----
const T = { id: null, pos: 0, running: false, ctx: null, code: "", hist: [], hi: 0 };
function termEl() {
  let t = $("#term");
  if (!t) {
    t = document.createElement("div"); t.id = "term";
    t.innerHTML = `<div class="term-top"><button class="back" onclick="termClose()">←</button><h2 id="tt">Program</h2><span id="tst" class="badge"></span><button class="tbtn stop" id="tstop" onclick="termStop()">■ Stop</button><button class="tbtn" id="trerun" onclick="termRestart()">↻ Run again</button></div>
      <div id="thint" class="term-hint"></div><pre id="tout" class="term-out"></pre>
      <div class="term-in"><input id="tin" placeholder="Type input here, then press Enter ⏎" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send"><button class="tbtn eof" onclick="termEof()" title="End of input (Ctrl+D)">EOF</button><button class="btn" onclick="termSend()">Send</button></div>`;
    document.body.appendChild(t);
    $("#tin", t).addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); termSend(); }
      else if (e.key === "ArrowUp" && T.hist.length) { T.hi = Math.max(0, T.hi - 1); e.target.value = T.hist[T.hi] || ""; e.preventDefault(); }
      else if (e.key === "ArrowDown" && T.hist.length) { T.hi = Math.min(T.hist.length, T.hi + 1); e.target.value = T.hist[T.hi] || ""; e.preventDefault(); }
    });
    if (window.visualViewport) { const f = () => { t.style.height = window.visualViewport.height + "px"; t.style.top = window.visualViewport.offsetTop + "px"; }; window.visualViewport.addEventListener("resize", f); window.visualViewport.addEventListener("scroll", f); f(); }
  }
  return t;
}
const tput = (txt, cls) => { const o = $("#tout"); if (!txt) return; const stick = o.scrollHeight - o.scrollTop - o.clientHeight < 60; if (cls) { const sp = document.createElement("span"); sp.className = cls; sp.textContent = txt; o.appendChild(sp); } else o.appendChild(document.createTextNode(txt)); if (stick) o.scrollTop = o.scrollHeight; };
const tstatus = (txt, cls = "") => { const b = $("#tst"); b.textContent = txt; b.className = "badge " + cls; };
function termOpen(code, title, ctx, hint) {
  T.code = code; T.ctx = ctx || null;
  const t = termEl(); t.classList.add("on"); document.documentElement.style.overflow = "hidden";
  $("#tt").textContent = title;
  const sample = ctx ? (D.prog.find((x) => x.id === ctx) || {}).stdin : "";
  $("#thint").innerHTML = sample ? `💡 Sample input: <b>${esc(sample.replace(/\n/g, " ⏎ "))}</b> — but you can type any value you like.` : "";
  $("#thint").style.display = sample ? "block" : "none";
  termStart();
}
async function termStart() {
  T.running = false; const old = T.id; T.id = null; if (old) post("/api/run/stop", { id: old }).catch(() => {});
  $("#tout").textContent = ""; tstatus("Compiling…"); setBtns(true); $("#tin").value = ""; $("#tin").disabled = false;
  try {
    const r = await post("/api/run/start", { code: T.code });
    if (r.stage === "compile") { tput("Compile error\n\n", "te"); tput(r.errors + "\n", "te"); tstatus("Compile error", "bad"); setBtns(false); $("#tin").disabled = true; return; }
    T.id = r.id; T.pos = 0; T.running = true; tstatus("Running", "ok"); setBtns(true); $("#tin").focus(); pollLoop(r.id);
  } catch (e) { tput(e.message + "\n", "te"); tstatus("Error", "bad"); setBtns(false); $("#tin").disabled = true; }
}
function setBtns(running) { $("#tstop").style.display = running ? "" : "none"; $("#trerun").style.display = running ? "none" : ""; }
async function pollLoop(id) {
  let fails = 0;
  while (T.id === id && T.running) {
    try {
      const r = await post("/api/run/poll", { id, pos: T.pos }); fails = 0;
      if (T.id !== id) return;
      tput(r.out); T.pos = r.pos;
      if (r.done) { T.running = false; if (r.note) tput("\n" + r.note + "\n", "td"); else tput(`\n[Program finished with exit code ${r.code}]\n`, "td"); tstatus(r.code === 0 && !r.note ? "Finished" : "Stopped", r.code === 0 && !r.note ? "ok" : "bad"); setBtns(false); $("#tin").disabled = true;
        if (r.code === 0 && !r.note && T.ctx && !S.done[T.ctx]) { S.done[T.ctx] = true; LS.set("done", S.done); toast("Program " + T.ctx + " solved ✅"); }
        return; }
    } catch (e) {
      if (/ended/i.test(e.message) || ++fails > 3) { if (T.id === id) { T.running = false; tput("\n[Connection lost]\n", "td"); tstatus("Stopped", "bad"); setBtns(false); $("#tin").disabled = true; } return; }
      await new Promise((r) => setTimeout(r, 600));
    }
  }
}
window.termSend = () => {
  const i = $("#tin"); if (!T.running || !T.id) return; const v = i.value; i.value = "";
  if (v.trim()) { T.hist.push(v); T.hi = T.hist.length; }
  tput(v + "\n", "ti"); post("/api/run/input", { id: T.id, text: v }).catch(() => {}); i.focus();
};
window.termEof = () => { if (T.running && T.id) { tput("^D\n", "ti"); post("/api/run/input", { id: T.id, eof: true }).catch(() => {}); } };
window.termStop = () => { if (T.id) post("/api/run/stop", { id: T.id }).catch(() => {}); };
window.termRestart = () => termStart();
window.termClose = () => { const id = T.id; T.running = false; T.id = null; if (id) post("/api/run/stop", { id }).catch(() => {}); $("#term").classList.remove("on"); document.documentElement.style.overflow = ""; render(); };

// ---------- INTERVIEW ----------
function interviewSecs() {
  const cnt = {}; D.iq.items.forEach((x) => (cnt[x.sec] = (cnt[x.sec] || 0) + 1));
  return hdr("Interview Q&A · 2000") + `<div class="list"><button class="row" onclick="IL.sec=0;IL.q='';IL.page=0;go('ilist',0)"><div class="em">🔎</div><div class="tx"><b>All questions</b><small>Search across all 2000</small></div></button>${D.iq.sections.map((s, i) => `<button class="row" onclick="IL.sec=${i + 1};IL.q='';IL.page=0;go('ilist',${i + 1})"><div class="em">${s.no}</div><div class="tx"><b>${esc(s.title)}</b><small>${cnt[i + 1] || 0} questions</small></div></button>`).join("")}</div>`;
}
const IL = { sec: 0, q: "", page: 0, open: null }, PER = 20;
function ilistItems() { const q = IL.q.toLowerCase(); return D.iq.items.filter((x) => (!IL.sec || x.sec === IL.sec) && (!q || x.q.toLowerCase().includes(q))); }
function interviewList() {
  const title = IL.sec ? D.iq.sections[IL.sec - 1].title : "All questions", all = ilistItems(), pages = Math.max(1, Math.ceil(all.length / PER));
  IL.page = Math.min(IL.page, pages - 1);
  const items = all.slice(IL.page * PER, IL.page * PER + PER);
  return hdr(esc(title)) + `<input class="field search" placeholder="🔍 Search questions…" value="${esc(IL.q)}" onchange="IL.q=this.value;IL.page=0;render()">
  <div class="list">${items.map((x) => { const a = D.ia[x.id]; return `<div class="card" style="margin:0;padding:14px 16px"><div class="q"><span class="muted">${x.id}.</span> ${esc(x.q)}</div>${IL.open === x.id ? `<div class="ans">${a ? esc(a).replace(/\n/g, "<br>") : `<span class="muted">Answer for this question is being added.</span>`}</div>` : ""}<button class="badge" style="margin-top:10px" onclick="IL.open=IL.open===${x.id}?null:${x.id};render()">${IL.open === x.id ? "Hide answer" : "Show answer"}</button></div>`; }).join("") || `<p class="muted">No questions found.</p>`}</div>
  <div class="pager"><button class="btn sec" ${IL.page ? "" : "disabled"} onclick="IL.page--;IL.open=null;render();scrollTo(0,0)">← Prev</button><span class="muted">${IL.page + 1} / ${pages}</span><button class="btn sec" ${IL.page < pages - 1 ? "" : "disabled"} onclick="IL.page++;IL.open=null;render();scrollTo(0,0)">Next →</button></div>
  ${S.user.country === "India" ? `<div class="btns"><button class="btn" onclick="go('college')">🎓 Your College</button></div>` : ""}`;
}

// ---------- COLLEGE / UNIVERSITY PAPERS (India only) ----------
const CS = Object.assign({ state: "Andhra Pradesh", name: "", kind: "B.Tech", uni: "jntuk", set: 0 }, LS.get("college2", {}), { shown: false });
const COLLEGE_Q = ["What is the difference between a compiler and an interpreter?", "Explain the structure of a C program with an example.", "Explain data types and format specifiers in C.", "Explain the different types of operators in C with examples.", "Explain if, if-else, nested if and switch statements.", "Differentiate between while, do-while and for loops.", "What is an array? Explain one- and two-dimensional arrays.", "Explain string handling functions with examples.", "What is a pointer? Explain pointer arithmetic and double pointers.", "Differentiate between call by value and call by reference.", "What is recursion? Write a program to find the factorial using recursion.", "Explain storage classes: auto, register, static and extern.", "Differentiate between structure and union.", "Explain malloc(), calloc(), realloc() and free().", "Explain file handling functions in C with examples.", "Write a C program to check whether a number is prime.", "Write a C program to reverse a number / string and check for a palindrome.", "Write a C program to sort an array using bubble sort.", "Write a C program for matrix multiplication.", "Write a C program to find the Fibonacci series up to n terms.", "What are preprocessor directives? Explain #define and #include.", "What is a command line argument?"];
const saveCS = () => LS.set("college2", { state: CS.state, name: CS.name, kind: CS.kind, uni: CS.uni, set: CS.set });
const apUnis = () => ((D.col && D.col.unis) || []).filter((u) => u.courses.includes(CS.kind));
function paperHtml(p, college, uni) {
  let n = 0;
  const body = p.parts.map((pt) => { n = 0; return `<div class="pp-part"><div class="pp-ph">${esc(pt.name)}</div><div class="pp-note">${esc(pt.note)}</div>` +
    (pt.units ? pt.units.map((u) => { n++; return `<div class="pp-unit">${esc(u.unit)}</div><div class="pp-q"><b>${n}.</b> (a) ${esc(u.either[0])}</div><div class="pp-or">OR</div><div class="pp-q"><b>&nbsp;&nbsp;&nbsp;</b> (b) ${esc(u.either[1])}</div>`; }).join("")
      : pt.qs.map((q) => `<div class="pp-q"><b>${++n}.</b> ${esc(q)}</div>`).join("")) + `</div>`; }).join("");
  return `<div class="paper" id="paper"><div class="pp-head"><div class="pp-uni">${esc(uni)}</div><div class="pp-col">${esc(college)}</div><div class="pp-course">${esc(p.course)}</div><div class="pp-title">${esc(p.title)}</div><div class="pp-meta"><span>Time: ${esc(p.time)}</span><span>Max. Marks: ${p.marks}</span></div></div>${body}<div class="pp-end">*** All the best ***</div></div>`;
}
function paperText(p, college, uni) {
  let n = 0; const L = [uni.toUpperCase(), college, p.course, p.title, `Time: ${p.time}      Max. Marks: ${p.marks}`, ""];
  p.parts.forEach((pt) => { n = 0; L.push(pt.name, pt.note, ""); if (pt.units) pt.units.forEach((u) => { n++; L.push(u.unit, `${n}. (a) ${u.either[0]}`, "   OR", `   (b) ${u.either[1]}`, ""); }); else pt.qs.forEach((q) => L.push(`${++n}. ${q}`)); L.push(""); });
  return L.join("\n");
}
function collegeView() {
  const ap = CS.state === "Andhra Pradesh", n = CS.name.trim(), col = D.col;
  const unis = apUnis(); if (ap && !unis.find((u) => u.id === CS.uni) && unis.length) CS.uni = unis[0].id;
  const form = `<div class="card"><h3>Your college details</h3>
  <label class="muted">State</label><select class="field" onchange="CS.state=this.value;CS.shown=false;saveCS();render()"><option ${ap ? "selected" : ""}>Andhra Pradesh</option><option ${ap ? "" : "selected"}>Other state</option></select>
  <label class="muted">College name</label><input class="field" id="cn" placeholder="Enter your college name" value="${esc(CS.name)}" oninput="CS.name=this.value">
  <label class="muted">Course</label><div class="btns" style="margin:6px 0 12px"><button class="btn ${CS.kind === "B.Tech" ? "" : "sec"}" onclick="CS.kind='B.Tech';CS.shown=false;render()">B.Tech</button><button class="btn ${CS.kind === "Degree" ? "" : "sec"}" onclick="CS.kind='Degree';CS.shown=false;render()">Degree</button></div>
  ${ap && col ? `<label class="muted">Your university</label><select class="field" onchange="CS.uni=this.value;CS.shown=false;saveCS()">${unis.map((u) => `<option value="${u.id}" ${u.id === CS.uni ? "selected" : ""}>${esc(u.name)}</option>`).join("")}</select>` : ""}
  <div class="btns" style="margin:14px 0 0"><button class="btn" style="width:100%" onclick="showCollege()">Show</button></div></div>`;
  if (!CS.shown || !n) return hdr("Your College 🎓") + form;
  const kind = CS.kind;
  if (ap && col) {
    const u = col.unis.find((x) => x.id === CS.uni) || col.unis[0], papers = col.papers[kind], p = papers[CS.set % papers.length];
    return hdr("Your College 🎓") + form + `<div class="card"><h3>${esc(n)}</h3><p class="muted">${esc(kind)} · ${esc(u.short)} · C Programming</p></div>
    <div class="card"><h3>📄 Model question paper</h3><p class="muted" style="font-size:13px">Prepared in the typical exam pattern of ${esc(kind)} C Programming. It is a practice (model) paper, not an official past paper of the university.</p>
    <div class="btns" style="margin:10px 0">${papers.map((_, i) => `<button class="btn ${i === CS.set % papers.length ? "" : "sec"}" onclick="CS.set=${i};saveCS();render()">Paper ${i + 1}</button>`).join("")}</div>
    ${paperHtml(p, n, u.name)}
    <div class="btns" style="margin:14px 0 0"><button class="btn" onclick="printPaper()">⬇️ Download PDF</button><button class="btn sec" onclick="downloadTxt()">⬇️ Download text</button></div></div>
    <div class="card"><h3>⭐ Important questions</h3>${col.important[kind].map((g) => `<h4 style="margin:14px 0 6px;color:var(--accent)">${esc(g.unit)}</h4><ol style="padding-left:20px;line-height:1.6;margin:0">${g.qs.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>`).join("")}
    <div class="btns" style="margin:14px 0 0"><button class="btn sec" onclick="downloadQ()">⬇️ Download questions</button></div></div>`;
  }
  return hdr("Your College 🎓") + form + `<div class="card"><h3>${esc(n)}</h3><p class="muted">${esc(kind)} · C Programming</p><h3 style="margin-top:14px">⭐ Important questions</h3><ol style="padding-left:20px;line-height:1.6">${COLLEGE_Q.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>
  <div class="btns" style="margin:14px 0 0"><button class="btn sec" onclick="downloadQ()">⬇️ Download questions</button></div></div>
  <div class="card"><h3>📄 Sample question paper</h3><pre style="white-space:pre-wrap;font-family:inherit;background:var(--card2);color:var(--text)">${esc(samplePaper(n))}</pre><div class="btns" style="margin:14px 0 0"><button class="btn sec" onclick="downloadTxt()">⬇️ Download text</button></div></div>`;
}
window.showCollege = () => { if (!CS.name.trim()) return toast("Enter your college name"); CS.shown = true; if (CS.state === "Andhra Pradesh" && D.col) { const i = D.col.unis.findIndex((x) => x.id === CS.uni); CS.set = Math.max(i, 0) % 3; } saveCS(); render(); scrollTo(0, 0); };
window.printPaper = () => window.print();
function saveFile(name, text) { try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast("Downloaded"); } catch { toast("Download not supported here"); } }
window.downloadTxt = () => {
  const n = CS.name.trim(), col = D.col;
  if (CS.state === "Andhra Pradesh" && col) { const u = col.unis.find((x) => x.id === CS.uni) || col.unis[0], ps = col.papers[CS.kind]; saveFile(`C_Model_Paper_${CS.set % ps.length + 1}.txt`, paperText(ps[CS.set % ps.length], n, u.name)); }
  else saveFile("C_Sample_Paper.txt", samplePaper(n));
};
window.downloadQ = () => {
  const col = D.col, ap = CS.state === "Andhra Pradesh" && col;
  const t = ap ? col.important[CS.kind].map((g) => g.unit + "\n" + g.qs.map((q, i) => `${i + 1}. ${q}`).join("\n")).join("\n\n") : COLLEGE_Q.map((q, i) => `${i + 1}. ${q}`).join("\n");
  saveFile("C_Important_Questions.txt", `${CS.name.trim()} - ${CS.kind} - Important Questions (C Programming)\n\n` + t);
};
function samplePaper(n) {
  const dg = CS.kind === "Degree";
  return `${n.toUpperCase()}\n${CS.kind.toUpperCase()} — PROGRAMMING IN C (SAMPLE PAPER)\nTime: 3 Hours                    Max Marks: 70\n\nSECTION A — Answer any FIVE (5 × 4 = 20)\n1. What is a token? Name the types of tokens in C.\n2. Differentiate between a compiler and an interpreter.\n3. List the data types and format specifiers in C.\n4. What is the difference between ++a and a++?\n5. Define an array. How is a 2-D array declared?\n6. What is a pointer? Give its syntax.\n7. Explain the use of break and continue.\n8. What is recursion?\n\nSECTION B — Answer any FIVE (5 × 10 = 50)\n9. Explain the structure of a C program with an example.\n10. Explain all operators in C with precedence and associativity.\n11. Explain the control statements (if, if-else, switch) with programs.\n12. Explain looping statements with suitable programs.\n13. Write a program to sort an array using bubble sort.\n14. Explain string functions: strlen, strcpy, strcat, strcmp.\n15. Explain pointers and call by value / call by reference with programs.\n16. Explain structures, unions and ${dg ? "enumerated types" : "nested structures"} with examples.\n17. Explain dynamic memory allocation functions.\n18. Explain file handling operations in C.`;
}

// ---------- boot ----------
(async function boot() {
  applyTheme();
  $("#app").innerHTML = `<div style="display:grid;place-items:center;height:100vh"><div class="ring" style="--p:60"><div>…</div></div></div>`;
  try {
    const [th, pq, pr, iq] = await Promise.all([jget("/data/theory.json"), jget("/data/practice_q.json"), jget("/data/programs.json"), jget("/data/interview_q.json")]);
    D.theory = th; D.pq = pq; D.prog = pr; D.iq = iq;
    try { D.ia = await jget("/data/interview_a.json"); } catch {}
    try { D.col = await jget("/data/college.json"); } catch {}
  } catch (e) { $("#app").innerHTML = `<div class="card">Could not load the study material. Check your internet connection and reload.</div>`; return; }
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  render();
})();
