/* Java OOP @ Loei Tech — shared interactivity (no dependencies) */
(function () {
  "use strict";

  // ---------- safe storage ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---------- mascot ----------
  const JAVY = `<svg viewBox="0 0 200 220" role="img" aria-label="น้องจาวี่ แก้วกาแฟมาสคอต">
    <text class="steam" x="62" y="48" font-family="JetBrains Mono, monospace" font-size="42" fill="var(--lav)">{</text>
    <text class="steam b" x="112" y="40" font-family="JetBrains Mono, monospace" font-size="42" fill="var(--lav)">}</text>
    <path d="M150 105c26 0 32 46 0 50" fill="none" stroke="#9E86E8" stroke-width="14" stroke-linecap="round"/>
    <path d="M38 70h120l-10 112a22 22 0 0 1-22 20H70a22 22 0 0 1-22-20z" fill="#C8B6FF"/>
    <path d="M38 70h120l-1.5 16H39.5z" fill="#B8A1E3"/>
    <ellipse cx="98" cy="70" rx="60" ry="9" fill="#E9E1FF"/>
    <ellipse cx="98" cy="70" rx="48" ry="5" fill="#7A5A3A"/>
    <circle cx="78" cy="128" r="9" fill="#2D2250"/><circle cx="118" cy="128" r="9" fill="#2D2250"/>
    <circle cx="81" cy="125" r="3" fill="#fff"/><circle cx="121" cy="125" r="3" fill="#fff"/>
    <ellipse cx="66" cy="148" rx="9" ry="5" fill="#FFB8D6"/><ellipse cx="130" cy="148" rx="9" ry="5" fill="#FFB8D6"/>
    <path d="M88 150q10 10 20 0" fill="none" stroke="#2D2250" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
  $$("[data-javy]").forEach(el => { el.innerHTML = JAVY; });

  // ---------- theme ----------
  const root = document.documentElement;
  const savedTheme = store.get("ltc-java:theme", null);
  if (savedTheme) root.setAttribute("data-theme", savedTheme);
  $$("[data-theme-toggle]").forEach(btn => {
    const label = () => {
      const dark = root.getAttribute("data-theme") === "dark" ||
        (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
      btn.textContent = dark ? "โหมดสว่าง" : "โหมดมืด";
      return dark;
    };
    label();
    btn.addEventListener("click", () => {
      const next = label() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store.set("ltc-java:theme", next);
      label();
    });
  });

  // ---------- copy buttons ----------
  $$(".code:not(.trace)").forEach(box => {
    const pre = $("pre", box);
    if (!pre) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "copy-btn"; b.textContent = "คัดลอก";
    b.addEventListener("click", async () => {
      const text = pre.innerText.replace(/\n$/, "");
      try { await navigator.clipboard.writeText(text); b.textContent = "คัดลอกแล้ว"; }
      catch (e) {
        const r = document.createRange(); r.selectNodeContents(pre);
        const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        b.textContent = "กด Ctrl/Cmd+C";
      }
      setTimeout(() => (b.textContent = "คัดลอก"), 1600);
    });
    box.appendChild(b);
  });

  // ---------- tabs (remember OS choice) ----------
  $$(".tabs").forEach(t => {
    const tabs = $$('[role="tab"]', t);
    const key = t.dataset.remember ? "ltc-java:tab:" + t.dataset.remember : null;
    const show = id => {
      tabs.forEach(b => {
        const on = b.dataset.tab === id;
        b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
        const p = $("#" + b.getAttribute("aria-controls"), t); if (p) p.hidden = !on;
      });
      if (key) store.set(key, id);
    };
    tabs.forEach((b, i) => {
      b.addEventListener("click", () => show(b.dataset.tab));
      b.addEventListener("keydown", e => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); show(n.dataset.tab);
      });
    });
    let initial = key && store.get(key, null);
    if (!initial && t.dataset.remember === "os") initial = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "mac" : "win";
    show(initial && tabs.some(b => b.dataset.tab === initial) ? initial : tabs[0].dataset.tab);
  });

  // ---------- quick check (true/false or choice) ----------
  $$(".qc li").forEach(li => {
    const fb = document.createElement("div"); fb.className = "fb"; fb.setAttribute("aria-live", "polite");
    li.appendChild(fb);
    $$("button[data-a]", li).forEach(b => b.addEventListener("click", () => {
      const ok = b.dataset.a === li.dataset.correct;
      fb.innerHTML = `<span class="${ok ? "verdict-ok" : "verdict-bad"}">${ok ? "ถูกต้อง" : "ยังไม่ใช่"}</span> ${li.dataset.why || ""}`;
    }));
  });

  // ---------- checklist + progress ----------
  const units = [...new Set($$("[data-checklist]").map(l => l.dataset.checklist))];
  units.forEach(unit => {
    const key = "ltc-java:" + unit + ":checks";
    const saved = store.get(key, {});
    const boxes = $$(`[data-checklist="${unit}"] input[type=checkbox]`);
    const bar = $(`[data-progress="${unit}"] > span`);
    const update = () => {
      const st = {}; boxes.forEach(b => (st[b.id] = b.checked)); store.set(key, st);
      if (bar) bar.style.width = Math.round(100 * boxes.filter(b => b.checked).length / boxes.length) + "%";
    };
    boxes.forEach(b => { b.checked = !!saved[b.id]; b.addEventListener("change", update); });
    update();
  });
  // index page progress
  $$("[data-unit-progress]").forEach(el => {
    const unit = el.dataset.unitProgress, total = +el.dataset.total || 1;
    const st = store.get("ltc-java:" + unit + ":checks", {});
    const done = Object.values(st).filter(Boolean).length;
    const ticket = store.get("ltc-java:" + unit + ":exit", null);
    const pct = Math.round(100 * done / total);
    $("span", $(".progress", el)).style.width = pct + "%";
    $(".meta", el).innerHTML = `<span>เช็กลิสต์ ${done}/${total}</span><span>${ticket ? "Exit Ticket: " + ticket.score + "/" + ticket.total : "ยังไม่ทำ Exit Ticket"}</span>`;
  });

  // ---------- TOC: collapsed on small screens ----------
  if (matchMedia("(max-width: 860px)").matches) $$(".toc details").forEach(d => d.removeAttribute("open"));

  // ---------- TOC highlight ----------
  const tocLinks = $$(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map(tocLinks.map(a => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { tocLinks.forEach(a => a.classList.remove("active")); const a = map.get(e.target.id); if (a) a.classList.add("active"); }
    }), { rootMargin: "-10% 0px -80% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  // ---------- Unit 1: JDK/JRE/JVM layers ----------
  const layerInfo = {
    jdk: "<strong>JDK (Java Development Kit)</strong> ชุดสำหรับนักพัฒนา มีคอมไพเลอร์ <code>javac</code> ดีบักเกอร์ และทุกอย่างที่ JRE มี ตั้งแต่ Java 11 เราติดตั้ง JDK ตัวเดียวพอ",
    jre: "<strong>JRE (Java Runtime Environment)</strong> สิ่งที่ต้องมีเพื่อรันโปรแกรม คือไลบรารีมาตรฐานกับ JVM เปรียบเหมือนเครื่องเล่นเกมพร้อมสายไฟ",
    jvm: "<strong>JVM (Java Virtual Machine)</strong> เครื่องจำลองที่อ่าน bytecode (.class) แล้วแปลเป็นภาษาเครื่องของ Windows หรือ macOS ทำให้ไฟล์เดียวรันได้ทุกระบบ"
  };
  const layerOut = $("#layer-out");
  $$(".layer").forEach(b => {
    const pick = e => {
      e.stopPropagation();
      $$(".layer").forEach(x => x.setAttribute("aria-pressed", x === b));
      if (layerOut) layerOut.innerHTML = layerInfo[b.dataset.layer];
    };
    b.addEventListener("click", pick);
    b.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e); } });
  });

  // ---------- Unit 1: compile flow stepper ----------
  const flow = $("#flow-lab");
  if (flow) {
    const steps = [
      { on: 0, text: "เขียนโค้ดแล้วบันทึกเป็น <code>Hello.java</code> ชื่อไฟล์ต้องตรงกับชื่อคลาส", term: "(ยังไม่มีอะไรรัน)" },
      { on: 1, text: "<code>javac</code> ตรวจไวยากรณ์และแปลงเป็น bytecode ได้ไฟล์ <code>Hello.class</code>", term: "$ javac Hello.java\n(ไม่มีข้อความ = คอมไพล์ผ่าน)" },
      { on: 2, text: "<code>java</code> สั่ง JVM โหลด Hello.class แล้วรัน ไฟล์ .class นี้ยกไปรันบน Mac หรือ Windows ได้เลย", term: "$ java Hello\nHello World\nสวัสดี วิทยาลัยเทคนิคเลย" }
    ];
    let i = 0;
    const stages = $$(".stage", flow), txt = $("#flow-text"), term = $("#flow-term");
    const render = () => {
      stages.forEach((s, k) => s.classList.toggle("on", k <= steps[i].on));
      txt.innerHTML = steps[i].text; term.textContent = steps[i].term;
      $("#flow-prev").disabled = i === 0; $("#flow-next").disabled = i === steps.length - 1;
    };
    $("#flow-next").addEventListener("click", () => { if (i < steps.length - 1) { i++; render(); } });
    $("#flow-prev").addEventListener("click", () => { if (i > 0) { i--; render(); } });
    render();
  }

  // ---------- Unit 2: identifier checker ----------
  const KEYWORDS = new Set(("abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while").split(" "));
  const LITERALS = new Set(["true", "false", "null"]);
  const idIn = $("#id-input");
  if (idIn) {
    const out = $("#id-out");
    const check = () => {
      const s = idIn.value;
      if (!s) { out.innerHTML = "พิมพ์ชื่อตัวแปรเพื่อทดสอบ"; return; }
      let bad = null;
      if (/\s/.test(s)) bad = "มีช่องว่าง ห้ามมีช่องว่างในชื่อ";
      else if (/^[0-9]/.test(s)) bad = "ขึ้นต้นด้วยตัวเลขไม่ได้";
      else if (s === "_") bad = "ตั้งแต่ Java 9 ห้ามใช้ _ ตัวเดียวเป็นชื่อ";
      else if (KEYWORDS.has(s)) bad = `<code>${s}</code> เป็นคีย์เวิร์ดของ Java`;
      else if (LITERALS.has(s)) bad = `<code>${s}</code> เป็นค่าคงที่ของภาษา ใช้เป็นชื่อไม่ได้`;
      else if (!/^[\p{L}_$][\p{L}\p{N}\p{M}_$]*$/u.test(s)) bad = "มีเครื่องหมายที่ไม่อนุญาต ใช้ได้แค่ตัวอักษร ตัวเลข _ และ $";
      if (bad) { out.innerHTML = `<span class="verdict-bad">ผิดกฎ</span> ${bad}`; return; }
      let hint = "";
      if (/[^\x00-\x7F]/.test(s)) hint = "ถูกกฎ แต่ไม่ควรใช้ภาษาไทยในชื่อ เพื่อนในทีมพิมพ์ยากและบางเครื่องมือมีปัญหา";
      else if (s.includes("$")) hint = "ถูกกฎ แต่ <code>$</code> สงวนไว้ให้โค้ดที่เครื่องมือสร้าง ไม่ควรใช้เอง";
      else if (/^[A-Z][A-Z0-9_]*$/.test(s) && s.length > 1) hint = "รูปแบบ UPPER_SNAKE_CASE เหมาะกับค่าคงที่ (final)";
      else if (/^[A-Z]/.test(s)) hint = "รูปแบบ PascalCase เหมาะกับชื่อคลาส ถ้าเป็นตัวแปรควรขึ้นต้นตัวเล็ก";
      else if (s.startsWith("_")) hint = "ถูกกฎ แต่ใน Java ไม่นิยมขึ้นต้นด้วย _";
      else if (s.includes("_")) hint = "ถูกกฎ แต่ตัวแปรใน Java นิยม camelCase เช่น <code>totalScore</code>";
      else hint = "รูปแบบ camelCase เหมาะกับตัวแปรและเมธอด";
      out.innerHTML = `<span class="verdict-ok">ถูกกฎ</span> ${hint}`;
    };
    idIn.addEventListener("input", check);
    $$("[data-try-id]").forEach(b => b.addEventListener("click", () => { idIn.value = b.dataset.tryId; check(); idIn.focus(); }));
    check();
  }

  // ---------- Unit 2: division lab (Java semantics) ----------
  const divA = $("#div-a");
  if (divA) {
    const divB = $("#div-b"), divT = $("#div-type"), out = $("#div-out");
    const fmt = n => Number.isFinite(n) ? (Number.isInteger(n) ? n.toFixed(1) : String(+n.toPrecision(15))) : (Number.isNaN(n) ? "NaN" : (n > 0 ? "Infinity" : "-Infinity"));
    const run = () => {
      const a = Number(divA.value), b = Number(divB.value), t = divT.value;
      if (divA.value === "" || divB.value === "" || !Number.isFinite(a) || !Number.isFinite(b)) { out.textContent = "ใส่ตัวเลขทั้งสองช่อง"; return; }
      if (t === "int") {
        const ai = Math.trunc(a), bi = Math.trunc(b);
        if (bi === 0) { out.innerHTML = `${ai} / ${bi} → <span class="verdict-bad">ArithmeticException: / by zero</span> (หาร int ด้วย 0 โปรแกรมพัง)`; return; }
        out.innerHTML = `int: ${ai} / ${bi} = <strong>${Math.trunc(ai / bi)}</strong> &nbsp; ${ai} % ${bi} = <strong>${ai % bi}</strong><br><small>หาร int ตัดเศษทิ้งเสมอ และเครื่องหมายของ % ตามตัวตั้ง</small>`;
      } else {
        out.innerHTML = `double: ${fmt(a)} / ${fmt(b)} = <strong>${fmt(a / b)}</strong> &nbsp; ${fmt(a)} % ${fmt(b)} = <strong>${fmt(a % b)}</strong>` + (b === 0 ? "<br><small>double หารด้วย 0 ไม่พัง แต่ได้ Infinity หรือ NaN</small>" : "");
      }
    };
    [divA, divB, divT].forEach(el => el.addEventListener("input", run));
    run();
  }

  // ---------- Unit 2: prefix / postfix stepper ----------
  const ppOut = $("#pp-out");
  if (ppOut) {
    let a = 5; const log = [];
    const show = () => { ppOut.innerHTML = `a = <strong>${a}</strong>` + (log.length ? "<br>" + log.slice(-4).join("<br>") : ""); };
    $("#pp-post").addEventListener("click", () => { const b = a++; log.push(`int b = a++; → b = ${b}, a = ${a} (ใช้ค่าเดิมก่อน แล้วค่อยเพิ่ม)`); show(); });
    $("#pp-pre").addEventListener("click", () => { const b = ++a; log.push(`int b = ++a; → b = ${b}, a = ${a} (เพิ่มก่อน แล้วค่อยใช้)`); show(); });
    $("#pp-reset").addEventListener("click", () => { a = 5; log.length = 0; show(); });
    show();
  }

  // ---------- Unit 2: widening checker ----------
  const wFrom = $("#w-from");
  if (wFrom) {
    const wTo = $("#w-to"), out = $("#w-out");
    const widen = {
      byte: ["short", "int", "long", "float", "double"], short: ["int", "long", "float", "double"],
      char: ["int", "long", "float", "double"], int: ["long", "float", "double"],
      long: ["float", "double"], float: ["double"], double: [], boolean: []
    };
    const lossy = { int: ["float"], long: ["float", "double"] };
    const run = () => {
      const f = wFrom.value, t = wTo.value;
      if (f === t) { out.textContent = "ชนิดเดียวกัน ไม่ต้องแปลง"; return; }
      if (f === "boolean" || t === "boolean") { out.innerHTML = `<span class="verdict-bad">แปลงไม่ได้</span> boolean แปลงไปหรือมาจากตัวเลขไม่ได้เลย แม้จะ cast`; return; }
      if (widen[f].includes(t)) {
        const warn = (lossy[f] || []).includes(t) ? "<br><small>แปลงอัตโนมัติได้ แต่ค่าที่ใหญ่มากอาจเสียความแม่นยำ</small>" : "";
        out.innerHTML = `<span class="verdict-ok">แปลงอัตโนมัติ (widening)</span> <code>${t} y = x;</code> ใช้ได้เลย${warn}`; return;
      }
      out.innerHTML = `<span class="verdict-bad">ต้อง cast เอง (narrowing)</span> <code>${t} y = (${t}) x;</code> อาจเสียข้อมูล เช่นเศษทศนิยมหรือค่าที่เกินช่วง`;
    };
    [wFrom, wTo].forEach(el => el.addEventListener("change", run));
    run();
  }


  // ---------- Unit 3: branch tracer ----------
  const traceIn = $("#trace-score");
  if (traceIn) {
    const esc = t => t.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    const progs = {
      "if": s => {
        const L = ['if (score >= 50) {', '    show("ผ่าน");', '}', 'show("จบโปรแกรม");'];
        const c = s >= 50;
        return { L, checked: [0], run: c ? [1, 3] : [3], out: (c ? "ผ่าน → " : "") + "จบโปรแกรม" };
      },
      "ifelse": s => {
        const L = ['if (score >= 50) {', '    show("ผ่าน");', '} else {', '    show("ไม่ผ่าน");', '}'];
        const c = s >= 50;
        return { L, checked: [0], run: c ? [1] : [3], out: c ? "ผ่าน" : "ไม่ผ่าน" };
      },
      "ladder": s => {
        const L = ['if (score >= 80) {', '    grade = "A";', '} else if (score >= 70) {', '    grade = "B";',
          '} else if (score >= 60) {', '    grade = "C";', '} else if (score >= 50) {', '    grade = "D";', '} else {', '    grade = "F";', '}'];
        const tests = [[80, "A", 0, 1], [70, "B", 2, 3], [60, "C", 4, 5], [50, "D", 6, 7]];
        const checked = [];
        for (const [min, g, cl, rl] of tests) { checked.push(cl); if (s >= min) return { L, checked, run: [rl], out: "grade = " + g }; }
        return { L, checked: checked.concat([8]), run: [9], out: "grade = F" };
      }
    };
    const render = () => {
      const s = Number(traceIn.value);
      $$("[data-trace]").forEach(box => {
        const r = progs[box.dataset.trace](s);
        $("pre", box).innerHTML = r.L.map((l, i) =>
          `<span class="tline${r.run.includes(i) ? " run" : r.checked.includes(i) ? " checked" : ""}">${esc(l)}</span>`).join("");
        $(".out", box).textContent = traceIn.value === "" ? "ใส่คะแนนก่อน" : "ผลลัพธ์: " + r.out;
      });
    };
    traceIn.addEventListener("input", render);
    $$("[data-score]").forEach(b => b.addEventListener("click", () => { traceIn.value = b.dataset.score; render(); }));
    render();
  }

  // ---------- Unit 3: switch fall-through tracer ----------
  const swIn = $("#sw-level");
  if (swIn) {
    const brk = $("#sw-break"), pre = $("#sw-code"), out = $("#sw-out");
    const cases = [["1", "ง่าย"], ["2", "ปานกลาง"], ["3", "ยาก"], ["default", "ไม่มีระดับนี้"]];
    const render = () => {
      const v = swIn.value, withBreak = brk.checked;
      let start = cases.findIndex(c => c[0] === v);
      if (start < 0) start = cases.length - 1;
      const lines = ["switch (level) {"], run = [], said = [];
      let stopped = false;
      cases.forEach(([lab, msg], i) => {
        const head = lab === "default" ? "    default:" : `    case ${lab}:`;
        lines.push(head);
        const active = !stopped && i >= start;
        lines.push(`        show("${msg}");`);
        if (active) { run.push(lines.length - 1); said.push(msg); }
        if (withBreak && lab !== "default") {
          lines.push("        break;");
          if (active) { run.push(lines.length - 1); stopped = true; }
        }
      });
      lines.push("}");
      pre.innerHTML = lines.map((l, i) => `<span class="tline${run.includes(i) ? " run" : ""}">${l}</span>`).join("");
      out.innerHTML = "ผลลัพธ์: " + said.join(" → ") + (!withBreak && said.length > 1 ? ` <span class="verdict-bad">ตกทะลุ (fall-through) ไป ${said.length - 1} case</span>` : "");
    };
    swIn.addEventListener("change", render); brk.addEventListener("change", render);
    render();
  }

  // ---------- Unit 3: guessing game demo ----------
  const game = $("#game-demo");
  if (game) {
    const inp = $("#g-in"), btn = $("#g-btn"), again = $("#g-new"), msg = $("#g-msg"), dots = $$(".tries i", game);
    let answer, left, over;
    const draw = () => dots.forEach((d, i) => d.classList.toggle("used", i >= left));
    const start = () => { answer = Math.floor(Math.random() * 10) + 1; left = 3; over = false; btn.disabled = false; inp.disabled = false; inp.value = ""; msg.textContent = "สุ่มเลข 1–10 ไว้แล้ว ทายได้ 3 ครั้ง"; draw(); };
    const end = t => { over = true; btn.disabled = true; inp.disabled = true; msg.innerHTML = t; };
    const guess = () => {
      if (over) return;
      const raw = inp.value.trim();
      if (!/^-?\d+$/.test(raw)) { msg.textContent = "กรอกตัวเลขจำนวนเต็มก่อน"; return; }
      const g = Number(raw);
      if (g === answer) { end(`<span class="verdict-ok">ถูกต้อง!</span> คำตอบคือ ${answer}`); return; }
      left--; draw();
      if (left === 0) { end(`<span class="verdict-bad">หมดสิทธิ์ทายแล้ว</span> คำตอบคือ ${answer}`); return; }
      msg.textContent = (g > answer ? "ค่าที่ทายมากกว่าคำตอบ" : "ค่าที่ทายน้อยกว่าคำตอบ") + ` เหลืออีก ${left} ครั้ง`;
      inp.select();
    };
    btn.addEventListener("click", guess);
    inp.addEventListener("keydown", e => { if (e.key === "Enter") guess(); });
    again.addEventListener("click", start);
    start();
  }


  // ---------- Unit 4: loop stepper ----------
  const lsType = $("#ls-type");
  if (lsType) {
    const lsStart = $("#ls-start"), body = $("#ls-body"), code = $("#ls-code"), out = $("#ls-out"), next = $("#ls-next");
    let rows = [], shown = 0;
    const codes = {
      "while": s => `int i = ${s};\nwhile (i <= 5) {\n    System.out.print(i + " ");\n    i++;\n}`,
      "do": s => `int i = ${s};\ndo {\n    System.out.print(i + " ");\n    i++;\n} while (i <= 5);`,
      "for": s => `for (int i = ${s}; i <= 5; i++) {\n    System.out.print(i + " ");\n}`
    };
    const build = () => {
      const t = lsType.value, s = Number(lsStart.value);
      rows = []; let i = s, printed = [];
      if (t === "do") {
        do { printed.push(i); rows.push([i, "—", "พิมพ์ " + i + " แล้ว i++", printed.join(" ")]); i++; rows.push([i, `${i} <= 5 → ${i <= 5}`, i <= 5 ? "วนต่อ" : "ออกจาก loop", printed.join(" ")]); } while (i <= 5);
      } else {
        while (true) {
          const c = i <= 5;
          rows.push([i, `${i} <= 5 → ${c}`, c ? "เข้า loop" : "ออกจาก loop", printed.join(" ")]);
          if (!c) break;
          printed.push(i); rows.push([i, "—", "พิมพ์ " + i + " แล้ว i++", printed.join(" ")]); i++;
        }
      }
      shown = 0; body.innerHTML = ""; code.textContent = codes[t](s);
      out.textContent = "กดถัดไปเพื่อเดินทีละขั้น"; next.disabled = false;
    };
    const step = () => {
      if (shown >= rows.length) return;
      const r = rows[shown++], tr = document.createElement("tr"); tr.className = "new";
      tr.innerHTML = r.map(x => `<td>${x === "" ? "(ว่าง)" : x}</td>`).join("");
      body.appendChild(tr);
      if (shown === rows.length) { next.disabled = true; const last = rows[rows.length - 1][3]; out.textContent = "จบ ผลลัพธ์: " + (last || "(ไม่มีอะไรพิมพ์ออกมาเลย)"); }
    };
    next.addEventListener("click", step);
    $("#ls-all").addEventListener("click", () => { while (shown < rows.length) step(); });
    [lsType, lsStart].forEach(el => el.addEventListener("change", build));
    build();
  }

  // ---------- Unit 4: off-by-one lab ----------
  const obStart = $("#ob-start");
  if (obStart) {
    const op = $("#ob-op"), end = $("#ob-end"), code = $("#ob-code"), out = $("#ob-out");
    const run = () => {
      const s = Number(obStart.value), e = Number(end.value), o = op.value;
      code.textContent = `for (int i = ${s}; i ${o} ${end.value === "" ? "?" : e}; i++)`;
      if (end.value === "" || !Number.isInteger(e) || e > 200 || e < -50) { out.textContent = "ใส่ค่าสิ้นสุดเป็นจำนวนเต็ม -50 ถึง 200"; return; }
      const vals = []; for (let i = s; o === "<" ? i < e : i <= e; i++) vals.push(i);
      out.innerHTML = `วน <strong>${vals.length}</strong> รอบ` + (vals.length ? `: i = ${vals.length > 12 ? vals.slice(0, 5).join(", ") + ", …, " + vals.slice(-2).join(", ") : vals.join(", ")}` : " (ไม่เข้า loop เลย)");
    };
    [obStart, op, end].forEach(el => el.addEventListener("input", run));
    run();
  }

  // ---------- Unit 4: triangle preview ----------
  const triRows = $("#tri-rows");
  if (triRows) {
    const out = $("#tri-out"), lab = $("#tri-n");
    const draw = () => {
      const n = Number(triRows.value), up = $("input[name=tri-dir]:checked").value === "up";
      lab.textContent = n; let s = "";
      for (let i = 1; i <= n; i++) { const k = up ? i : n - i + 1; s += "* ".repeat(k).trimEnd() + "\n"; }
      out.textContent = s;
    };
    triRows.addEventListener("input", draw);
    $$("input[name=tri-dir]").forEach(r => r.addEventListener("change", draw));
    draw();
  }

  // ---------- Unit 4: even/odd finder demo ----------
  const eoBtn = $("#eo-find");
  if (eoBtn) {
    const lo = $("#eo-lo"), hi = $("#eo-hi"), out = $("#eo-out");
    const warn = t => { out.innerHTML = `<span class="verdict-bad">แจ้งเตือน:</span> ${t}`; };
    eoBtn.addEventListener("click", () => {
      const a = lo.value.trim(), b = hi.value.trim();
      if (!a || !b) return warn("กรอกขอบเขตล่างและขอบเขตบนให้ครบ");
      if (!/^-?\d+$/.test(a) || !/^-?\d+$/.test(b)) return warn("ขอบเขตต้องเป็นจำนวนเต็ม");
      const x = Number(a), y = Number(b);
      if (y < x) return warn("ขอบเขตบนต้องไม่น้อยกว่าขอบเขตล่าง");
      if (y - x > 2000) return warn("ช่วงกว้างเกินไปสำหรับตัวอย่างนี้ (ไม่เกิน 2000)");
      const pick = $("input[name=eo-type]:checked");
      if (!pick) return warn("เลือกเลขคู่หรือเลขคี่ก่อน");
      const even = pick.value === "even", res = [];
      for (let n = x; n <= y; n++) { if ((n % 2 === 0) === even) res.push(n); }
      out.textContent = res.length ? res.join(" ") : "(ไม่มีตัวเลขที่ตรงเงื่อนไขในช่วงนี้)";
    });
    $("#eo-clear").addEventListener("click", () => {
      lo.value = ""; hi.value = ""; out.textContent = "";
      $$("input[name=eo-type]").forEach(r => (r.checked = false));
    });
  }

  // ---------- Exit ticket ----------
  $$("form[data-exit]").forEach(form => {
    const unit = form.dataset.exit, result = $(".exit-result", form), err = $(".form-error", form);
    form.addEventListener("submit", e => {
      e.preventDefault();
      err.textContent = "";
      const name = form.elements.name.value.trim(), sid = form.elements.sid.value.trim(), room = form.elements.room.value.trim();
      const qs = $$("fieldset[data-correct]", form);
      const missing = qs.filter(fs => !$("input:checked", fs));
      if (!name || !sid) { err.textContent = "ใส่ชื่อและรหัสนักศึกษาก่อนส่ง"; return; }
      if (missing.length) { err.textContent = `ยังไม่ได้ตอบ ${missing.length} ข้อ`; missing[0].scrollIntoView({ block: "center" }); return; }
      const fist = $("input[name=fist]:checked", form);
      if (!fist) { err.textContent = "เลือกระดับความมั่นใจ 1–5 ก่อนส่ง"; return; }

      let score = 0; const lines = [];
      qs.forEach((fs, i) => {
        const picked = $("input:checked", fs), ok = picked.value === fs.dataset.correct;
        if (ok) score++;
        $$(".opt", fs).forEach(o => o.classList.remove("correct", "wrong"));
        $(`input[value="${fs.dataset.correct}"]`, fs).closest(".opt").classList.add("correct");
        if (!ok) picked.closest(".opt").classList.add("wrong");
        let ex = $(".explain", fs);
        if (!ex) { ex = document.createElement("p"); ex.className = "explain"; fs.appendChild(ex); }
        ex.textContent = fs.dataset.explain || "";
        lines.push(`ข้อ ${i + 1}: ${picked.value.toUpperCase()} ${ok ? "ถูก" : "ผิด"}`);
      });
      const muddy = form.elements.muddy.value.trim() || "-";
      const learned = form.elements.learned.value.trim() || "-";
      const summary = [
        `Exit Ticket ${form.dataset.title || unit}`,
        `ชื่อ: ${name}  รหัส: ${sid}  ห้อง: ${room || "-"}`,
        `คะแนน: ${score}/${qs.length}`, ...lines,
        `สิ่งที่ได้เรียนรู้: ${learned}`, `สิ่งที่ยังสงสัย: ${muddy}`,
        `ความมั่นใจ: ${fist.value}/5`, `ส่งเมื่อ: ${new Date().toLocaleString("th-TH")}`
      ].join("\n");
      store.set("ltc-java:" + unit + ":exit", { score, total: qs.length });

      const formUrl = form.dataset.formUrl;
      result.hidden = false;
      result.innerHTML = `<div class="score">${score}/${qs.length}</div>
        <p>${score === qs.length ? "ครบทุกข้อ พร้อมไปหน่วยถัดไป" : "ดูเฉลยสีเขียวด้านบน แล้วกลับไปอ่านหัวข้อที่พลาดอีกรอบ"}</p>
        <div class="code"><pre>${summary.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</pre></div>
        <div class="row"><button type="button" class="btn" data-copy-summary>คัดลอกผลส่งครู</button>
        ${formUrl ? `<a class="btn ghost" href="${formUrl}" target="_blank" rel="noopener">เปิดฟอร์มส่งงาน</a>` : ""}</div>`;
      $("[data-copy-summary]", result).addEventListener("click", async ev => {
        try { await navigator.clipboard.writeText(summary); ev.target.textContent = "คัดลอกแล้ว"; }
        catch (x) { ev.target.textContent = "คัดลอกจากกล่องด้านบนแทน"; }
      });
      result.scrollIntoView({ block: "nearest" });
    });
  });
})();
