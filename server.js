// Learn C Language - backend with ZERO npm dependencies (Node 18+).
// Serves the app, sends OTP e-mails through Gmail SMTP, compiles C code with gcc.
const http = require("http"), tls = require("tls"), crypto = require("crypto");
const fs = require("fs"), os = require("os"), path = require("path");
const { execFile } = require("child_process");

const PORT = process.env.PORT || 3000;
const SMTP_USER = process.env.SMTP_USER || "";                       // Gmail address
const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s+/g, ""); // Gmail APP PASSWORD (env var only)
const APP_NAME = "Learn C Language";
const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || "").trim();  // Google Sign-In "Web client ID" (public value)
const BREVO_KEY = process.env.BREVO_API_KEY || "";                    // Brevo API key (env var only)
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;                 // sender e-mail verified in Brevo
const MAIL_ON = !!(BREVO_KEY && MAIL_FROM) || !!(SMTP_USER && SMTP_PASS);

// ---------- Brevo HTTPS API (works on Render free: no SMTP ports needed) ----------
function sendBrevo(to, subject, text, html) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ sender: { name: APP_NAME, email: MAIL_FROM }, to: [{ email: to }], subject, textContent: text, htmlContent: html });
    const r = require("https").request({ hostname: "api.brevo.com", path: "/v3/smtp/email", method: "POST", timeout: 20000,
      headers: { "api-key": BREVO_KEY, "content-type": "application/json", accept: "application/json", "content-length": Buffer.byteLength(data) } },
      (res) => { let b = ""; res.on("data", (c) => (b += c)); res.on("end", () => (res.statusCode < 300 ? resolve() : reject(new Error("brevo " + res.statusCode + " " + b.slice(0, 200))))); });
    r.on("timeout", () => r.destroy(new Error("brevo timeout"))); r.on("error", reject); r.end(data);
  });
}

// ---------- tiny SMTP client (implicit TLS, AUTH PLAIN) ----------
function sendMail(to, subject, text, html) {
  return new Promise((resolve, reject) => {
    const sock = tls.connect(465, "smtp.gmail.com", { servername: "smtp.gmail.com" });
    sock.setEncoding("utf8"); sock.setTimeout(20000, () => { sock.destroy(); reject(new Error("smtp timeout")); });
    let buf = "", step = 0;
    const b64 = (s) => Buffer.from(s).toString("base64");
    const boundary = "b" + crypto.randomBytes(8).toString("hex");
    const msg = [`From: ${APP_NAME} <${SMTP_USER}>`, `To: ${to}`, `Subject: ${subject}`, "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`, "",
      `--${boundary}`, "Content-Type: text/plain; charset=utf-8", "", text,
      `--${boundary}`, "Content-Type: text/html; charset=utf-8", "", html, `--${boundary}--`].join("\r\n")
      .replace(/\r\n\./g, "\r\n..");
    const steps = [["EHLO learnc.app", 250], [`AUTH PLAIN ${b64("\0" + SMTP_USER + "\0" + SMTP_PASS)}`, 235],
      [`MAIL FROM:<${SMTP_USER}>`, 250], [`RCPT TO:<${to}>`, 250], ["DATA", 354], [msg + "\r\n.", 250], ["QUIT", 221]];
    sock.on("data", (d) => {
      buf += d; if (!/\r?\n$/.test(buf)) return;
      const last = buf.trim().split(/\r?\n/).pop(); if (/^\d{3}-/.test(last)) return;
      const code = parseInt(last.slice(0, 3), 10); buf = "";
      if (step === 0) { if (code !== 220) return reject(new Error("smtp greet " + last)); sock.write(steps[0][0] + "\r\n"); step = 1; return; }
      const exp = steps[step - 1][1];
      if (code !== exp) { sock.destroy(); return reject(new Error("smtp " + last)); }
      if (step === steps.length) { sock.end(); return resolve(); }
      sock.write(steps[step][0] + "\r\n"); step++;
    });
    sock.on("error", reject);
  });
}

// ---------- OTP ----------
const otps = new Map();
const emailOk = (e) => /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(e);
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");

async function sendOtp(body) {
  const email = String(body.email || "").trim().toLowerCase();
  if (!emailOk(email)) return [400, { error: "Enter a valid e-mail address." }];
  const prev = otps.get(email);
  if (prev && Date.now() - prev.last < 30000) return [429, { error: "Please wait 30 seconds before requesting a new code." }];
  const otp = String(crypto.randomInt(100000, 1000000));
  otps.set(email, { hash: hash(otp), exp: Date.now() + 600000, tries: 0, last: Date.now() });
  if (!MAIL_ON) { console.log(`[DEMO] OTP for ${email}: ${otp}`); return [200, { ok: true, dev: true, devOtp: otp }]; }
  try {
    await (BREVO_KEY && MAIL_FROM ? sendBrevo : sendMail)(email, `${otp} is your ${APP_NAME} code`,
      `Your ${APP_NAME} verification code is ${otp}. It expires in 10 minutes.`,
      `<div style="font-family:Arial;max-width:420px;margin:auto;padding:24px;border-radius:16px;background:#2a1b3d;color:#fff"><h2 style="margin:0 0 8px">${APP_NAME}</h2><p>Your verification code:</p><div style="font-size:34px;letter-spacing:8px;font-weight:700;background:#fff;color:#2a1b3d;padding:14px;text-align:center;border-radius:12px">${otp}</div><p style="opacity:.7;font-size:13px">Valid for 10 minutes. If you did not request this, ignore this e-mail.</p></div>`);
    return [200, { ok: true }];
  } catch (e) { console.error("mail error:", e.message); otps.delete(email); return [500, { error: "Could not send the e-mail. Please try again later." }]; }
}
function verifyOtp(body) {
  const email = String(body.email || "").trim().toLowerCase(), code = String(body.code || "").trim();
  const rec = otps.get(email);
  if (!rec || Date.now() > rec.exp) return [400, { error: "Code expired. Request a new one." }];
  if (++rec.tries > 5) { otps.delete(email); return [429, { error: "Too many attempts. Request a new code." }]; }
  if (hash(code) !== rec.hash) return [400, { error: "Wrong code. Try again." }];
  otps.delete(email); return [200, { ok: true, token: crypto.randomBytes(16).toString("hex") }];
}

// ---------- interactive C runner (run inside Docker/sandbox in production) ----------
// start -> compile + spawn the program; poll -> stream its output; input -> feed stdin; stop -> kill.
const { spawn } = require("child_process");
const sessions = new Map();
const MAX_SESSIONS = 8, MAX_OUT = 200000;
function endSession(s, note) {
  if (s.proc && !s.done) { try { s.proc.kill("SIGKILL"); } catch {} }
  if (note && !s.done) s.note = note;
  s.done = true; wake(s);
}
function wake(s) { const w = s.waiters.splice(0); w.forEach((f) => f()); }
function cleanDir(s) { if (s.dir) { try { fs.rmSync(s.dir, { recursive: true, force: true }); } catch {} s.dir = null; } }
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (!s.done && (now - s.last > 45000 || now - s.born > 600000)) endSession(s, "[Stopped: session timed out]");
    if (s.done && now - s.last > 60000) { cleanDir(s); sessions.delete(id); }
  }
}, 5000).unref();

function startRun(body) {
  return new Promise((resolve) => {
    const code = String(body.code || "");
    if (!code.trim()) return resolve([400, { error: "Write some code first." }]);
    if (code.length > 50000) return resolve([400, { error: "Code is too long." }]);
    if (/#\s*include\s*[<"][^>"]*[\/\\]/.test(code)) return resolve([200, { stage: "compile", errors: "Error: #include with a path is not allowed." }]);
    const live = [...sessions.values()].filter((x) => !x.done).length;
    if (live >= MAX_SESSIONS) return resolve([503, { error: "Server busy. Try again in a few seconds." }]);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "c-")), src = path.join(dir, "main.c"), exe = path.join(dir, "main");
    fs.writeFileSync(src, code.replace(/#\s*include\s*<conio\.h>/g, '#include "tc_compat.h"'));
    for (const f of ["tc_compat.h", "unbuf.h"]) fs.copyFileSync(path.join(__dirname, f), path.join(dir, f));
    execFile("gcc", ["-std=gnu99", "-w", "-O0", "-include", "unbuf.h", "-o", exe, src, "-lm"], { timeout: 10000, cwd: dir, maxBuffer: 1 << 20 }, (err, so, se) => {
      if (err) { fs.rmSync(dir, { recursive: true, force: true }); return resolve([200, { stage: "compile", errors: (se || String(err)).split(dir + "/").join("").slice(0, 6000) }]); }
      const id = crypto.randomBytes(8).toString("hex");
      const s = { id, dir, buf: "", done: false, code: null, note: "", waiters: [], last: Date.now(), born: Date.now(), proc: null };
      const proc = spawn("sh", ["-c", `ulimit -v 262144; ulimit -t 10; ulimit -f 1024; exec "${exe}"`], { cwd: dir, stdio: ["pipe", "pipe", "pipe"] });
      s.proc = proc;
      const add = (d) => {
        if (s.buf.length < MAX_OUT) s.buf += d; else if (!s.note) endSession(s, "[Stopped: too much output]");
        wake(s);
      };
      proc.stdout.setEncoding("utf8"); proc.stderr.setEncoding("utf8");
      proc.stdout.on("data", add); proc.stderr.on("data", add);
      proc.stdin.on("error", () => {});
      proc.on("close", (c, sig) => {
        if (!s.done && !s.note) {
          if (sig === "SIGXCPU" || sig === "SIGKILL") s.note = "[Stopped: the program used too much CPU time or memory (maybe an infinite loop)]";
          else if (sig) s.note = `[Program stopped by signal ${sig}${sig === "SIGSEGV" ? " (segmentation fault)" : ""}]`;
        }
        s.code = c; s.done = true; cleanDir(s); wake(s);
      });
      proc.on("error", () => { s.note = "[Could not start the program]"; s.done = true; wake(s); });
      sessions.set(id, s);
      resolve([200, { stage: "run", id }]);
    });
  });
}
function getSession(body) { const s = sessions.get(String(body.id || "")); if (s) s.last = Date.now(); return s; }
async function pollRun(body) {
  const s = getSession(body); if (!s) return [404, { error: "Session ended." }];
  const pos = Math.max(0, parseInt(body.pos, 10) || 0);
  if (!s.done && s.buf.length <= pos) await new Promise((r) => { const t = setTimeout(r, 15000); s.waiters.push(() => { clearTimeout(t); r(); }); });
  s.last = Date.now();
  return [200, { out: s.buf.slice(pos), pos: s.buf.length, done: s.done, code: s.code, note: s.note }];
}
function inputRun(body) {
  const s = getSession(body); if (!s || s.done) return [404, { error: "The program is not running." }];
  try { if (body.eof) s.proc.stdin.end(); else s.proc.stdin.write(String(body.text || "").slice(0, 4000) + "\n"); } catch {}
  return [200, { ok: true }];
}
function stopRun(body) { const s = getSession(body); if (s) endSession(s, "[Stopped]"); return [200, { ok: true }]; }

// ---------- static files + routing ----------
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2" };
function serve(req, res) {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const isData = p.startsWith("/data/");
  const root = isData ? path.join(__dirname, "data") : path.join(__dirname, "public");
  const file = path.normalize(path.join(root, isData ? p.slice(5) : p));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("Not found"); }
  const type = MIME[path.extname(file)] || "application/octet-stream", st = fs.statSync(file);
  if (/gzip/.test(req.headers["accept-encoding"] || "") && /^(text\/|application\/json|text\/javascript)/.test(type) && st.size > 2048) {
    const key = file + st.mtimeMs; let gz = GZ.get(key);
    if (!gz) { gz = require("zlib").gzipSync(fs.readFileSync(file)); GZ.set(key, gz); }
    res.writeHead(200, { "Content-Type": type, "Content-Encoding": "gzip", "Cache-Control": "no-cache" }); return res.end(gz);
  }
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
  fs.createReadStream(file).pipe(res);
}
const GZ = new Map();
// ---------- Google Sign-In: verify the ID token with Google ----------
function googleLogin(body) {
  return new Promise((resolve) => {
    const cred = String(body.credential || "");
    if (!GOOGLE_CLIENT_ID) return resolve([503, { error: "Google sign-in is not set up on this server." }]);
    if (!cred || cred.length > 5000) return resolve([400, { error: "Invalid Google sign-in." }]);
    require("https").get("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(cred), { timeout: 15000 }, (res) => {
      let b = ""; res.on("data", (c) => (b += c));
      res.on("end", () => {
        let t = {}; try { t = JSON.parse(b); } catch {}
        const ok = res.statusCode === 200 && t.aud === GOOGLE_CLIENT_ID && (t.email_verified === true || t.email_verified === "true") && t.email && Number(t.exp) * 1000 > Date.now();
        resolve(ok ? [200, { ok: true, email: String(t.email).toLowerCase(), name: t.name || "", token: crypto.randomBytes(16).toString("hex") }] : [401, { error: "Google sign-in failed. Please try again." }]);
      });
    }).on("error", () => resolve([502, { error: "Could not reach Google. Try again." }])).on("timeout", function () { this.destroy(); });
  });
}
const routes = { "/api/google": googleLogin, "/api/send-otp": sendOtp, "/api/verify-otp": async (b) => verifyOtp(b), "/api/run/start": startRun, "/api/run/poll": pollRun, "/api/run/input": async (b) => inputRun(b), "/api/run/stop": async (b) => stopRun(b) };
http.createServer((req, res) => {
  if (req.method === "POST" && routes[req.url]) {
    let data = ""; req.on("data", (c) => { data += c; if (data.length > 200000) req.destroy(); });
    req.on("end", async () => {
      let body = {}; try { body = JSON.parse(data || "{}"); } catch {}
      const [status, json] = await routes[req.url](body);
      res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(json));
    });
  } else if (req.method === "GET" && req.url === "/api/config") { res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ googleClientId: GOOGLE_CLIENT_ID })); }
  else if (req.method === "GET") serve(req, res); else { res.writeHead(405); res.end(); }
}).listen(PORT, () => console.log(`${APP_NAME}: http://localhost:${PORT}  (${MAIL_ON ? "e-mail ON" : "DEMO OTP mode - set BREVO_API_KEY and MAIL_FROM"})`));
