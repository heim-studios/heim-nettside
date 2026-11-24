(function () {
  const C = window.HEIM || {};

  // Sett inn config-verdier i siden
  document.querySelectorAll("[data-discord]").forEach((a) => (a.href = C.discord || "#"));
  document.querySelectorAll("[data-koble]").forEach((el) => {
    el.textContent = C.koble || "";
    el.addEventListener("click", () => {
      if (navigator.clipboard) navigator.clipboard.writeText(C.koble || "").catch(() => {});
      el.dataset.old = el.dataset.old || el.textContent;
      el.textContent = "Kopiert!";
      setTimeout(() => (el.textContent = el.dataset.old), 1400);
    });
  });
  document.querySelectorAll("[data-maks]").forEach((el) => (el.textContent = C.maksSpillere || 48));

  // Mobilmeny
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".menu");
  if (burger && menu) {
    burger.addEventListener("click", () => menu.classList.toggle("open"));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));
  }

  // Live serverstatus (skjules stille hvis nettleseren/serveren ikke svarer)
  const dot = document.querySelector("[data-dot]");
  const label = document.querySelector("[data-status]");
  const online = document.querySelector("[data-online]");
  if (C.statusTekst) {
    if (label) label.textContent = C.statusTekst;
    if (dot) dot.className = "dot dev";
  }
  if (C.statusUrl === "") {
    if (label && !C.statusTekst) label.textContent = "Serverstatus";
    return;
  }

  async function hent() {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 5000);
      const r = await fetch(C.statusUrl || "status.php", { signal: ctl.signal, cache: "no-store" });
      clearTimeout(t);
      const s = await r.json();
      if (!s.online) throw new Error("offline");
      if (!C.statusTekst) { if (dot) dot.className = "dot on"; if (label) label.textContent = "Serveren er åpen"; }
      if (online) online.textContent = s.players;
    } catch (e) {
      if (!C.statusTekst) { if (dot) dot.className = "dot off"; if (label) label.textContent = "Serveren er stengt eller utilgjengelig"; }
      if (online) online.textContent = "–";
    }
  }  hent();
  setInterval(hent, 30000);
})();

// ===== Effekter (ingen eksterne bibliotek) =====
(function () {
  document.documentElement.classList.add("js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Avsloering ved scrolling
  const els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  } else els.forEach((el) => el.classList.add("in"));

  // Flytende CTA etter hero
  const sticky = document.querySelector(".sticky-cta");
  if (sticky) window.addEventListener("scroll", () => sticky.classList.toggle("on", window.scrollY > 700), { passive: true });

  // Hero: bevegelige linjer og partikler
  const cv = document.getElementById("fx");
  if (!cv || reduce) return;
  const ctx = cv.getContext("2d");
  let W, H, pts = [];
  function size() {
    W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight;
    pts = Array.from({ length: Math.min(70, Math.floor(W / 22)) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 }));
  }
  size(); window.addEventListener("resize", size);
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = "rgba(77,154,255,0.65)"; ctx.fillRect(p.x, p.y, 2, 2);
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dist = Math.hypot(dx, dy);
      if (dist < 130) { ctx.strokeStyle = "rgba(0, 184, 79," + (0.5 * (1 - dist / 130)) + ")"; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
    }
    requestAnimationFrame(frame);
  }
  frame();
})();