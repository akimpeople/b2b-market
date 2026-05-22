import { CONFIG } from "./config.js";

const supabase = window.supabase.createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_KEY
);

// ======================
// STATE
// ======================
let products = [];
let cart = {}; // { productId: qty }

// ======================
// DOM
// ======================
const productsEl = document.getElementById("products");
const loader = document.getElementById("loader");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const orderForm = document.getElementById("orderForm");

// ======================
// INIT
// ======================
async function init() {
  await loadProducts();
  renderProducts();
  updateCartUI();
}

init();

// ======================
// LOAD PRODUCTS
// ======================
async function loadProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    loader.innerText = "Ошибка загрузки товаров";
    return;
  }

  products = data || [];
  loader.style.display = "none";
}

// ======================
// RENDER PRODUCTS
// ======================
function renderProducts() {
  productsEl.innerHTML = "";

  products.forEach((p) => {
    const qty = cart[p.id] || 0;

    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.price} ₸ / ${p.unit}</p>

      <div class="cart-controls">
        ${
          qty === 0
            ? `<button data-id="${p.id}" class="add-btn">В корзину</button>`
            : `
              <button data-id="${p.id}" class="minus">-</button>
              <span>${qty}</span>
              <button data-id="${p.id}" class="plus">+</button>
            `
        }
      </div>
    `;

    productsEl.appendChild(card);
  });

  attachEvents();
}

// ======================
// EVENTS
// ======================
function attachEvents() {
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.onclick = () => addToCart(btn.dataset.id);
  });

  document.querySelectorAll(".plus").forEach((btn) => {
    btn.onclick = () => addToCart(btn.dataset.id);
  });

  document.querySelectorAll(".minus").forEach((btn) => {
    btn.onclick = () => removeFromCart(btn.dataset.id);
  });
}

// ======================
// CART LOGIC
// ======================
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderProducts();
  updateCartUI();
}

function removeFromCart(id) {
  if (!cart[id]) return;

  cart[id] -= 1;

  if (cart[id] <= 0) {
    delete cart[id];
  }

  renderProducts();
  updateCartUI();
}

// ======================
// TOTAL
// ======================
function calculateTotal() {
  let total = 0;

  for (const id in cart) {
    const product = products.find(
      (p) => Number(p.id) === Number(id)
    );

    if (!product) continue;

    total += product.price * cart[id];
  }

  return total;
}

function updateCartUI() {
  const total = calculateTotal();

  cartTotalEl.innerText = Math.round(total);

  checkoutBtn.disabled = total === 0;
}

// ======================
// MODAL
// ======================
checkoutBtn.onclick = () => {
  modal.classList.remove("hidden");
};

closeModal.onclick = () => {
  modal.classList.add("hidden");
};

// клик вне окна
window.onclick = (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
};

// ======================
// ORDER SUBMIT
// ======================
orderForm.onsubmit = async (e) => {
  e.preventDefault();

  const customer_name = document.getElementById("customer_name").value;
  const company_name = document.getElementById("company_name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const comment = document.getElementById("comment").value;

  const items = Object.keys(cart).map((id) => {
    const product = products.find(
      (p) => Number(p.id) === Number(id)
    );

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      qty: cart[id],
      unit: product.unit,
    };
  }).filter(Boolean);

  const total = calculateTotal();

  await supabase.from("orders").insert([
    {
      customer_name,
      company_name,
      phone,
      address,
      comment,
      items,
      total,
      status: "new",
    },
  ]);

  let text = `Новый заказ:%0A`;
  text += `Компания: ${company_name}%0A`;
  text += `Имя: ${customer_name}%0A%0A`;

  items.forEach((i) => {
    text += `${i.name} x${i.qty} = ${i.price * i.qty} ₸%0A`;
  });

  text += `%0AИТОГО: ${Math.round(total)} ₸`;

  const url = `https://wa.me/${CONFIG.WHATSAPP_PHONE}?text=${encodeURIComponent(
    text
  )}`;

  cart = {};
  modal.classList.add("hidden");

  renderProducts();
  updateCartUI();

  window.open(url, "_blank");
};      <h3>${p.name}</h3>
      <p>${p.price} ₸ / ${p.unit}</p>

      <div class="cart-controls">
        ${
          qty === 0
            ? `<button data-id="${p.id}" class="add-btn">В корзину</button>`
            : `
              <button data-id="${p.id}" class="minus">-</button>
              <span>${qty}</span>
              <button data-id="${p.id}" class="plus">+</button>
            `
        }
      </div>
    `;

    productsEl.appendChild(card);
  });

  attachEvents();
}

// ======================
// CART EVENTS
// ======================
function attachEvents() {
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.onclick = () => addToCart(btn.dataset.id);
  });

  document.querySelectorAll(".plus").forEach(btn => {
    btn.onclick = () => addToCart(btn.dataset.id);
  });

  document.querySelectorAll(".minus").forEach(btn => {
    btn.onclick = () => removeFromCart(btn.dataset.id);
  });
}

// ======================
// CART LOGIC (SECURE STATE ONLY)
// ======================
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderProducts();
  updateCartUI();
}

function removeFromCart(id) {
  if (!cart[id]) return;

  cart[id] -= 1;
  if (cart[id] <= 0) delete cart[id];

  renderProducts();
  updateCartUI();
}

// ======================
// TOTAL CALC (SECURE)
// ======================
function calculateTotal() {
  let total = 0;

  for (const id in cart) {
    const product = products.find(p => p.id == id);
    if (!product) continue;

    total += product.price * cart[id];
  }

  return total;
}

function updateCartUI() {
  const total = calculateTotal();

  cartTotalEl.innerText = total.toFixed(2);

  checkoutBtn.disabled = Object.keys(cart).length === 0;
}

// ======================
// MODAL
// ======================
checkoutBtn.onclick = () => {
  modal.classList.remove("hidden");
};

closeModal.onclick = () => {
  modal.classList.add("hidden");
};

// ======================
// ORDER SUBMIT
// ======================
orderForm.onsubmit = async (e) => {
  e.preventDefault();

  const customer_name = document.getElementById("customer_name").value;
  const company_name = document.getElementById("company_name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const comment = document.getElementById("comment").value;

  const items = Object.keys(cart).map(id => {
    const product = products.find(p => p.id == id);
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      qty: cart[id],
      unit: product.unit
    };
  });

  const total = calculateTotal();

  // SAVE TO SUPABASE
  await supabase.from("orders").insert([
    {
      customer_name,
      company_name,
      phone,
      address,
      comment,
      items,
      total,
      status: "new"
    }
  ]);

  // WHATSAPP MESSAGE
  let text = `Новый заказ:%0A`;
  text += `Компания: ${company_name}%0A`;
  text += `Имя: ${customer_name}%0A%0A`;

  items.forEach(i => {
    text += `${i.name} x${i.qty} = ${i.price * i.qty} ₸%0A`;
  });

  text += `%0AИТОГО: ${total} ₸`;

  const url = `https://wa.me/${CONFIG.WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;

  // RESET FIRST (UX SAFE)
  cart = {};
  modal.classList.add("hidden");
  renderProducts();
  updateCartUI();

  window.open(url, "_blank");
};
