// Sakon Semiconductors — site behaviour

// Set this to the company enquiries inbox before going live.
// The form opens the visitor's email app addressed to this inbox.
const CONTACT_EMAIL = "";

(function () {
  // Opening logo animation: fade into the site as the video's own fade-out begins
  const intro = document.getElementById("intro");
  const root = document.documentElement;
  if (intro) {
    if (root.classList.contains("intro-skip")) {
      intro.remove();
    } else {
      const video = intro.querySelector("video");
      const HANDOFF = 6.3; // seconds: the logo is complete and about to fade in the video
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        try { sessionStorage.setItem("sakonIntroSeen", "1"); } catch (e) {}
        intro.classList.add("is-done");
        root.classList.remove("intro-playing");
        setTimeout(() => intro.remove(), 1000);
      };
      intro.querySelector(".intro__skip").addEventListener("click", finish);
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") finish(); }, { once: true });
      video.addEventListener("timeupdate", () => { if (video.currentTime >= HANDOFF) finish(); });
      video.addEventListener("ended", finish);
      video.addEventListener("error", finish);
      const played = video.play();
      if (played && played.catch) played.catch(finish); // autoplay blocked: go straight to the site
      setTimeout(finish, 10000); // safety net if the video stalls
    }
  }

  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const links = document.getElementById("nav-links");

  // Solid nav background once the page scrolls
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // Highlight the current section in the nav
  const navLinks = [...links.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  // Contact form
  const form = document.getElementById("contact-form");
  const note = form.querySelector(".form__note");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = form.elements.name;
    const email = form.elements.email;
    const nameOk = name.value.trim() !== "";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    name.setAttribute("aria-invalid", String(!nameOk));
    email.setAttribute("aria-invalid", String(!emailOk));
    if (!nameOk || !emailOk) {
      note.textContent = "Please add your name and a valid email address.";
      (nameOk ? email : name).focus();
      return;
    }
    if (!CONTACT_EMAIL) {
      note.textContent = "Thanks. The enquiry inbox isn't set up yet, so please contact the team directly.";
      return;
    }
    const subject = `Website enquiry: ${data.get("interest")}`;
    const body = [
      `Name: ${data.get("name")}`,
      `Organisation: ${data.get("org") || "-"}`,
      `Email: ${data.get("email")}`,
      `Interest: ${data.get("interest")}`,
      "",
      data.get("message") || "",
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Your email app should now open with the enquiry ready to send.";
  });

  // Coverage demo: toggle traditional Wi-Fi vs Wi-Fi HaLow on the farm photo
  const cov = document.getElementById("coverage");
  if (cov) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const caption = cov.querySelector(".coverage__caption");
    const stat = (k) => cov.querySelector(`[data-stat="${k}"]`);
    const modes = {
      wifi: {
        text: "<strong>Traditional Wi-Fi:</strong> the signal fades about 50 m from the barn, so sensors in the far fields stay offline.",
        range: 50, online: 3, aps: 50,
      },
      halow: {
        text: "<strong>Wi-Fi HaLow:</strong> one access point reaches about 1 km, through trees and buildings. Every sensor is online.",
        range: 1000, online: 12, aps: 1,
      },
    };
    let current = { range: 50, online: 3, aps: 50 };
    let raf;

    const fmtRange = (m) => (m >= 1000 ? "~1 km" : `~${Math.round(m / 10) * 10 || 10} m`);
    const renderStats = (v) => {
      stat("range").textContent = fmtRange(v.range);
      stat("online").textContent = `${Math.round(v.online)} / 12`;
      stat("aps").textContent = Math.round(v.aps) === 1 ? "1" : `~${Math.round(v.aps)}`;
    };

    // Count the numbers up or down alongside the coverage animation
    const tweenStats = (to) => {
      cancelAnimationFrame(raf);
      if (reduceMotion) { current = { ...to }; renderStats(current); return; }
      const from = { ...current };
      const start = performance.now();
      const dur = 1400;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        current = {
          range: from.range + (to.range - from.range) * e,
          online: from.online + (to.online - from.online) * e,
          aps: from.aps + (to.aps - from.aps) * e,
        };
        renderStats(current);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    // Reveal the caption word by word
    const setCaption = (html) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      let i = 0;
      const wrap = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const span = document.createElement("span");
            span.className = "w";
            span.style.animationDelay = `${i++ * 45}ms`;
            span.textContent = part;
            frag.append(span);
          });
          node.replaceWith(frag);
        } else {
          [...node.childNodes].forEach(wrap);
        }
      };
      [...tmp.childNodes].forEach(wrap);
      caption.replaceChildren(...tmp.childNodes);
    };

    const setMode = (mode) => {
      if (cov.dataset.mode === mode && caption.textContent) return;
      cov.dataset.mode = mode;
      cov.querySelectorAll(".coverage__toggle button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
      setCaption(modes[mode].text);
      tweenStats(modes[mode]);
    };

    let userTouched = false;
    cov.querySelectorAll(".coverage__toggle button").forEach((b) =>
      b.addEventListener("click", () => { userTouched = true; setMode(b.dataset.mode); }));

    setCaption(modes.wifi.text);
    renderStats(current);

    // The first time the demo scrolls into view, switch to HaLow once to show the difference
    if ("IntersectionObserver" in window && !reduceMotion) {
      const demo = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        demo.disconnect();
        setTimeout(() => { if (!userTouched) setMode("halow"); }, 2200);
      }, { threshold: 0.6 });
      demo.observe(cov);
    }
  }

  // Team: clicking a card swaps that person into the featured profile panel
  const feature = document.getElementById("team-feature");
  const people = [...document.querySelectorAll(".team .person")];
  if (feature && people.length) {
    const photo = feature.querySelector(".team-feature__photo");
    const nameEl = feature.querySelector(".team-feature__name");
    const roleEl = feature.querySelector(".team-feature__role");
    const textEl = feature.querySelector(".team-feature__text");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let swapTimer;

    const select = (card) => {
      if (card.classList.contains("is-active")) return;
      people.forEach((c) => {
        const on = c === card;
        c.classList.toggle("is-active", on);
        c.querySelector(".person__open").setAttribute("aria-pressed", String(on));
      });

      const fill = () => {
        const img = card.querySelector("img");
        photo.src = img.src;
        photo.alt = img.alt;
        nameEl.textContent = card.querySelector(".person__open").textContent;
        roleEl.innerHTML = card.querySelector(".role").innerHTML;
        textEl.replaceChildren(card.querySelector(".person__full").content.cloneNode(true));
        feature.classList.remove("is-swapping");
      };

      clearTimeout(swapTimer);
      if (reduceMotion) { fill(); } else {
        feature.classList.add("is-swapping");
        swapTimer = setTimeout(fill, 280);
      }

      // On small screens the panel may be off-screen, so bring it into view
      const top = feature.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.4) {
        feature.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    };

    people.forEach((card) =>
      card.querySelector(".person__open").addEventListener("click", () => select(card)));
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
