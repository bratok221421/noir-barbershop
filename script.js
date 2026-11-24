const header = document.getElementById("header");
const menuButton = document.getElementById("menuButton");
const nav = document.getElementById("nav");
const modal = document.getElementById("atmosphereModal");
const atmosphereButton = document.getElementById("openAtmosphereButton");
const modalClose = document.getElementById("modalClose");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 80);
});

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function startReveal() {
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

// ===== Заставка «Вас приветствует ARS BARBERSHOP» =====
const preloader = document.getElementById("preloader");
const MIN_SHOW = 2200;   // минимум, чтобы успеть прочитать приветствие
const MAX_SHOW = 7000;   // страховка: если что-то грузится слишком долго
if (!preloader) {
  document.body.classList.remove("loading");
  startReveal();
} else {
  const bar = document.getElementById("preloaderBar");
  const count = document.getElementById("preloaderCount");
  const started = performance.now();
  let loaded = document.readyState === "complete";
  let finished = false;
  let progress = 0;

  window.addEventListener("load", () => { loaded = true; });
  setTimeout(() => { loaded = true; }, MAX_SHOW);

  function finish() {
    if (finished) return;
    finished = true;
    document.body.classList.remove("loading");
    preloader.classList.add("hide");
    startReveal(); // текст на главной появляется, пока шторка уезжает
    const remove = () => preloader.remove();
    preloader.addEventListener("transitionend", (e) => { if (e.target === preloader) remove(); });
    setTimeout(remove, 1600);
  }

  function tick(now) {
    const elapsed = now - started;
    const canFinish = loaded && elapsed >= MIN_SHOW;
    const target = canFinish ? 100 : Math.min(92, 92 * (1 - Math.exp(-elapsed / 1300)));
    progress += (target - progress) * 0.14;
    if (canFinish && progress > 99.4) progress = 100;
    bar.style.transform = `scaleX(${progress / 100})`;
    count.textContent = Math.round(progress);
    if (progress >= 100) setTimeout(finish, 250);
    else requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

atmosphereButton.addEventListener("click", () => {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
});

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  atmosphereButton.focus();
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
});

document.querySelectorAll(".service-card").forEach((card) => {
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); } });
  card.addEventListener("click", () => document.getElementById("booking").scrollIntoView({ behavior: "smooth" }));
});

document.querySelectorAll(".price-row").forEach((row) => {
  row.addEventListener("click", () => document.getElementById("booking").scrollIntoView({ behavior: "smooth" }));
});
