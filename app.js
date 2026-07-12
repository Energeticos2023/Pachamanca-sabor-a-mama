const BUSINESS = {
  whatsapp: "51932757214",
  date: "martes 28 de julio de 2026",
  packages: [
    {
      id: "personal",
      name: "Porción personal",
      people: "Para 1 persona",
      price: 38,
      description: ["3 carnes", "Papas, camote y choclo", "Habas y humita"]
    },
    {
      id: "pareja",
      name: "Pack pareja",
      people: "Para 2 personas",
      price: 74,
      description: ["2 porciones completas", "Ideal para compartir", "Delivery urbano incluido"]
    },
    {
      id: "familiar4",
      name: "Pack familiar",
      people: "Para 4 personas",
      price: 144,
      featured: true,
      tag: "Más pedido",
      description: ["4 porciones completas", "Ahorro familiar", "Delivery urbano incluido"]
    },
    {
      id: "familiar6",
      name: "Familia grande",
      people: "Para 6 personas",
      price: 210,
      description: ["6 porciones completas", "Para una gran reunión", "Delivery urbano incluido"]
    }
  ]
};

const money = (value) => new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 0
}).format(value);

const priceGrid = document.querySelector("#price-grid");
const packageSelect = document.querySelector("#package-select");
const summary = document.querySelector("#order-summary");

function renderPackages() {
  priceGrid.innerHTML = BUSINESS.packages.map((item) => `
    <article class="price-card ${item.featured ? "featured" : ""}">
      ${item.tag ? `<span class="tag">${item.tag}</span>` : ""}
      <h3>${item.name}</h3>
      <span class="serves">${item.people}</span>
      <div class="price">${money(item.price)}</div>
      <div class="deposit">Reserva con ${money(item.price / 2)}</div>
      <ul>${item.description.map((line) => `<li>${line}</li>`).join("")}</ul>
      <button class="button button-primary choose-package" type="button" data-package="${item.id}">Elegir</button>
    </article>
  `).join("");

  packageSelect.innerHTML = `<option value="">Seleccionar</option>` + BUSINESS.packages
    .map((item) => `<option value="${item.id}">${item.name} — ${money(item.price)}</option>`)
    .join("");
}

function selectedPackage() {
  return BUSINESS.packages.find((item) => item.id === packageSelect.value);
}

function updateSummary() {
  const item = selectedPackage();
  if (!item) {
    summary.innerHTML = "Selecciona una presentación para ver el total y el adelanto.";
    return;
  }
  summary.innerHTML = `
    <span>${item.name} · ${item.people}</span>
    <span>Total: <strong>${money(item.price)}</strong></span>
    <span>Adelanto del 50 %: <strong>${money(item.price / 2)}</strong></span>
    <span>Saldo contra entrega: <strong>${money(item.price / 2)}</strong></span>
  `;
}

renderPackages();
updateSummary();

priceGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".choose-package");
  if (!button) return;
  packageSelect.value = button.dataset.package;
  updateSummary();
  document.querySelector("#reserva").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => document.querySelector("#customer-name").focus(), 450);
});

packageSelect.addEventListener("change", updateSummary);

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
});

window.addEventListener("scroll", () => {
  document.querySelector(".topbar").classList.toggle("scrolled", window.scrollY > 25);
}, { passive: true });

const storyModal = document.querySelector("#story-modal");
document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => storyModal.showModal());
});
document.querySelector(".modal-close").addEventListener("click", () => storyModal.close());
document.querySelector("[data-close-modal]").addEventListener("click", () => storyModal.close());
storyModal.addEventListener("click", (event) => {
  if (event.target === storyModal) storyModal.close();
});

const toast = document.querySelector("#toast");
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      showToast("Número copiado");
    } catch {
      showToast("Mantén presionado para copiar");
    }
  });
});

document.querySelector("#order-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const item = selectedPackage();
  if (!item) return;

  const name = document.querySelector("#customer-name").value.trim();
  const district = document.querySelector("#district").value;
  const time = document.querySelector("#delivery-time").value;
  const address = document.querySelector("#address").value.trim();
  const payment = document.querySelector("#payment-method").value;

  const message = [
    "Hola, deseo separar mi *Pachamanca Sabor a Mamá*.",
    "",
    `📅 Entrega: ${BUSINESS.date}`,
    `👤 Nombre: ${name}`,
    `🍽️ Pedido: ${item.name} (${item.people})`,
    `💰 Total: ${money(item.price)}`,
    `✅ Adelanto del 50 %: ${money(item.price / 2)}`,
    `📍 Distrito: ${district}`,
    `🏠 Dirección y referencia: ${address}`,
    `🕐 Horario preferido: ${time}`,
    `💳 Forma de pago: ${payment}`,
    "",
    "Adjuntaré mi comprobante para confirmar la reserva."
  ].join("\n");

  const url = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
