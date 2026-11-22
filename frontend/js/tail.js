/* ZARNIKA — NEW TAIL motion. Reuses GSAP + ScrollTrigger + ScrollSmoother
   already loaded by landing-page.js. Transform/opacity/clip only. */
(function () {
  "use strict";
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  /* ---------- counters ---------- */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: function () {
        gsap.to(obj, { v: end, duration: 1.6, ease: "power2.out", onUpdate: function () {
          el.textContent = dec ? obj.v.toFixed(dec) : Math.round(obj.v).toLocaleString("en-IN");
        }});
      }
    });
  });

  /* ---------- journey: pinned horizontal unfolding ---------- */
  var track = document.querySelector(".journey-track");
  var journey = document.querySelector(".journey");
  if (track && journey) {
    var getDist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 40); };
    gsap.to(track, { x: function () { return -getDist(); }, ease: "none",
      scrollTrigger: {
        trigger: journey, start: "top top", end: function () { return "+=" + getDist(); },
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var bar = document.querySelector(".journey-progress span");
          if (bar) bar.style.transform = "scaleX(" + self.progress + ")";
        }
      }});
    var jimg = track.querySelector(".journey-panel-img img");
    if (jimg) gsap.fromTo(jimg, { scale: 1.15 }, { scale: 1, ease: "none",
      scrollTrigger: { trigger: journey, start: "top bottom", end: "top top", scrub: true } });
  }

  /* ---------- ritual: line draws with scroll, steps slide in alternately ---------- */
  var rline = document.querySelector(".ritual-line span");
  if (rline) gsap.to(rline, { scaleY: 1, ease: "none",
    scrollTrigger: { trigger: ".ritual-steps", start: "top 75%", end: "bottom 60%", scrub: true } });
  gsap.utils.toArray(".ritual-step").forEach(function (step, i) {
    gsap.fromTo(step, { x: i % 2 ? 70 : -70, opacity: 0, rotate: i % 2 ? 1.2 : -1.2 },
      { x: 0, opacity: 1, rotate: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: step, start: "top 86%", once: true } });
    var num = step.querySelector(".ritual-step-num");
    if (num) gsap.fromTo(num, { yPercent: 30 }, { yPercent: -30, ease: "none",
      scrollTrigger: { trigger: step, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- chosen: rows reveal + copper line grows ---------- */
  gsap.utils.toArray(".chosen-row").forEach(function (row, i) {
    gsap.fromTo(row, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: "power3.out", delay: i * 0.05,
      scrollTrigger: { trigger: row, start: "top 88%", once: true } });
  });
  var cline = document.querySelector(".chosen-line span");
  if (cline) gsap.to(cline, { scaleX: 1, ease: "none",
    scrollTrigger: { trigger: ".chosen", start: "top 70%", end: "bottom 80%", scrub: true } });

  /* ---------- guest book: cards flip in, then marquee runs (CSS) ---------- */
  gsap.utils.toArray(".guest-row").forEach(function (row, i) {
    gsap.fromTo(row, { opacity: 0, rotateX: 28, y: 50, transformPerspective: 900 },
      { opacity: 1, rotateX: 0, y: 0, duration: 1.1, ease: "power3.out", delay: i * 0.15,
        scrollTrigger: { trigger: row, start: "top 88%", once: true } });
  });

  /* ---------- visit: curtains part, content settles ---------- */
  var visit = document.querySelector(".curtain-visit");
  if (visit) {
    var tl = gsap.timeline({ scrollTrigger: { trigger: visit, start: "top 72%", once: true } });
    tl.to(".curtain-left", { scaleX: 0, duration: 1.15, ease: "power4.inOut" }, 0)
      .to(".curtain-right", { scaleX: 0, duration: 1.15, ease: "power4.inOut" }, 0)
      .fromTo(".curtain-inner", { scale: .96, opacity: .35 }, { scale: 1, opacity: 1, duration: 1, ease: "power3.out" }, 0.25)
      .set(".curtain-panel", { display: "none" });
  }

  /* ---------- footer: giant letters rise one by one ---------- */
  var mark = document.querySelector(".foot-mark");
  if (mark) {
    mark.innerHTML = mark.textContent.trim().split("").map(function (ch) {
      return '<span class="foot-letter">' + ch + "</span>";
    }).join("");
    gsap.fromTo(".foot-letter", { yPercent: 112 }, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.07,
      scrollTrigger: { trigger: mark, start: "top 88%", once: true } });
    gsap.fromTo(".foot-row, .foot-small", { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: "power3.out", stagger: .12,
      scrollTrigger: { trigger: ".foot-row", start: "top 92%", once: true } });
  }
})();
