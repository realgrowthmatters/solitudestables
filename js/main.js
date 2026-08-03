/* ============================================================
   Solitude Stables — main.js
   Accessible, progressive interactivity. No dependencies.
   ============================================================ */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".nav-menu");
  var backdrop = document.querySelector(".nav-backdrop");

  function closeNav() {
    if (!menu) return;
    menu.classList.remove("open");
    if (backdrop) backdrop.classList.remove("show");
    document.body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  function openNav() {
    if (!menu) return;
    menu.classList.add("open");
    if (backdrop) backdrop.classList.add("show");
    document.body.classList.add("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.contains("open") ? closeNav() : openNav();
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeNav);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- Dropdown submenus (click on mobile, hover on desktop) ---------- */
  document.querySelectorAll(".has-submenu > .nav-link").forEach(function (link) {
    var parent = link.parentElement;
    var submenu = parent.querySelector(".submenu");
    if (!submenu) return;
    link.addEventListener("click", function (e) {
      if (window.innerWidth < 980) {
        e.preventDefault();
        var open = submenu.classList.toggle("open");
        link.setAttribute("aria-expanded", open ? "true" : "false");
      }
    });
  });

  /* ---------- FAQ accordions ---------- */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var panel = item.querySelector(".faq-a");
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      item.classList.toggle("open", !expanded);
      panel.style.maxHeight = expanded ? null : panel.scrollHeight + 40 + "px";
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = (el.dataset.count.split(".")[1] || "").length;
    var suffix = el.dataset.suffix || "";
    var prefix = el.dataset.prefix || "";
    if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
    var start = performance.now(), dur = 1500;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = (el.dataset.prefix || "") + el.dataset.count + (el.dataset.suffix || "");
    });
  }

  /* ---------- Horse flip cards (tap / keyboard) ---------- */
  document.querySelectorAll(".horse-card").forEach(function (card) {
    function flip() { card.classList.toggle("flipped"); }
    card.addEventListener("click", flip);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });
  });

  /* ---------- Lightbox gallery ---------- */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector(".lightbox-cap");
    var triggers = Array.prototype.slice.call(document.querySelectorAll(".gallery button"));
    var current = 0, lastFocus;

    function showLB(i) {
      current = (i + triggers.length) % triggers.length;
      var img = triggers[current].querySelector("img");
      lbImg.src = img.dataset.full || img.src;
      lbImg.alt = img.alt;
      if (lbCap) lbCap.textContent = img.alt;
    }
    function openLB(i) {
      lastFocus = document.activeElement;
      showLB(i);
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      lightbox.querySelector(".lightbox-close").focus();
    }
    function closeLB() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    triggers.forEach(function (t, i) {
      t.addEventListener("click", function () { openLB(i); });
    });
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLB);
    var lbPrev = lightbox.querySelector(".lightbox-nav.prev");
    var lbNext = lightbox.querySelector(".lightbox-nav.next");
    if (lbPrev) lbPrev.addEventListener("click", function () { showLB(current - 1); });
    if (lbNext) lbNext.addEventListener("click", function () { showLB(current + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLB(); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLB();
      if (e.key === "ArrowLeft" && lbPrev) showLB(current - 1);
      if (e.key === "ArrowRight" && lbNext) showLB(current + 1);
    });
  }

  /* ---------- Lesson finder quiz ---------- */
  var quiz = document.querySelector(".quiz[data-quiz]");
  if (quiz) {
    var steps = Array.prototype.slice.call(quiz.querySelectorAll(".quiz-step"));
    var results = Array.prototype.slice.call(quiz.querySelectorAll(".quiz-result"));
    var bar = quiz.querySelector(".quiz-progress span");
    var stepIdx = 0;
    var score = { lessons: 0, trail: 0, boarding: 0 };

    function showStep(i, doFocus) {
      steps.forEach(function (s, n) { s.classList.toggle("active", n === i); });
      if (bar) bar.style.width = ((i / steps.length) * 100) + "%";
      if (doFocus) {
        var h = quiz.querySelector(".quiz-step.active h3");
        if (h) h.focus();
      }
    }
    function finish() {
      steps.forEach(function (s) { s.classList.remove("active"); });
      if (bar) bar.style.width = "100%";
      var winner = "lessons", best = -1;
      Object.keys(score).forEach(function (k) {
        if (score[k] > best) { best = score[k]; winner = k; }
      });
      results.forEach(function (r) { r.classList.toggle("active", r.dataset.result === winner); });
      var rh = quiz.querySelector(".quiz-result.active h3");
      if (rh) rh.focus();
    }
    quiz.querySelectorAll(".quiz-option").forEach(function (opt) {
      opt.addEventListener("click", function () {
        var pick = opt.dataset.value;
        if (pick && score.hasOwnProperty(pick)) score[pick] += parseInt(opt.dataset.weight || "1", 10);
        stepIdx++;
        if (stepIdx < steps.length) showStep(stepIdx, true);
        else finish();
      });
    });
    var restartBtn = quiz.querySelector("[data-quiz-restart]");
    if (restartBtn) restartBtn.addEventListener("click", function () {
      stepIdx = 0; score = { lessons: 0, trail: 0, boarding: 0 };
      results.forEach(function (r) { r.classList.remove("active"); });
      showStep(0, true);
    });
    showStep(0);
  }

  /* ---------- Booking / contact form ---------- */
  var form = document.querySelector("form[data-booking]");
  if (form) {
    form.addEventListener("submit", function (e) {
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var err = field.parentElement.querySelector(".form-error");
        var valid = field.value.trim() !== "" && field.checkValidity();
        if (!valid) {
          ok = false;
          if (err) err.textContent = err.dataset.msg || "Please complete this field.";
          field.setAttribute("aria-invalid", "true");
        } else {
          if (err) err.textContent = "";
          field.removeAttribute("aria-invalid");
        }
      });
      if (!ok) {
        e.preventDefault();
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }
      /* If no live form endpoint is configured yet, fall back to a
         pre-filled email so no enquiry is ever lost. */
      if (form.dataset.booking === "mailto") {
        e.preventDefault();
        var get = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ""; };
        var body = [
          "Name: " + get("name"),
          "Email: " + get("email"),
          "Phone: " + get("phone"),
          "Rider age: " + get("rider_age"),
          "Experience: " + get("experience"),
          "Interested in: " + get("service"),
          "Preferred days/times: " + get("preferred"),
          "", "Message:", get("message")
        ].join("\n");
        window.location.href = "mailto:solitudestables@gmail.com" +
          "?subject=" + encodeURIComponent("Lesson / trail ride enquiry — " + get("name")) +
          "&body=" + encodeURIComponent(body);
      }
      var success = form.parentElement.querySelector(".form-success");
      if (success) {
        e.preventDefault();
        form.style.display = "none";
        success.classList.add("show");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  }

  /* ---------- Footer link directory (accordion on mobile) ---------- */
  document.querySelectorAll(".fdir-head").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var g = btn.closest(".fdir-group");
      if (!g) return;
      var open = g.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- Back to top ---------- */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Smooth anchor offset for sticky header ---------- */
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      closeNav();
    });
  });

  /* ---------- Pre-trip rule checklist ---------- */
  document.querySelectorAll("[data-rulecheck] .rule-card").forEach(function (b) {
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", on ? "false" : "true");
    });
  });

  /* ---------- Hero background video (pause control + reduced-motion) ---------- */
  (function () {
    var hv = document.querySelector(".hero-video");
    if (!hv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hv.removeAttribute("autoplay"); try { hv.pause(); } catch (e) {}
      return;
    }
    hv.muted = true; hv.setAttribute("muted", ""); hv.playsInline = true;
    function tryPlay(){ var p = hv.play(); if (p && p.catch) p.catch(function(){}); }
    tryPlay();
    hv.addEventListener("canplay", tryPlay, { once: true });
    document.addEventListener("click", tryPlay, { once: true });
  })();
})();

/* ============================================================
   Analytics — dataLayer events for GTM / GA4 funnel tracking
   ============================================================ */
(function () {
  var dl = window.dataLayer = window.dataLayer || [];
  function push(o) { try { dl.push(o); } catch (e) {} }
  var host = location.host;

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var text = (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
    if (href.indexOf("tel:") === 0) { push({ event: "contact_click", contact_method: "phone", link_text: text }); return; }
    if (href.indexOf("mailto:") === 0) { push({ event: "contact_click", contact_method: "email", link_text: text }); return; }
    if (/maps\?cid=|google\.com\/maps/.test(href)) { push({ event: "gbp_click", link_url: href }); return; }
    if (/\/contact\/?($|[#?])/.test(href) || /book/i.test(text)) { push({ event: "cta_click", cta_name: "book_ride", link_text: text, link_url: href }); return; }
    if (/^https?:\/\//.test(href) && href.indexOf(host) === -1) { push({ event: "outbound_click", link_url: href, link_text: text }); }
  }, true);

  document.querySelectorAll(".faq-q").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.getAttribute("aria-expanded") !== "true") push({ event: "faq_open", faq_question: (b.textContent || "").trim().slice(0, 120) });
    });
  });

  document.querySelectorAll(".gallery button").forEach(function (g, i) {
    g.addEventListener("click", function () {
      var img = g.querySelector("img");
      push({ event: "gallery_open", image_alt: img ? img.alt : "", image_index: i });
    });
  });

  var quiz = document.querySelector(".quiz[data-quiz]");
  if (quiz) {
    var started = false, stepNum = 0;
    quiz.querySelectorAll(".quiz-option").forEach(function (opt) {
      opt.addEventListener("click", function () {
        if (!started) { started = true; push({ event: "quiz_start" }); }
        stepNum++;
        push({ event: "quiz_step", quiz_step_number: stepNum, quiz_answer: opt.dataset.value || (opt.textContent || "").trim().slice(0, 40) });
      });
    });
    var results = [].slice.call(quiz.querySelectorAll(".quiz-result"));
    if (results.length && window.MutationObserver) {
      var mo = new MutationObserver(function () {
        results.forEach(function (r) {
          if (r.classList.contains("active") && !r.__t) { r.__t = 1; push({ event: "quiz_complete", quiz_result: r.dataset.result || "" }); }
        });
      });
      results.forEach(function (r) { mo.observe(r, { attributes: true, attributeFilter: ["class"] }); });
    }
  }

  var form = document.querySelector("form[data-booking]");
  if (form) {
    var fs = false;
    form.addEventListener("focusin", function () { if (!fs) { fs = true; push({ event: "form_start", form_name: "booking" }); } });
    form.addEventListener("submit", function () { push({ event: "generate_lead", form_name: "booking" }); });
  }

  document.querySelectorAll(".tf-chip, .trailfinder [data-filter], .tf-controls input, .tf-controls select").forEach(function (el) {
    el.addEventListener("change", function () { push({ event: "trail_finder_filter" }); });
  });

  var marks = [25, 50, 75, 90], fired = {};
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    var pct = Math.round((h.scrollTop + window.innerHeight) / (h.scrollHeight || 1) * 100);
    marks.forEach(function (m) { if (pct >= m && !fired[m]) { fired[m] = 1; push({ event: "scroll_depth", percent: m }); } });
  }, { passive: true });

  var hv = document.querySelector(".hero-video");
  if (hv) hv.addEventListener("playing", function () { push({ event: "hero_video_play" }); }, { once: true });
})();
