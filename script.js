const header = document.getElementById("header");
const menuButton = document.getElementById("menuButton");
const nav = document.getElementById("nav");
const modal = document.getElementById("atmosphereModal");
const atmosphereButton = document.getElementById("openAtmosphereButton");
const modalClose = document.getElementById("modalClose");
const bookingForm = document.getElementById("bookingForm");
const formStatus = document.getElementById("formStatus");

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
  card.addEventListener("click", () => {
    const title = card.dataset.service || card.querySelector("h3").textContent;
    const serviceSelect = bookingForm.querySelector('[name="service"]');
    for (const option of serviceSelect.options) {
      if (option.textContent.includes(title)) {
        serviceSelect.value = option.value;
        break;
      }
    }
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll(".price-row").forEach((row) => {
  row.addEventListener("click", () => {
    const serviceName = row.dataset.service;
    const serviceSelect = bookingForm.querySelector('[name="service"]');
    for (const option of serviceSelect.options) {
      if (option.textContent.toLowerCase().includes(serviceName.toLowerCase())) {
        serviceSelect.value = option.value;
        break;
      }
    }
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
  });
});

// ===== Запись онлайн =====
// ENDPOINT: сюда вставьте адрес приёма заявок (например, https://formspree.io/f/xxxxxxx).
// Если пусто — заявка уходит сообщением в WhatsApp на номер WHATSAPP.
const BOOKING_CONFIG = {
  endpoint: "",
  whatsapp: "79781617720"
};

const phoneInput = bookingForm.querySelector('[name="phone"]');

function formatPhone(raw) {
  let d = raw.replace(/\D/g, "");
  if (d[0] === "8") d = "7" + d.slice(1);
  if (d && d[0] !== "7") d = "7" + d;
  d = d.slice(0, 11);
  if (!d) return "";
  let out = "+7";
  if (d.length > 1) out += " (" + d.slice(1, 4);
  if (d.length >= 5) out += ") " + d.slice(4, 7);
  if (d.length >= 8) out += "-" + d.slice(7, 9);
  if (d.length >= 10) out += "-" + d.slice(9, 11);
  return out;
}

phoneInput.addEventListener("input", (event) => {
  phoneInput.setCustomValidity("");
  let value = formatPhone(phoneInput.value);
  if (event.inputType && event.inputType.startsWith("delete")) value = value.replace(/\D+$/, "");
  phoneInput.value = value;
});

function showStatus(text, isError, link) {
  formStatus.classList.toggle("error", Boolean(isError));
  formStatus.textContent = text;
  if (link) {
    const a = document.createElement("a");
    a.href = link.href; a.target = "_blank"; a.rel = "noopener"; a.textContent = link.label;
    formStatus.append(" ", a);
  }
}

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(bookingForm);
  if (data.get("website")) return; // защита от ботов

  const name = String(data.get("name")).trim();
  const phoneDigits = String(data.get("phone")).replace(/\D/g, "");
  if (phoneDigits.length !== 11) {
    phoneInput.setCustomValidity("Введите номер полностью: +7 и 10 цифр");
    phoneInput.reportValidity();
    return;
  }

  const payload = {
    name,
    phone: String(data.get("phone")),
    service: String(data.get("service")),
    master: String(data.get("master"))
  };
  const submitButton = bookingForm.querySelector('[type="submit"]');
  submitButton.disabled = true;

  try {
    if (BOOKING_CONFIG.endpoint) {
      const response = await fetch(BOOKING_CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("bad status " + response.status);
      showStatus(`Спасибо, ${name}! Заявка отправлена — скоро перезвоним.`, false);
      bookingForm.reset();
    } else {
      const text = `Здравствуйте! Хочу записаться в ARS BARBERSHOP.\nУслуга: ${payload.service}\nМастер: ${payload.master}\nИмя: ${payload.name}\nТелефон: ${payload.phone}`;
      const url = `https://wa.me/${BOOKING_CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
      const opened = window.open(url, "_blank", "noopener");
      showStatus(
        opened ? "Открыли WhatsApp — отправьте сообщение, и мы подтвердим запись."
               : "Не удалось открыть WhatsApp автоматически.",
        !opened,
        opened ? null : { href: url, label: "Открыть WhatsApp" }
      );
      if (opened) bookingForm.reset();
    }
  } catch (error) {
    showStatus("Не получилось отправить заявку. Позвоните нам: +7 (978) 161-77-20.", true);
  } finally {
    submitButton.disabled = false;
  }
});
