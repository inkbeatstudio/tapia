/* ============================================================
   TEPIA GROUP — shared front-end behaviour
   ============================================================ */
(function () {
  "use strict";

  // ---- mobile nav ----
  const burger = document.querySelector(".burger");
  const mobileNav = document.querySelector(".mobile-nav");
  if (burger && mobileNav) {
    burger.addEventListener("click", () => mobileNav.classList.toggle("open"));
    mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => mobileNav.classList.remove("open"))
    );
  }

  // ---- language dropdown ----
  document.querySelectorAll(".lang-switch").forEach((wrap) => {
    const btn = wrap.querySelector(".lang-btn");
    const menu = wrap.querySelector(".lang-menu");
    if (!btn || !menu) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("open");
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".lang-menu.open").forEach((m) => m.classList.remove("open"));
  });

  // ---- FAQ accordion ----
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      item.closest(".faq-list")?.querySelectorAll(".faq-item").forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  // ---- cookie consent ----
  const cookieBanner = document.querySelector(".cookie-banner");
  if (cookieBanner) {
    const decided = localStorage.getItem("tepia_cookie_consent");
    if (!decided) setTimeout(() => cookieBanner.classList.add("show"), 600);
    cookieBanner.querySelectorAll("[data-cookie]").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.setItem("tepia_cookie_consent", btn.getAttribute("data-cookie"));
        cookieBanner.classList.remove("show");
      });
    });
  }

  // ---- floating messenger panel ----
  const msgFab = document.querySelector(".float-messenger .fab");
  const msgPanel = document.querySelector(".messenger-panel");
  if (msgFab && msgPanel) {
    msgFab.addEventListener("click", (e) => {
      e.stopPropagation();
      msgPanel.classList.toggle("open");
    });
    document.addEventListener("click", () => msgPanel.classList.remove("open"));
  }

  // ---- back to top ----
  const topFab = document.querySelector(".float-top .fab");
  window.addEventListener("scroll", () => {
    const show = window.scrollY > 500;
    document.querySelectorAll(".fab").forEach((f) => f.classList.add("show"));
    if (topFab) topFab.classList.toggle("show", show);
    if (msgFab) msgFab.classList.add("show");
  });
  if (topFab) {
    topFab.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    setTimeout(() => { if (msgFab) msgFab.classList.add("show"); }, 300);
  }

  // ---- sticky header active link on scroll (light touch) ----
  const sections = document.querySelectorAll("main [id]");
  const navLinks = document.querySelectorAll(".main-nav a[href^='#']");
  if (sections.length && navLinks.length) {
    window.addEventListener("scroll", () => {
      let current = "";
      sections.forEach((sec) => {
        if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
      });
      navLinks.forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    });
  }

  // ---- phone country codes (lightweight static list) ----
  const CC = [
    { c: "PL", d: "+48", max: 9 },
    { c: "UA", d: "+380", max: 9 },
    { c: "DE", d: "+49", max: 11 },
    { c: "RO", d: "+40", max: 9 },
    { c: "RU", d: "+7", max: 10 },
    { c: "GB", d: "+44", max: 10 },
  ];
  document.querySelectorAll(".phone-field").forEach((field) => {
    const ccBtn = field.querySelector(".phone-cc");
    const input = field.querySelector("input");
    if (!ccBtn || !input) return;
    let idx = 0;
    ccBtn.querySelector(".cc-code").textContent = CC[idx].d;
    input.setAttribute("maxlength", CC[idx].max);
    ccBtn.addEventListener("click", () => {
      idx = (idx + 1) % CC.length;
      ccBtn.querySelector(".cc-code").textContent = CC[idx].d;
      ccBtn.querySelector(".cc-flag").textContent = CC[idx].c;
      input.setAttribute("maxlength", CC[idx].max);
    });
  });

  // ---- generic form handling: validation + fake-submit -> thank-you ----
  document.querySelectorAll("form[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      const lang = window.TEPIA_I18N ? window.TEPIA_I18N.currentLang() : "en";

      form.querySelectorAll("[data-required]").forEach((field) => {
        const wrap = field.closest(".field");
        if (!field.value.trim()) {
          wrap.classList.add("error");
          valid = false;
        } else {
          wrap.classList.remove("error");
        }
      });

      const phone = form.querySelector('input[type="tel"]');
      const email = form.querySelector('input[type="email"]');
      if (phone && email) {
        const phoneWrap = phone.closest(".field");
        const emailWrap = email.closest(".field");
        if (!phone.value.trim() && !email.value.trim()) {
          phoneWrap.classList.add("error");
          emailWrap.classList.add("error");
          valid = false;
        } else {
          phoneWrap.classList.remove("error");
          emailWrap.classList.remove("error");
        }
      }

      if (!valid) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.classList.add("is-loading");

      // Placeholder for real API call (POST /api/leads) — wired once backend is deployed.
      setTimeout(() => {
        window.location.href = "thank-you.html";
      }, 700);
    });
  });
})();
