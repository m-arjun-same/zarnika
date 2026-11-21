/* ZARNIKA — UPGRADE: "Zari System" (additive only)
   Reuses the existing #zariThread SVG built by landing-page.js:
   - knots: one knot per section, placed on the thread's own path,
     lighting as its section comes into view
   - halo: a ring that follows the existing #zariDot
   - progress: the thread pulled across the top of the viewport
   - shimmer: .zari-lit sweep on silk imagery (CSS does the sweep)
   - drape-wave: staggered fold-settle on list/card inner items
   Vanilla JS, no new dependencies. Transform/opacity only. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- thread progress bar ---------- */
  var bar = null;
  if (!reduced) {
    bar = document.createElement("div");
    bar.id = "zariProgress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var ticking = false;
    function paintBar() {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = "scaleX(" + p + ")";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paintBar); }
    }, { passive: true });
    paintBar();
  }

  /* ---------- shimmer + drape-wave (IntersectionObserver) ---------- */
  var media = document.querySelectorAll(".chapter-media, .story-media");
  if ("IntersectionObserver" in window && !reduced) {
    var sheenIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.remove("zari-lit");
          void en.target.offsetWidth; /* restart the sweep */
          en.target.classList.add("zari-lit");
        } else {
          en.target.classList.remove("zari-lit");
        }
      });
    }, { threshold: 0.35 });
    media.forEach(function (m) { sheenIO.observe(m); });

    var waveGroups = [
      { box: ".chapter-panel", items: ".chapter-list li" },
      { box: ".why-card", items: "h3, blockquote" },
      { box: ".review-card", items: "blockquote, figcaption" },
      { box: ".story-stats", items: ".stat" }
    ];
    var waveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("zari-waved"); waveIO.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    waveGroups.forEach(function (g) {
      document.querySelectorAll(g.box).forEach(function (box) {
        var items = box.querySelectorAll(g.items);
        if (!items.length) return;
        items.forEach(function (it, i) {
          it.classList.add("zari-wave-item");
          it.style.transitionDelay = (i * 90) + "ms";
        });
        waveIO.observe(box);
      });
    });
  } else {
    media.forEach(function (m) { m.classList.add("zari-lit"); });
  }

  /* ---------- knots + halo on the existing thread ---------- */
  var svg = document.getElementById("zariThread");
  var path = document.getElementById("zariPath");
  var dot = document.getElementById("zariDot");
  var content = document.getElementById("smooth-content");
  if (!svg || !path || !content) return;

  var NS = "http://www.w3.org/2000/svg";
  var knotGroup = document.createElementNS(NS, "g");
  knotGroup.setAttribute("id", "zariKnots");
  svg.appendChild(knotGroup);

  var halo = null;
  if (dot && !reduced) {
    halo = document.createElementNS(NS, "circle");
    halo.setAttribute("id", "zariHalo");
    halo.setAttribute("r", "11");
    svg.insertBefore(halo, dot);
    new MutationObserver(function () {
      halo.setAttribute("cx", dot.getAttribute("cx") || 0);
      halo.setAttribute("cy", dot.getAttribute("cy") || 0);
    }).observe(dot, { attributes: true, attributeFilter: ["cx", "cy"] });
  }

  var SECTIONS = ["collections", "story", "why", "reviews", "visit"];
  var knotById = {};
  var builtH = 0;

  function buildKnots() {
    var H = content.scrollHeight;
    if (H < 10 || Math.abs(H - builtH) < 4 && knotGroup.childNodes.length) return;
    var len;
    try { len = path.getTotalLength(); } catch (e) { return; }
    if (!len) return;
    builtH = H;
    knotGroup.textContent = "";
    knotById = {};
    var cTop = content.getBoundingClientRect().top;
    SECTIONS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var y = el.getBoundingClientRect().top - cTop + 26;
      var pt = path.getPointAtLength(Math.min(len, Math.max(0, (y / H) * len)));
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "zari-knot-g");
      var ring = document.createElementNS(NS, "circle");
      ring.setAttribute("class", "zari-knot-ring");
      ring.setAttribute("cx", pt.x); ring.setAttribute("cy", pt.y); ring.setAttribute("r", "10");
      var k = document.createElementNS(NS, "circle");
      k.setAttribute("class", "zari-knot-dot");
      k.setAttribute("cx", pt.x); k.setAttribute("cy", pt.y); k.setAttribute("r", "5.5");
      g.appendChild(ring); g.appendChild(k);
      knotGroup.appendChild(g);
      knotById[id] = g;
    });
  }
  buildKnots();
  window.addEventListener("load", buildKnots);
  setTimeout(buildKnots, 1200);
  var rzT;
  window.addEventListener("resize", function () { clearTimeout(rzT); rzT = setTimeout(buildKnots, 200); });
  if (window.ScrollTrigger) ScrollTrigger.addEventListener("refresh", function () { setTimeout(buildKnots, 150); });

  if ("IntersectionObserver" in window) {
    var knotIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var g = knotById[en.target.id];
        if (g) g.classList.toggle("is-lit", reduced ? true : en.isIntersecting);
      });
    }, { threshold: 0.15 });
    SECTIONS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) knotIO.observe(el);
    });
  }
})();
