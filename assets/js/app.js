(function () {
  "use strict";

  const burger = document.querySelector(".burger");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileNavClose = document.querySelector(".mobile-nav-close");

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add("open");
    if (burger) burger.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }
  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove("open");
    if (burger) burger.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  if (burger && mobileNav) {
    burger.addEventListener("click", () => {
      mobileNav.classList.contains("open") ? closeMobileNav() : openMobileNav();
    });
    mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", closeMobileNav)
    );
    if (mobileNavClose) mobileNavClose.addEventListener("click", closeMobileNav);
    mobileNav.addEventListener("click", (e) => {
      if (e.target === mobileNav) closeMobileNav();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileNav.classList.contains("open")) closeMobileNav();
    });
  }

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

  const msgFab = document.querySelector(".float-messenger .fab");
  const msgPanel = document.querySelector(".messenger-panel");
  if (msgFab && msgPanel) {
    msgFab.addEventListener("click", (e) => {
      e.stopPropagation();
      msgPanel.classList.toggle("open");
    });
    document.addEventListener("click", () => msgPanel.classList.remove("open"));
  }

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

  document.querySelectorAll(".phone-field").forEach((field) => {
    const select = field.querySelector(".phone-cc-select");
    const input = field.querySelector("input");
    if (!select || !input) return;

    const applyMax = () => {
      const opt = select.options[select.selectedIndex];
      const max = Number(opt.dataset.max) || 15;
      input.setAttribute("maxlength", max);
      input.setAttribute("inputmode", "numeric");
      input.setAttribute("pattern", "[0-9]*");
      if (input.value.length > max) input.value = input.value.slice(0, max);
    };
    applyMax();
    select.addEventListener("change", applyMax);

    input.addEventListener("input", () => {
      const max = Number(select.options[select.selectedIndex].dataset.max) || 15;
      const digitsOnly = input.value.replace(/\D/g, "").slice(0, max);
      if (digitsOnly !== input.value) input.value = digitsOnly;
    });
    input.addEventListener("keypress", (e) => {
      if (e.key.length === 1 && !/[0-9]/.test(e.key)) e.preventDefault();
    });
  });

  document.querySelectorAll(".quiz-card[data-quiz]").forEach((card) => {
    const steps = Array.from(card.querySelectorAll(".quiz-step"));
    const dots = Array.from(card.querySelectorAll(".quiz-dots span"));
    const progressEl = card.querySelector(".quiz-progress");
    let current = 0;
    const answers = {};

    function render() {
      steps.forEach((s, i) => s.classList.toggle("active", i === current));
      dots.forEach((d, i) => d.classList.toggle("active", i === current));
      if (progressEl) progressEl.textContent = `${Math.min(current + 1, steps.length)}/${steps.length}`;
    }

    card.querySelectorAll(".quiz-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        const group = opt.closest(".quiz-step");
        group.querySelectorAll(".quiz-option").forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
        answers[opt.dataset.field] = opt.dataset.value;
        const nextBtn = group.querySelector("[data-quiz-next]");
        if (nextBtn) nextBtn.disabled = false;
      });
    });

    card.querySelectorAll("[data-quiz-next]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (current < steps.length - 1) { current++; render(); }
      });
    });
    card.querySelectorAll("[data-quiz-back]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (current > 0) { current--; render(); }
      });
    });

    const form = card.querySelector("form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        let valid = true;
        form.querySelectorAll("[data-required]").forEach((field) => {
          const wrap = field.closest(".field");
          if (!field.value.trim()) { wrap.classList.add("error"); valid = false; }
          else wrap.classList.remove("error");
        });
        if (!valid) return;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.classList.add("is-loading");
        answers.name = form.querySelector('[name="name"]')?.value;
        answers.phone = form.querySelector('[name="phone"]')?.value;
        answers.email = form.querySelector('[name="email"]')?.value;
        setTimeout(() => { window.location.href = "thank-you.html"; }, 700);
      });
    }
    render();
  });

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

      setTimeout(() => {
        window.location.href = "thank-you.html";
      }, 700);
    });
  });
})();
