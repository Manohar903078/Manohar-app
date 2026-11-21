/* Learn C - chat box. Works OFFLINE (searches the app's own notes, Q&A and programs).
   If the server has an AI key and the phone is online, it asks the AI too (optional). */
(function () {
  const css = `#aiFab{position:fixed;right:16px;bottom:88px;width:56px;height:56px;border-radius:50%;border:0;background:linear-gradient(135deg,var(--accent2),var(--accent));color:#fff;font-size:26px;box-shadow:0 8px 22px rgba(0,0,0,.35);z-index:60;cursor:pointer;display:grid;place-items:center}
#aiBox{position:fixed;left:0;right:0;bottom:0;top:10%;background:var(--bg);color:var(--text);z-index:70;border-radius:24px 24px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.45);display:none;flex-direction:column;max-width:560px;margin:0 auto}
#aiBox.on{display:flex}
#aiHead{display:flex;align-items:center;gap:10px;padding:14px 16px;font-weight:700;background:var(--card);border-radius:24px 24px 0 0}
#aiHead span{flex:1}#aiHead small{font-weight:500;color:var(--mute);margin-left:6px}#aiHead button{width:36px;height:36px;border-radius:50%;border:0;background:var(--card2);color:var(--text);font-size:16px}
#aiMsgs{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.aiM{max-width:90%;padding:10px 14px;border-radius:18px;line-height:1.55;font-size:15px;overflow-wrap:anywhere}
.aiM.u{align-self:flex-end;background:linear-gradient(135deg,var(--accent2),var(--accent));color:#fff}
.aiM.a{align-self:flex-start;background:var(--card)}
.aiM pre{background:var(--code);color:#f5e9ff;padding:10px;border-radius:12px;overflow:auto;margin:8px 0;white-space:pre;font:13px/1.5 Consolas,monospace}
.aiM p{margin:0 0 8px}.aiM small{color:var(--mute)}
.aiC{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.aiC button{border:0;border-radius:99px;padding:7px 12px;background:var(--card2);color:var(--text);font-size:13px}
#aiForm{display:flex;gap:8px;padding:12px;background:var(--card)}
#aiIn{flex:1;border:0;border-radius:99px;padding:12px 16px;background:var(--card2);color:var(--text);font-size:15px;outline:0}
#aiSend{border:0;border-radius:99px;padding:0 18px;background:linear-gradient(135deg,var(--accent2),var(--accent));color:#fff;font-weight:700}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const fab = document.createElement("button"); fab.id = "aiFab"; fab.textContent = "💬"; fab.setAttribute("aria-label", "Ask");
  const box = document.createElement("div"); box.id = "aiBox";
  box.innerHTML = '<div id="aiHead"><span>✨ Ask Learn C<small id="aiSt"></small></span><button id="aiClr" title="Clear">🗑</button><button id="aiX">✕</button></div><div id="aiMsgs"></div><form id="aiForm"><input id="aiIn" placeholder="Ask anything about C…" autocomplete="off"><button id="aiSend">Send</button></form>';
  document.body.append(fab, box);
  const $m = box.querySelector("#aiMsgs"), $i = box.querySelector("#aiIn"), $s = box.querySelector("#aiSt");
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const fmt = (t) => esc(t).replace(/```(?:\w+)?\n?([\s\S]*?)```/g, "<pre>$1</pre>").replace(/\n/g, "<br>").replace(/<pre>([\s\S]*?)<\/pre>/g, (m) => m.replace(/<br>/g, "\n"));
  const add = (cls, html) => { const d = document.createElement("div"); d.className = "aiM " + cls; d.innerHTML = html; $m.appendChild(d); $m.scrollTop = $m.scrollHeight; return d; };
  const status = () => { $s.textContent = navigator.onLine ? " · online" : " · offline"; };
  addEventListener("online", status); addEventListener("offline", status); status();

  // ---------- local knowledge index ----------
  const STOP = new Set("a an the is are was were be to of in on for and or what whats how why when which who does do did can could i me my you your it its this that with as at by from about tell explain give show define meaning mean means ante enti emiti ela cheppu cheppandi chepandi ra kosam oka lo ni ki tho kada please pls plz c language".split(" "));
  const SYN = { pointers: "pointer", arrays: "array", strings: "string", loops: "loop", functions: "function", structures: "structure", structs: "structure", struct: "structure", malloc: "dynamic", calloc: "dynamic", realloc: "dynamic", compile: "compiler", compiling: "compiler", compilation: "compiler", interpret: "interpreter", variables: "variable", operators: "operator", keywords: "keyword", constants: "constant", identifiers: "identifier", datatype: "data", datatypes: "data", types: "type", recursive: "recursion", prime: "prime", fibonacci: "fibonacci", fibonaci: "fibonacci", factorial: "factorial", palindrome: "palindrome", armstrong: "armstrong", reverse: "reverse", swap: "swap", sorting: "sort", sorted: "sort", searching: "search" };
  const tok = (t) => String(t).toLowerCase().replace(/[^a-z0-9_%#\s]/g, " ").split(/\s+/).filter(Boolean).map((w) => SYN[w] || (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
  let IDX = null, loading = null;
  function build(th, iq, ia, pr) {
    const docs = [], df = new Map();
    const push = (d) => { d.t = new Set(tok(d.text).filter((w) => !STOP.has(w))); d.t.forEach((w) => df.set(w, (df.get(w) || 0) + 1)); docs.push(d); };
    (th || []).forEach((t) => {
      const root = new DOMParser().parseFromString("<div>" + t.html + "</div>", "text/html").body.firstChild; let cur = null;
      const flush = () => { if (cur && (cur.body.length || cur.code)) { cur.text = t.title + " " + cur.head + " " + cur.body.join(" "); push(cur); } };
      const start = (h) => { flush(); cur = { k: "th", topic: t.id, title: t.title, head: h, body: [], code: "" }; };
      start("");
      [...root.children].forEach((el) => {
        if (el.tagName === "H4") start(el.textContent.trim());
        else if (el.tagName === "PRE") { if (!cur.code) cur.code = el.textContent; cur.body.push(el.textContent.replace(/\s+/g, " ").slice(0, 200)); }
        else cur.body.push(el.textContent.replace(/(\|\s*-{2,}\s*)+\|?/g, "").replace(/\|\|/g, "\n").trim());
      });
      flush();
    });
    ((iq && iq.items) || []).forEach((x) => push({ k: "iq", id: x.id, q: x.q, text: x.q, ans: ia ? ia[x.id] : "" }));
    (pr || []).forEach((p) => push({ k: "pr", id: p.id, q: p.q, text: p.q, code: p.code, out: p.output, stdin: p.stdin }));
    return { docs, df, N: docs.length };
  }
  function load() {
    if (IDX) return Promise.resolve(IDX);
    if (loading) return loading;
    const g = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    return (loading = Promise.all([g("/data/theory.json"), g("/data/interview_q.json"), g("/data/interview_a.json"), g("/data/programs.json")]).then(([a, b, c, d]) => (IDX = build(a, b, c, d))));
  }
  function search(q, kind, n) {
    const qt = [...new Set(tok(q).filter((w) => !STOP.has(w)))]; if (!qt.length) return [];
    const res = [];
    for (const d of IDX.docs) {
      if (d.k !== kind) continue;
      let s = 0, hit = 0;
      for (const w of qt) if (d.t.has(w)) { s += Math.log(1 + IDX.N / (IDX.df.get(w) || 1)); hit++; }
      if (!hit) continue;
      s *= hit / qt.length; s /= Math.pow(d.t.size || 1, 0.25);
      if (kind !== "th" && d.text.toLowerCase().includes(qt.join(" "))) s *= 1.4;
      res.push({ d, s });
    }
    return res.sort((a, b) => b.s - a.s).slice(0, n);
  }
  const GENERIC = /learn its definition|being added|concept used to write correct|small compiled example|carefully defined|explain the purpose and behavior|compare their syntax|is a core c idea|state the rule/i;
  const DEFQ = /\b(what|enti|emiti|ante|meaning|define|definition|difference|vs|versus|explain|types|kinds)\b/i;
  const WANTPROG = /\b(program|code|write|example|output|sample|source|rayi|raayi|rasi)\b/i;
  const link = (fn, label) => `<div class="aiC"><button onclick="${fn}">${label}</button></div>`;
  const cut = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s);

  function localAnswer(q) {
    if (/^\s*(hi|hello|hey|namaste|namaskaram|hai)\b/i.test(q) && q.length < 25) return { html: "Hi! 😊 Ask me about any C topic, a definition, an interview question, or a program (for example: <i>pointer ante enti</i>, <i>compiler vs interpreter</i>, <i>factorial program</i>)." };
    const th = search(q, "th", 3), iq = search(q, "iq", 4), pr = search(q, "pr", 3);
    const wantP = WANTPROG.test(q), bt = th[0], bi = iq[0], bp = pr[0];
    const parts = [], chips = [];
    const showProg = bp && (wantP ? bp.s > 0.8 : !DEFQ.test(q) && bp.s > 3 && (!bi || bp.s > bi.s * 1.3) && (!bt || bp.s > bt.s * 1.3));
    if (showProg) {
      const p = bp.d;
      parts.push(`<p><b>${esc(p.q)}</b></p><pre>${esc(p.code)}</pre>` + (p.out ? `<p><small>Output${p.stdin ? " (input: " + esc(p.stdin.replace(/\n/g, ", ")) + ")" : ""}:</small></p><pre>${esc(p.out)}</pre>` : "") + link(`document.getElementById('aiX').click();go('prog',${p.id})`, "▶ Open &amp; run"));
      pr.slice(1, 3).forEach((x) => chips.push(x.d.q));
    }
    const goodI = bi && bi.s > 1.5 && bi.d.ans && !GENERIC.test(bi.d.ans) && (!bt || bi.s >= bt.s * 0.8 || bt.s < 2.5);
    if (!showProg && goodI) {
      parts.push(`<p><b>${esc(bi.d.q)}</b></p><p>${esc(bi.d.ans)}</p>`);
      iq.slice(1, 4).forEach((x) => chips.push(x.d.q));
    } else if (!showProg && bt && bt.s > 1.2) {
      const d = bt.d;
      parts.push(`<p><b>${esc(d.title)}${d.head ? " – " + esc(d.head) : ""}</b></p><p>${esc(cut(d.body.join("\n"), 650)).replace(/\n/g, "<br>")}</p>` + (d.code ? `<pre>${esc(d.code.slice(0, 600))}</pre>` : "") + link(`document.getElementById('aiX').click();go('topic',${d.topic})`, "📘 Open topic notes"));
      iq.filter((x) => x.s > 1.5).slice(0, 3).forEach((x) => chips.push(x.d.q));
    } else if (!showProg && bi && bi.s > 1.5) {
      parts.push(`<p><b>${esc(bi.d.q)}</b></p><p>Check the notes below, and try the related questions.</p>`);
      iq.slice(1, 4).forEach((x) => chips.push(x.d.q));
    }
    if (!parts.length) return { html: "I couldn't find that in the notes. Try simpler words, for example: <i>pointer</i>, <i>array</i>, <i>for loop</i>, <i>printf</i>, <i>factorial program</i>.", chips: ["What is a pointer?", "Compiler vs interpreter", "Fibonacci program"] };
    return { html: parts.join(""), chips: chips.slice(0, 3), ctx: th.slice(0, 2).map((x) => x.d.title + ": " + cut(x.d.body.join(" "), 700)).concat(iq.slice(0, 2).filter((x) => x.d.ans && !GENERIC.test(x.d.ans)).map((x) => x.d.q + " " + x.d.ans)).join("\n") };
  }

  // ---------- chat flow ----------
  let hist = [], busy = false;
  const chipsHtml = (c) => (c && c.length ? `<div class="aiC">${c.map((x) => `<button data-q="${esc(x).replace(/"/g, "&quot;")}">${esc(cut(x, 60))}</button>`).join("")}</div>` : "");
  const hello = () => add("a", "Hi! Ask me anything about C 😊<br><small>Works even without internet.</small>" + chipsHtml(["What is a pointer?", "Compiler vs interpreter", "Fibonacci program", "Escape sequences"]));
  hello();
  fab.onclick = () => { box.classList.add("on"); fab.style.display = "none"; load(); setTimeout(() => $i.focus(), 100); };
  box.querySelector("#aiX").onclick = () => { box.classList.remove("on"); fab.style.display = "grid"; };
  box.querySelector("#aiClr").onclick = () => { hist = []; $m.innerHTML = ""; hello(); };
  $m.addEventListener("click", (e) => { const b = e.target.closest("button[data-q]"); if (b) ask(b.dataset.q); });
  box.querySelector("#aiForm").onsubmit = (e) => { e.preventDefault(); const q = $i.value.trim(); $i.value = ""; if (q) ask(q); };
  async function ask(q) {
    if (busy) return; busy = true; add("u", esc(q));
    const t = add("a", "…");
    let loc; try { await load(); loc = IDX ? localAnswer(q) : { html: "Notes are not loaded yet. Connect to the internet once and open the app, then try again." }; } catch (e) { loc = { html: "Sorry, something went wrong." }; }
    t.innerHTML = loc.html + chipsHtml(loc.chips); $m.scrollTop = $m.scrollHeight;
    // optional online boost (only if the server has an AI key; otherwise silently stays with the offline answer)
    if (navigator.onLine) {
      hist.push({ role: "user", content: q });
      try {
        const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 12000);
        const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: hist, context: loc.ctx || "" }), signal: ctl.signal }); clearTimeout(to);
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.reply) { t.innerHTML = fmt(j.reply) + (loc.chips && loc.chips.length ? chipsHtml(loc.chips) : ""); hist.push({ role: "assistant", content: j.reply }); } else hist.pop();
      } catch { hist.pop(); }
    }
    busy = false; $m.scrollTop = $m.scrollHeight;
  }
})();
