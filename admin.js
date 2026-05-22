import { CONFIG } from "./config.js";

const supabase = window.supabase.createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_KEY
);

// ======================
// AUTH GATE (SIMPLE)
// ======================
const password = prompt("Введите пароль администратора");

const app = document.getElementById("app");

if (password !== CONFIG.ADMIN_PASSWORD) {
  document.body.innerHTML = "<h1 style='padding:40px;font-family:sans-serif;'>Доступ запрещен</h1>";
  throw new Error("Unauthorized");
}

// ======================
// STATE
// ======================
let orders = [];
let products = [];
let activeTab = "orders";

// ======================
// INIT
// ======================
init();

async function init() {
  await loadOrders();
  await loadProducts();
  render();
}

// ======================
// LOAD ORDERS
// ======================
async function loadOrders() {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  orders = data || [];
}

// ======================
// LOAD PRODUCTS
// ======================
async function loadProducts() {
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  products = data || [];
}

// ======================
// RENDER
// ======================
function render() {
  app.innerHTML = `
    <div class="admin">

      <h1>CRM Dashboard</h1>

      <div class="tabs">
        <button onclick="window.setTab('orders')">Заказы</button>
        <button onclick="window.setTab('products')">Товары</button>
      </div>

      <div id="content"></div>

    </div>
  `;

  window.setTab = setTab;
  setTab(activeTab);
}

// ======================
// TAB SWITCH
// ======================
function setTab(tab) {
  activeTab = tab;

  const content = document.getElementById("content");

  if (tab === "orders") renderOrders(content);
  if (tab === "products") renderProducts(content);
}

// ======================
// ORDERS UI
// ======================
function renderOrders(container) {
  container.innerHTML = `
    <h2>Заказы</h2>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Компания</th>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td>${o.id}</td>
              <td>${o.company_name}</td>
              <td>${o.customer_name}</td>
              <td>${o.phone || ""}</td>
              <td>${o.total} ₸</td>
              <td>
                <select onchange="window.updateStatus(${o.id}, this.value)">
                  <option value="new" ${o.status==="new"?"selected":""}>New</option>
                  <option value="processing" ${o.status==="processing"?"selected":""}>В работе</option>
                  <option value="done" ${o.status==="done"?"selected":""}>Выполнен</option>
                </select>
              </td>
              <td>
                <button onclick="window.deleteOrder(${o.id})">Удалить</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// ======================
// PRODUCTS UI
// ======================
function renderProducts(container) {
  container.innerHTML = `
    <h2>Товары</h2>

    <div class="product-form">
      <input id="p_name" placeholder="Название"/>
      <input id="p_price" placeholder="Цена"/>
      <input id="p_unit" placeholder="Ед. изм."/>
      <button onclick="window.addProduct()">Добавить</button>
    </div>

    <button onclick="window.seedProducts()">Загрузить базовые товары</button>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Цена</th>
            <th>Ед</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td contenteditable onblur="window.editProduct(${p.id}, 'name', this.innerText)">${p.name}</td>
              <td contenteditable onblur="window.editProduct(${p.id}, 'price', this.innerText)">${p.price}</td>
              <td contenteditable onblur="window.editProduct(${p.id}, 'unit', this.innerText)">${p.unit}</td>
              <td>
                <button onclick="window.deleteProduct(${p.id})">Удалить</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// ======================
// ORDERS ACTIONS
// ======================
window.updateStatus = async (id, status) => {
  await supabase.from("orders").update({ status }).eq("id", id);
  await loadOrders();
  render();
};

window.deleteOrder = async (id) => {
  await supabase.from("orders").delete().eq("id", id);
  await loadOrders();
  render();
};

// ======================
// PRODUCTS ACTIONS
// ======================
window.addProduct = async () => {
  const name = document.getElementById("p_name").value;
  const price = document.getElementById("p_price").value;
  const unit = document.getElementById("p_unit").value;

  await supabase.from("products").insert([{ name, price, unit }]);

  await loadProducts();
  render();
};

window.editProduct = async (id, field, value) => {
  const update = {};
  update[field] = field === "price" ? Number(value) : value;

  await supabase.from("products").update(update).eq("id", id);
};

window.deleteProduct = async (id) => {
  await supabase.from("products").delete().eq("id", id);
  await loadProducts();
  render();
};

// ======================
// SEED DATA
// ======================
window.seedProducts = async () => {
  const seed = [
    ["Грибы шампиньоны", 2700, "кг"],
    ["Кабачки", 500, "кг"],
    ["Капуста б/к", 110, "кг"],
    ["Картошка", 250, "кг"],
    ["Кинза", 2000, "кг"],
    ["Лук зеленый", 1700, "кг"],
    ["Помидор черри красный", 1400, "кг"],
    ["Редиска пучковая", 250, "шт"],
    ["Грибы иноки", 300, "шт"],
    ["Дайкон", 600, "кг"],
    ["Имбирь", 1700, "кг"],
    ["Капуста пекинская", 350, "кг"],
    ["Лук репчатый", 150, "кг"],
    ["Морковь", 340, "кг"],
    ["Лук красный", 500, "кг"],
    ["Перец обычный", 1400, "кг"],
    ["Перец светофор", 1400, "кг"],
    ["Помидор красный", 500, "кг"],
    ["Чеснок", 1250, "кг"],
    ["Салат", 1200, "кг"]
  ].map(i => ({
    name: i[0],
    price: i[1],
    unit: i[2]
  }));

  await supabase.from("products").insert(seed);

  await loadProducts();
  render();
};