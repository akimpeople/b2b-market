// ======================
// CONFIG (HARD SAFE)
// ======================
const CONFIG = {
  SUPABASE_URL: "https://izzqhixtzxkjiwyquvri.supabase.co",
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6enFoaXh0enhraml3eXF1dnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTIwODEsImV4cCI6MjA5NTAyODA4MX0.5vrBFp2WTNFlxPkhuQgPDlhq5t20JZUETT3c_rD84aM",
  ADMIN_PASSWORD: "4958"
};

// ======================
// SAFE CHECK - STOP IF DOM BROKEN
// ======================
window.addEventListener("DOMContentLoaded", async () => {
  try {

    const app = document.getElementById("app");

    if (!window.supabase) {
      document.body.innerHTML = "<h2>Supabase CDN не загрузился</h2>";
      return;
    }

    const supabase = window.supabase.createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_KEY
    );

    // ======================
    // AUTH
    // ======================
    const password = prompt("Admin password");

    if (password !== CONFIG.ADMIN_PASSWORD) {
      document.body.innerHTML = "<h1>Access denied</h1>";
      return;
    }

    // ======================
    // LOAD DATA
    // ======================
    const { data: orders } = await supabase.from("orders").select("*");

    const { data: products } = await supabase.from("products").select("*");

    // ======================
    // RENDER SIMPLE UI FIRST (NO CRASH RISK)
    // ======================
    app.innerHTML = `
      <div style="font-family:Arial;padding:20px">
        <h1>CRM WORKING</h1>

        <h2>Orders: ${orders?.length || 0}</h2>
        <h2>Products: ${products?.length || 0}</h2>

        <p>Если это видно — Supabase работает</p>
      </div>
    `;

  } catch (e) {
    document.body.innerHTML = `
      <h2>JS ERROR</h2>
      <pre>${e.message}</pre>
    `;
  }
});    .order("created_at", { ascending: false });

  if (error) console.error(error);

  products = data || [];
}

// ======================
// RENDER BASE
// ======================
function render() {
  app.innerHTML = `
    <div class="admin">
      <h1>CRM Dashboard</h1>

      <div class="tabs">
        <button onclick="setTab('orders')">Заказы</button>
        <button onclick="setTab('products')">Товары</button>
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
// ORDERS
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
              <td>${o.company_name || ""}</td>
              <td>${o.customer_name || ""}</td>
              <td>${o.phone || ""}</td>
              <td>${o.total || 0} ₸</td>
              <td>
                <select onchange="updateStatus(${o.id}, this.value)">
                  <option value="new" ${o.status==="new"?"selected":""}>New</option>
                  <option value="processing" ${o.status==="processing"?"selected":""}>В работе</option>
                  <option value="done" ${o.status==="done"?"selected":""}>Выполнен</option>
                </select>
              </td>
              <td>
                <button onclick="deleteOrder(${o.id})">Удалить</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// ======================
// PRODUCTS
// ======================
function renderProducts(container) {
  container.innerHTML = `
    <h2>Товары</h2>

    <div class="product-form">
      <input id="p_name" placeholder="Название"/>
      <input id="p_price" placeholder="Цена"/>
      <input id="p_unit" placeholder="Ед. изм."/>
      <button onclick="addProduct()">Добавить</button>
    </div>

    <button onclick="seedProducts()">Загрузить базовые товары</button>

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
              <td contenteditable onblur="editProduct(${p.id}, 'name', this.innerText)">${p.name}</td>
              <td contenteditable onblur="editProduct(${p.id}, 'price', this.innerText)">${p.price}</td>
              <td contenteditable onblur="editProduct(${p.id}, 'unit', this.innerText)">${p.unit}</td>
              <td>
                <button onclick="deleteProduct(${p.id})">Удалить</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// ======================
// ACTIONS
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

window.addProduct = async () => {
  const name = document.getElementById("p_name").value;
  const price = Number(document.getElementById("p_price").value);
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
};    <div class="admin">
      <h1>CRM Dashboard</h1>

      <div class="tabs">
        <button id="tabOrders">Заказы</button>
        <button id="tabProducts">Товары</button>
      </div>

      <div id="content"></div>
    </div>
  `;

  document.getElementById("tabOrders").onclick = () => setTab("orders");
  document.getElementById("tabProducts").onclick = () => setTab("products");

  setTab(activeTab);
}

// ======================
// SWITCH TAB
// ======================
function setTab(tab) {
  activeTab = tab;
  const content = document.getElementById("content");

  if (tab === "orders") renderOrders(content);
  if (tab === "products") renderProducts(content);
}

// ======================
// ORDERS
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .map(
              (o) => `
            <tr>
              <td>${o.id}</td>
              <td>${o.company_name}</td>
              <td>${o.customer_name}</td>
              <td>${o.phone || ""}</td>
              <td>${Math.round(o.total)} ₸</td>
              <td>
                <select onchange="updateStatus(${o.id}, this.value)">
                  <option value="new" ${
                    o.status === "new" ? "selected" : ""
                  }>New</option>
                  <option value="processing" ${
                    o.status === "processing" ? "selected" : ""
                  }>В работе</option>
                  <option value="done" ${
                    o.status === "done" ? "selected" : ""
                  }>Выполнен</option>
                </select>
              </td>
              <td>
                <button onclick="deleteOrder(${o.id})">Удалить</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

// ======================
// PRODUCTS
// ======================
function renderProducts(container) {
  container.innerHTML = `
    <h2>Товары</h2>

    <div class="product-form">
      <input id="p_name" placeholder="Название"/>
      <input id="p_price" placeholder="Цена"/>
      <input id="p_unit" placeholder="Ед. изм."/>
      <button id="addProductBtn">Добавить</button>
    </div>

    <button id="seedBtn">Загрузить базовые товары</button>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Цена</th>
            <th>Ед</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (p) => `
            <tr>
              <td contenteditable onblur="editProduct(${p.id}, 'name', this.innerText)">${p.name}</td>
              <td contenteditable onblur="editProduct(${p.id}, 'price', this.innerText)">${p.price}</td>
              <td contenteditable onblur="editProduct(${p.id}, 'unit', this.innerText)">${p.unit}</td>
              <td>
                <button onclick="deleteProduct(${p.id})">Удалить</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById("addProductBtn").onclick = addProduct;
  document.getElementById("seedBtn").onclick = seedProducts;
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
async function addProduct() {
  const name = document.getElementById("p_name").value.trim();
  const price = Number(document.getElementById("p_price").value);
  const unit = document.getElementById("p_unit").value.trim();

  if (!name || !price || !unit) return;

  await supabase.from("products").insert([{ name, price, unit }]);

  await loadProducts();
  render();
}

window.editProduct = async (id, field, value) => {
  const update = {};

  if (field === "price") {
    update[field] = Number(value) || 0;
  } else {
    update[field] = value.trim();
  }

  await supabase.from("products").update(update).eq("id", id);
};

window.deleteProduct = async (id) => {
  await supabase.from("products").delete().eq("id", id);
  await loadProducts();
  render();
};

// ======================
// SEED (SAFE)
// ======================
async function seedProducts() {
  const { data } = await supabase.from("products").select("id");

  if (data && data.length > 0) {
    alert("Товары уже существуют");
    return;
  }

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
  ].map(([name, price, unit]) => ({ name, price, unit }));

  await supabase.from("products").insert(seed);

  await loadProducts();
  render();
}      <h1>CRM Dashboard</h1>

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
