const header = document.getElementById("header");
const menuButton = document.getElementById("menuButton");
const nav = document.getElementById("nav");
const modal = document.getElementById("videoModal");
const playButton = document.getElementById("playButton");
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

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

playButton.addEventListener("click", () => {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
});

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

document.querySelectorAll(".service-card").forEach((card) => {
  card.querySelector("button").addEventListener("click", () => {
    const title = card.querySelector("h3").textContent;
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

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = new FormData(bookingForm).get("name").trim();
  formStatus.textContent = `Спасибо, ${name}! Заявка отправлена — скоро перезвоним.`;
  bookingForm.reset();
});
