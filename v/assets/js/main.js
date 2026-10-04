/* ==========================================================================
   Corporate Solutions — main.js
   Header · mobile nav · scroll reveal · counters · testimonials · misc
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Sticky header                                                      */
  /* ------------------------------------------------------------------ */
  var header = document.querySelector(".site-header");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", y > 8);

    var top = document.querySelector(".to-top");
    if (top) top.classList.toggle("is-visible", y > 560);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ */
  /* Mobile navigation                                                  */
  /* ------------------------------------------------------------------ */
  var burger = document.querySelector(".burger");
  var mobileNav = document.querySelector(".mobile-nav");

  function closeNav() {
    if (!burger || !mobileNav) return;
    burger.classList.remove("is-open");
    mobileNav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-locked");
  }

  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-locked", open);
    });

    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) closeNav();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Active nav highlighting                                            */
  /* ------------------------------------------------------------------ */
  var page = (document.body.getAttribute("data-page") || "").toLowerCase();

  if (page) {
    document.querySelectorAll("[data-nav]").forEach(function (el) {
      if (el.getAttribute("data-nav").toLowerCase() === page) {
        el.classList.add("is-active");
        el.setAttribute("aria-current", "page");
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal                                                      */
  /* ------------------------------------------------------------------ */
  var revealSel = ".reveal, .reveal-x, .reveal-scale, .reveal-line";

  function revealAll() {
    document.querySelectorAll(revealSel).forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    /* Auto-stagger children of [data-stagger] containers */
    document.querySelectorAll("[data-stagger]").forEach(function (box) {
      var step = parseFloat(box.getAttribute("data-stagger")) || 0.09;
      var kids = box.querySelectorAll(":scope > " + revealSel.split(", ").join(":scope > "));
      kids.forEach(function (kid, i) {
        if (!kid.style.getPropertyValue("--d")) {
          kid.style.setProperty("--d", (i * step).toFixed(2) + "s");
        }
      });
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    document.querySelectorAll(revealSel).forEach(function (el) { io.observe(el); });

    /* Safety net: reveal anything still hidden after load */
    window.addEventListener("load", function () {
      setTimeout(function () {
        document.querySelectorAll(revealSel).forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight) el.classList.add("is-in");
        });
      }, 120);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Animated counters                                                  */
  /* ------------------------------------------------------------------ */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;

    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var duration = parseInt(el.getAttribute("data-duration") || "1700", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var group = el.hasAttribute("data-group");

    function fmt(v) {
      if (group) {
        return v.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
      }
      return v.toFixed(decimals);
    }

    if (reduceMotion) {
      el.textContent = prefix + fmt(target) + suffix;
      return;
    }

    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + fmt(target) + suffix;
    }

    requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll("[data-count]");

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      var cio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (c) { cio.observe(c); });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Testimonial slider                                                 */
  /* ------------------------------------------------------------------ */
  var track = document.querySelector(".tst__track");
  if (track) {
    var slides = track.children.length;
    var dotsWrap = document.querySelector(".tst__dots");
    var idx = 0;
    var timer = null;

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (var i = 0; i < slides; i++) {
        var d = document.createElement("button");
        d.type = "button";
        d.className = "tst__dot" + (i === idx ? " is-active" : "");
        d.setAttribute("aria-label", "Testimonial " + (i + 1));
        d.dataset.i = i;
        dotsWrap.appendChild(d);
      }
    }

    function go(n) {
      idx = (n + slides) % slides;
      track.style.transform = "translateX(" + -idx * 100 + "%)";
      if (dotsWrap) {
        dotsWrap.querySelectorAll(".tst__dot").forEach(function (d, i) {
          d.classList.toggle("is-active", i === idx);
        });
      }
    }

    function restart() {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(function () { go(idx + 1); }, 7000);
    }

    renderDots();
    restart();

    var prev = document.querySelector('[data-tst="prev"]');
    var next = document.querySelector('[data-tst="next"]');
    if (prev) prev.addEventListener("click", function () { go(idx - 1); restart(); });
    if (next) next.addEventListener("click", function () { go(idx + 1); restart(); });

    if (dotsWrap) {
      dotsWrap.addEventListener("click", function (e) {
        var b = e.target.closest(".tst__dot");
        if (b) { go(parseInt(b.dataset.i, 10)); restart(); }
      });
    }

    var viewport = document.querySelector(".tst__viewport");
    if (viewport) {
      viewport.addEventListener("mouseenter", function () { clearInterval(timer); });
      viewport.addEventListener("mouseleave", restart);

      var sx = 0;
      viewport.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
      viewport.addEventListener("touchend", function (e) {
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 48) { go(dx < 0 ? idx + 1 : idx - 1); restart(); }
      }, { passive: true });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Newsletter / contact forms (demo, no backend)                      */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll("[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.parentElement.querySelector(".newsletter__msg") ||
                form.querySelector(".newsletter__msg");
      var input = form.querySelector("input[type='email']");
      if (input && !input.checkValidity()) {
        input.reportValidity();
        return;
      }
      if (msg) {
        msg.textContent = "Thank you — we\u2019ll be in touch within one business day.";
        form.reset();
        setTimeout(function () { msg.textContent = ""; }, 6000);
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Scroll to top                                                      */
  /* ------------------------------------------------------------------ */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Footer year                                                        */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ------------------------------------------------------------------ */
  /* Hero parallax (desktop only, subtle)                               */
  /* ------------------------------------------------------------------ */
  var heroVisual = document.querySelector("[data-parallax]");
  if (heroVisual && !reduceMotion && window.matchMedia("(min-width: 921px)").matches) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 520);
        heroVisual.style.transform = "translate3d(0," + (y * -0.045).toFixed(2) + "px,0)";
        ticking = false;
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Subnav scrollspy (project pages)                                   */
  /* ------------------------------------------------------------------ */
  var subnav = document.querySelector(".subnav");
  if (subnav && "IntersectionObserver" in window) {
    var links = Array.prototype.slice.call(subnav.querySelectorAll("a[href^='#']"));
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);

    if (sections.length) {
      var sio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            links.forEach(function (a) {
              a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach(function (s) { sio.observe(s); });
    }
  }
})();
