/* ==========================================================================
   Corporate Solutions — project.js
   Tabbed content · screenshot lightbox
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Tabs                                                                */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = Array.prototype.slice.call(group.querySelectorAll(".tab"));
    var panels = Array.prototype.slice.call(group.querySelectorAll(".tab-panel"));

    function activate(id) {
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-tab") === id;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
        t.setAttribute("tabindex", on ? "0" : "-1");
      });
      panels.forEach(function (p) {
        var on = p.id === id;
        p.classList.toggle("is-active", on);
        p.hidden = !on;
        if (on) {
          /* Panels were hidden, so scroll-reveal never fired for their children. */
          p.querySelectorAll(".reveal, .reveal-x, .reveal-scale, .reveal-line")
            .forEach(function (el) { el.classList.add("is-in"); });
        }
      });
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-tab"));
      });

      tab.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus();
        activate(next.getAttribute("data-tab"));
      });
    });

    /* Deep-link support */
    var hash = location.hash.replace("#", "");
    var valid = tabs.some(function (t) { return t.getAttribute("data-tab") === hash; });
    if (valid) activate(hash);
  });

  /* ------------------------------------------------------------------ */
  /* Screenshot lightbox                                                */
  /* ------------------------------------------------------------------ */
  var shots = Array.prototype.slice.call(document.querySelectorAll("[data-shot]"));
  if (!shots.length) return;

  var lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Screenshot preview");
  lb.innerHTML =
    '<div class="lb__inner">' +
      '<div class="lb__bar">' +
        "<div><b></b><span></span></div>" +
        '<button class="lb__close" type="button" aria-label="Close preview">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        "</button>" +
      "</div>" +
      '<div class="lb__stage"></div>' +
    "</div>";
  document.body.appendChild(lb);

  var stage = lb.querySelector(".lb__stage");
  var title = lb.querySelector(".lb__bar b");
  var sub = lb.querySelector(".lb__bar span");
  var closeBtn = lb.querySelector(".lb__close");
  var lastFocus = null;

  function openLB(btn) {
    var clone = btn.querySelector(".mock, .shot__frame");
    if (!clone) return;
    lastFocus = btn;
    stage.innerHTML = "";
    var node = clone.cloneNode(true);
    node.style.transform = "none";
    stage.appendChild(node);
    title.textContent = btn.getAttribute("data-title") || "Screenshot";
    sub.textContent = btn.getAttribute("data-sub") || "";
    lb.classList.add("is-open");
    document.body.classList.add("nav-locked");
    closeBtn.focus();
  }

  function closeLB() {
    lb.classList.remove("is-open");
    document.body.classList.remove("nav-locked");
    setTimeout(function () { stage.innerHTML = ""; }, 320);
    if (lastFocus) lastFocus.focus();
  }

  shots.forEach(function (btn) {
    btn.addEventListener("click", function () { openLB(btn); });
  });

  closeBtn.addEventListener("click", closeLB);

  lb.addEventListener("click", function (e) {
    if (e.target === lb) closeLB();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lb.classList.contains("is-open")) closeLB();
  });
})();
