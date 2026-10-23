// Fade sections in as they scroll into view.
(function () {
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  document.documentElement.classList.add("js-reveal");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach(function (el) { io.observe(el); });
})();

// Header gets a shadow once the page is scrolled.
(function () {
  var header = document.querySelector(".site-header");
  if (!header) return;
  var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// Screenshot sliders: arrows, dots that follow scrolling, and a full-size view.
(function () {
  document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
    var track = gallery.querySelector(".gallery-track");
    var dots = gallery.querySelectorAll(".gallery-dots span");
    var count = dots.length;
    var slides = gallery.querySelectorAll(".gallery-slide");
    var current = function () { return Math.round(track.scrollLeft / track.clientWidth); };
    var mark = function (i) {
      dots.forEach(function (d, n) { d.classList.toggle("on", n === i); });
    };
    var go = function (i) {
      i = (i + count) % count;   // wrap around at both ends
      // Jump, then fade the new slide in (smooth scrolling is unreliable across browsers).
      track.scrollLeft = i * track.clientWidth;
      slides[i].classList.remove("fade-in");
      void slides[i].offsetWidth;
      slides[i].classList.add("fade-in");
      mark(i);
    };
    gallery.querySelector(".prev").addEventListener("click", function () { go(current() - 1); });
    gallery.querySelector(".next").addEventListener("click", function () { go(current() + 1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  { e.preventDefault(); go(current() - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(current() + 1); }
    });
    track.addEventListener("scroll", function () { mark(current()); }, { passive: true });
  });

  var box = document.getElementById("lightbox");
  if (!box || !box.showModal) return;
  var img = box.querySelector("img");
  var cap = box.querySelector("figcaption");
  document.querySelectorAll(".gallery-open").forEach(function (btn) {
    btn.addEventListener("click", function () {
      img.src = btn.dataset.full;
      img.alt = btn.dataset.caption;
      cap.textContent = btn.dataset.caption;
      box.showModal();
    });
  });
  box.querySelector(".lightbox-close").addEventListener("click", function () { box.close(); });
  box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
})();

// Close the language menu when clicking elsewhere.
document.addEventListener("click", function (ev) {
  var menu = document.querySelector(".lang-menu[open]");
  if (menu && !menu.contains(ev.target)) menu.removeAttribute("open");
});

// Contact form: send through Web3Forms without leaving the page.
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = form.querySelector(".form-status");
  var button = form.querySelector("button[type=submit]");

  function show(kind, text) {
    status.className = "form-status " + kind;
    status.textContent = text;
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!form.reportValidity()) return;

    var f = form.elements;
    // Field labels come from data-label, so the email is in the page's language.
    var details = "";
    ["name", "email", "company", "service", "budget"].forEach(function (key) {
      if (f[key].value) details += f[key].dataset.label + ": " + f[key].value + "\n";
    });

    var payload = {
      access_key: form.dataset.key,
      subject: form.dataset.subject + ": " + f.service.value + (f.company.value ? " (" + f.company.value + ")" : ""),
      from_name: "VG OutDev website",
      name: f.name.value,
      email: f.email.value,           // Web3Forms uses this as the reply-to address
      message: details + "\n" + f.message.value,
      page: window.location.pathname,
      botcheck: f.botcheck.checked
    };

    button.disabled = true;
    show("pending", form.dataset.sending);

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.success) throw new Error(data.message);
        form.reset();
        show("ok", form.dataset.success);
      })
      .catch(function () { show("error", form.dataset.error); })
      .then(function () { button.disabled = false; });
  });
})();
