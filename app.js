// ============================================================
//  EUROPE BIKES MONGOLIA — app.js
//  GitHub Pages дээр шууд ажиллана (localStorage ашиглана)
// ============================================================

// ── INITIAL DATA ─────────────────────────────────────────────
const SEED_PRODUCTS = [
  { id: 1, name: "Trek Marlin 7", category: "mountain", price: 3200000, image: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=600&q=80", desc: "Уулын замд зориулсан өндөр чанарын дугуй. 29\" дугуй, Shimano Deore дамжуулга, гидравлик тормоз.", stock: 5, featured: true },
  { id: 2, name: "Canyon Endurace CF 7", category: "road", price: 5800000, image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80", desc: "Хурдны замын карбон хүрээтэй дугуй. Shimano Ultegra дамжуулга, аэродинамик загвар.", stock: 3, featured: true },
  { id: 3, name: "Specialized Turbo Vado", category: "ebike", price: 8900000, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", desc: "Цахилгаан хөдөлгүүртэй хотын дугуй. 90км зайтай, хурдан цэнэглэлттэй.", stock: 4, featured: true },
  { id: 4, name: "Giro Aether MIPS Helmet", category: "accessories", price: 450000, image: "https://images.unsplash.com/photo-1565767157a8f4b3a93b9e0f9c32c15c6d2e8e?w=600&q=80", desc: "MIPS технологитой аюулгүй дуулга. Хөнгөн жинтэй, агааржуулалттай.", stock: 15, featured: false },
  { id: 5, name: "Scott Scale 970", category: "mountain", price: 2800000, image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600&q=80", desc: "Алюминий хүрээтэй уулын дугуй. 27.5\" дугуй, найдвартай тормоз.", stock: 7, featured: false },
  { id: 6, name: "Shimano 105 Pedal Set", category: "accessories", price: 120000, image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80", desc: "SPD-SL clipless педал. Мэргэжлийн дугуйчдад зориулсан.", stock: 20, featured: false },
  { id: 7, name: "Giant Defy Advanced", category: "road", price: 6500000, image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&q=80", desc: "Замын дугуй. Карбон хүрээ, Shimano Ultegra, эвтэйхэн байрлал.", stock: 2, featured: false },
  { id: 8, name: "Bosch E-Bike CX Pro", category: "ebike", price: 7200000, image: "https://images.unsplash.com/photo-1580933073521-dc49ac0d4e6a?w=600&q=80", desc: "Bosch CX хөдөлгүүр, 625Wh батарей. 120км зай, 4 туслалцааны горим.", stock: 3, featured: false },
];

const CAT_LABELS = { mountain: "⛰️ Уулын", road: "🛣️ Замын", ebike: "⚡ Цахилгаан", accessories: "🔧 Аксессуар" };

// ── STATE ─────────────────────────────────────────────────────
let state = {
  products: [],
  cart: [],
  orders: [],
  user: null,
  currentPage: "home",
  shopCategory: "all",
  shopSearch: "",
  detailProduct: null,
  detailQty: 1,
  editProductId: null,
  paymentMethod: "cash",
  dark: false,
};

// ── PERSISTENCE ───────────────────────────────────────────────
function save() {
  localStorage.setItem("ebm_products", JSON.stringify(state.products));
  localStorage.setItem("ebm_cart", JSON.stringify(state.cart));
  localStorage.setItem("ebm_orders", JSON.stringify(state.orders));
  localStorage.setItem("ebm_user", JSON.stringify(state.user));
  localStorage.setItem("ebm_dark", state.dark ? "1" : "0");
}
function load() {
  const p = localStorage.getItem("ebm_products");
  state.products = p ? JSON.parse(p) : [...SEED_PRODUCTS];
  const c = localStorage.getItem("ebm_cart");
  state.cart = c ? JSON.parse(c) : [];
  const o = localStorage.getItem("ebm_orders");
  state.orders = o ? JSON.parse(o) : [];
  const u = localStorage.getItem("ebm_user");
  state.user = u ? JSON.parse(u) : null;
  state.dark = localStorage.getItem("ebm_dark") === "1";
}

// ── FORMAT ────────────────────────────────────────────────────
function fmt(n) { return "₮" + Number(n).toLocaleString("mn-MN"); }

// ── NOTIFY ────────────────────────────────────────────────────
function notify(msg, type = "success") {
  const el = document.getElementById("notification");
  el.textContent = (type === "success" ? "✓ " : "✕ ") + msg;
  el.className = "notification " + type;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3000);
}

// ── NAVIGATION ────────────────────────────────────────────────
function navigate(page) {
  state.currentPage = page;
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const el = document.getElementById("page-" + page);
  if (el) el.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderPage(page);
  updateNavUI();
  closeMobileMenu();
}

function renderPage(page) {
  if (page === "home") renderHome();
  else if (page === "shop") renderShop();
  else if (page === "product") renderProductDetail();
  else if (page === "cart") renderCart();
  else if (page === "checkout") renderCheckout();
  else if (page === "orders") renderOrders();
  else if (page === "admin") renderAdmin();
}

function updateNavUI() {
  // Nav buttons active state
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.page === state.currentPage);
  });
  // Auth button
  const btn = document.getElementById("authBtn");
  if (state.user) {
    btn.textContent = state.user.name;
    btn.className = "auth-btn outline";
    btn.onclick = doLogout;
  } else {
    btn.textContent = "Нэвтрэх";
    btn.className = "auth-btn";
    btn.onclick = () => navigate("login");
  }
  // Admin nav
  const adminNav = document.getElementById("adminNavBtn");
  if (state.user?.isAdmin) adminNav.classList.remove("hidden");
  else adminNav.classList.add("hidden");
  // Mobile admin
  const mobileAdmin = document.getElementById("mobileAdminBtn");
  if (state.user?.isAdmin) mobileAdmin.classList.remove("hidden");
  else mobileAdmin.classList.add("hidden");
  // Mobile auth
  document.getElementById("mobileAuthBtn").textContent = state.user ? "🚪 Гарах" : "🔑 Нэвтрэх";
  document.getElementById("mobileAuthBtn").onclick = state.user ? doLogout : () => navigate("login");
  // Cart badge
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById("cartBadge");
  badge.textContent = count;
  badge.classList.toggle("hidden", count === 0);
}

// ── DARK MODE ─────────────────────────────────────────────────
function toggleDark() {
  state.dark = !state.dark;
  document.body.className = state.dark ? "dark" : "light";
  document.querySelector(".icon-btn[onclick='toggleDark()']").textContent = state.dark ? "☀️" : "🌙";
  save();
}

// ── MOBILE MENU ───────────────────────────────────────────────
function toggleMobileMenu() {
  const m = document.getElementById("mobileMenu");
  m.classList.toggle("hidden");
}
function closeMobileMenu() {
  document.getElementById("mobileMenu").classList.add("hidden");
}

// ── HOME ──────────────────────────────────────────────────────
function renderHome() {
  // Category counts
  ["mountain","road","ebike","accessories"].forEach(cat => {
    const el = document.getElementById("cnt-" + cat);
    if (el) el.textContent = state.products.filter(p => p.category === cat).length + " бараа";
  });
  // Featured grid
  const featured = state.products.filter(p => p.featured);
  const grid = document.getElementById("featuredGrid");
  if (grid) grid.innerHTML = featured.map(p => productCardHTML(p)).join("");
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function filterAndGo(cat) {
  state.shopCategory = cat;
  state.shopSearch = "";
  navigate("shop");
  setTimeout(() => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b.dataset.cat === cat));
    const inp = document.getElementById("searchInput");
    if (inp) inp.value = "";
    renderShopGrid();
  }, 50);
}

// ── PRODUCT CARD HTML ─────────────────────────────────────────
function productCardHTML(p) {
  const cat = CAT_LABELS[p.category] || p.category;
  const lowStock = p.stock < 5;
  return `
    <div class="product-card">
      <div class="product-img-wrap" onclick="openProduct(${p.id})">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/600x400/141414/22c55e?text=🚲'" loading="lazy" />
        <span class="product-tag">${cat}</span>
        ${lowStock ? `<span class="product-tag-low">Бага үлдсэн</span>` : ""}
      </div>
      <div class="product-body">
        <div class="product-name" onclick="openProduct(${p.id})">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <span class="product-price">${fmt(p.price)}</span>
          <button class="btn-primary" style="padding:9px 18px;font-size:13px" onclick="addToCart(${p.id})">+ Сагс</button>
        </div>
      </div>
    </div>`;
}

// ── SHOP ──────────────────────────────────────────────────────
function renderShop() {
  const inp = document.getElementById("searchInput");
  if (inp) inp.value = state.shopSearch;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b.dataset.cat === state.shopCategory));
  renderShopGrid();
}

function renderShopGrid() {
  let filtered = state.products;
  if (state.shopCategory !== "all") filtered = filtered.filter(p => p.category === state.shopCategory);
  if (state.shopSearch) {
    const q = state.shopSearch.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }
  const grid = document.getElementById("shopGrid");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("shopCount");
  if (count) count.textContent = filtered.length + " бүтээгдэхүүн олдлоо";
  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
  } else {
    empty.classList.add("hidden");
    grid.innerHTML = filtered.map(p => productCardHTML(p)).join("");
  }
}

function setCat(cat, btn) {
  state.shopCategory = cat;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderShopGrid();
}

function filterProducts() {
  state.shopSearch = document.getElementById("searchInput").value;
  renderShopGrid();
}

// ── PRODUCT DETAIL ────────────────────────────────────────────
function openProduct(id) {
  state.detailProduct = state.products.find(p => p.id === id);
  state.detailQty = 1;
  navigate("product");
}

function renderProductDetail() {
  const p = state.detailProduct;
  if (!p) return;
  const cat = CAT_LABELS[p.category] || p.category;
  const el = document.getElementById("productDetail");
  el.innerHTML = `
    <div class="product-detail">
      <div>
        <img class="product-detail-img" src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/600x440/141414/22c55e?text=🚲'" />
      </div>
      <div class="product-detail-info">
        <span class="product-detail-tag">${cat}</span>
        <h1 class="product-detail-name">${p.name}</h1>
        <p class="product-detail-desc">${p.desc}</p>
        <div class="product-detail-price">${fmt(p.price)}</div>
        <div class="product-meta">
          <div class="product-meta-row">
            <span style="color:var(--text-muted)">Үлдэгдэл:</span>
            <span style="font-weight:700;color:${p.stock > 5 ? 'var(--accent)' : 'var(--warning)'}">${p.stock} ширхэг</span>
          </div>
          <div class="product-meta-row">
            <span style="color:var(--text-muted)">Ангилал:</span>
            <span style="font-weight:600">${cat}</span>
          </div>
          <div class="product-meta-row">
            <span style="color:var(--text-muted)">Баталгаа:</span>
            <span style="font-weight:700">2 жил</span>
          </div>
        </div>
        <div class="detail-actions">
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="changeDetailQty(-1)">−</button>
            <span class="qty-val" id="detailQtyVal">${state.detailQty}</span>
            <button class="qty-btn" onclick="changeDetailQty(1)">+</button>
          </div>
          <button class="btn-primary" style="flex:1;padding:13px;font-size:16px" onclick="addDetailToCart()">🛒 Сагсанд нэмэх</button>
        </div>
        <div class="detail-badges">
          <span>✓ Баталгаатай бараа</span>
          <span>✓ Хурдан хүргэлт</span>
          <span>✓ Буцаалт боломжтой</span>
        </div>
      </div>
    </div>`;
}

function changeDetailQty(d) {
  state.detailQty = Math.max(1, state.detailQty + d);
  const el = document.getElementById("detailQtyVal");
  if (el) el.textContent = state.detailQty;
}

function addDetailToCart() {
  const p = state.detailProduct;
  if (!p) return;
  for (let i = 0; i < state.detailQty; i++) addToCart(p.id);
  navigate("cart");
}

// ── CART ──────────────────────────────────────────────────────
function addToCart(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  const existing = state.cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else state.cart.push({ ...p, qty: 1 });
  save();
  updateNavUI();
  notify(p.name + " сагсанд нэмэгдлээ!");
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  save();
  updateNavUI();
  renderCart();
}

function updateCartQty(id, qty) {
  if (qty < 1) { removeFromCart(id); return; }
  const item = state.cart.find(i => i.id === id);
  if (item) { item.qty = qty; save(); updateNavUI(); renderCart(); }
}

function renderCart() {
  const empty = document.getElementById("cartEmpty");
  const content = document.getElementById("cartContent");
  if (state.cart.length === 0) {
    empty.classList.remove("hidden");
    content.classList.add("hidden");
    return;
  }
  empty.classList.add("hidden");
  content.classList.remove("hidden");

  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);

  document.getElementById("cartItems").innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/82x82/141414/22c55e?text=🚲'" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)}</div>
      </div>
      <div class="cart-item-controls">
        <div class="qty-mini">
          <button onclick="updateCartQty(${item.id}, ${item.qty - 1})">−</button>
          <span>${item.qty}</span>
          <button onclick="updateCartQty(${item.id}, ${item.qty + 1})">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button>
      </div>
    </div>`).join("");

  document.getElementById("cartSummaryItems").innerHTML = state.cart.map(i =>
    `<div class="cart-summary-item"><span>${i.name} × ${i.qty}</span><span>${fmt(i.price * i.qty)}</span></div>`
  ).join("");

  document.getElementById("cartTotalAmt").textContent = fmt(total);

  const hint = document.getElementById("cartLoginHint");
  if (!state.user) hint.textContent = "Захиалга хийхэд нэвтрэх шаардлагатай";
  else hint.textContent = "";
}

function goCheckout() {
  if (!state.user) { notify("Нэвтрэх шаардлагатай", "error"); navigate("login"); return; }
  navigate("checkout");
}

// ── CHECKOUT ──────────────────────────────────────────────────
function renderCheckout() {
  document.getElementById("checkoutSuccess").classList.add("hidden");
  document.getElementById("checkoutForm").classList.remove("hidden");
  if (state.user) document.getElementById("coName").value = state.user.name || "";
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById("checkoutItems").innerHTML = state.cart.map(i =>
    `<div class="cart-summary-item" style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px"><span style="color:var(--text-muted)">${i.name} × ${i.qty}</span><span style="font-weight:600">${fmt(i.price * i.qty)}</span></div>`
  ).join("");
  document.getElementById("checkoutTotal").textContent = fmt(total);
}

function selectPay(method, btn) {
  state.paymentMethod = method;
  document.querySelectorAll(".pay-opt").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function submitOrder() {
  const name = document.getElementById("coName").value.trim();
  const phone = document.getElementById("coPhone").value.trim();
  const address = document.getElementById("coAddress").value.trim();
  const note = document.getElementById("coNote").value.trim();
  if (!name || !phone || !address) { notify("Нэр, утас, хаягаа бөглөнө үү", "error"); return; }
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const order = {
    id: Date.now(),
    items: [...state.cart],
    total,
    name, phone, address, note,
    payment: state.paymentMethod,
    date: new Date().toLocaleString("mn-MN"),
    status: "Хүлээгдэж байна",
    userId: state.user?.email || "guest",
  };
  state.orders.unshift(order);
  state.cart = [];
  save();
  updateNavUI();
  document.getElementById("checkoutSuccess").classList.remove("hidden");
  document.getElementById("checkoutForm").classList.add("hidden");
}

// ── AUTH ──────────────────────────────────────────────────────
function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;
  if (!email || !pass) { notify("Талбаруудаа бөглөнө үү", "error"); return; }
  if (email === "admin@europebikes.mn" && pass === "admin123") {
    state.user = { name: "Админ", email, isAdmin: true };
    save(); updateNavUI();
    notify("Тавтай морилно уу, Админ!");
    navigate("admin");
  } else if (email && pass.length >= 4) {
    state.user = { name: email.split("@")[0], email, isAdmin: false };
    save(); updateNavUI();
    notify("Амжилттай нэвтэрлээ!");
    navigate("home");
  } else {
    notify("Имэйл эсвэл нууц үг буруу", "error");
  }
}

function doRegister() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPass").value;
  if (!name || !email) { notify("Нэр болон имэйлээ бөглөнө үү", "error"); return; }
  if (pass.length < 6) { notify("Нууц үг дор хаяж 6 тэмдэгт байна", "error"); return; }
  state.user = { name, email, isAdmin: false };
  save(); updateNavUI();
  notify("Бүртгэл амжилттай үүслээ!");
  navigate("home");
}

function doLogout() {
  state.user = null;
  save(); updateNavUI();
  notify("Амжилттай гарлаа!");
  navigate("home");
}

// ── ORDERS ────────────────────────────────────────────────────
function renderOrders() {
  const myOrders = state.user
    ? state.orders.filter(o => o.userId === state.user.email)
    : [];
  const el = document.getElementById("ordersList");
  if (myOrders.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><p>Захиалга байхгүй</p><button class="btn-primary" onclick="navigate('shop')">Дэлгүүр рүү очих</button></div>`;
    return;
  }
  el.innerHTML = myOrders.map(o => `
    <div class="order-card">
      <div class="order-header">
        <span class="order-id">Захиалга #${o.id}</span>
        <span class="order-status">${o.status}</span>
      </div>
      <div class="order-meta">${o.date} · ${o.name} · ${o.phone}</div>
      ${o.items.map(i => `<div class="order-item">• ${i.name} × ${i.qty} — ${fmt(i.price * i.qty)}</div>`).join("")}
      <div class="order-total">Нийт: ${fmt(o.total)}</div>
    </div>`).join("");
}

// ── ADMIN ─────────────────────────────────────────────────────
let adminTab = "list";

function renderAdmin() {
  if (!state.user?.isAdmin) {
    document.getElementById("page-admin").innerHTML = `
      <div class="container" style="padding-top:80px;text-align:center">
        <div style="font-size:64px;margin-bottom:20px">🔒</div>
        <h2 style="font-size:22px;font-weight:700;margin-bottom:16px">Зөвхөн Админ хандах боломжтой</h2>
        <button class="btn-primary" onclick="navigate('login')">Нэвтрэх</button>
      </div>`;
    return;
  }
  document.getElementById("adminProductCount").textContent = state.products.length;
  document.getElementById("adminOrderCount").textContent = state.orders.length;
  renderAdminGrid();
  renderAdminOrders();
}

function setAdminTab(tab, btn) {
  adminTab = tab;
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".admin-tab-content").forEach(el => el.classList.remove("active"));
  document.getElementById("adminTab" + capitalize(tab)).classList.add("active");
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function renderAdminGrid() {
  const grid = document.getElementById("adminGrid");
  if (!grid) return;
  grid.innerHTML = state.products.map(p => `
    <div class="admin-product-card">
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/280x160/141414/22c55e?text=🚲'" loading="lazy" />
      <div class="admin-card-body">
        <div class="admin-card-name">${p.name}</div>
        <div class="admin-card-price">${fmt(p.price)}</div>
        <div class="admin-card-stock">Үлдэгдэл: ${p.stock} · ${CAT_LABELS[p.category] || p.category}</div>
        <div class="admin-card-actions">
          <button class="btn-edit" onclick="startEdit(${p.id})">✏️ Засах</button>
          <button class="btn-danger" onclick="deleteProduct(${p.id})">🗑️ Устгах</button>
        </div>
      </div>
    </div>`).join("");
}

function renderAdminOrders() {
  const el = document.getElementById("adminOrdersList");
  const empty = document.getElementById("adminOrdersEmpty");
  if (!el) return;
  if (state.orders.length === 0) {
    el.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  el.innerHTML = state.orders.map(o => `
    <div class="order-card">
      <div class="order-header">
        <span class="order-id">Захиалга #${o.id}</span>
        <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding:4px 10px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-family:inherit;font-size:13px">
          ${["Хүлээгдэж байна","Баталгаажсан","Бэлдэгдэж байна","Хүргэгдэж байна","Хүргэгдсэн","Цуцлагдсан"].map(s => `<option value="${s}" ${o.status===s?"selected":""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="order-meta">${o.date} · ${o.name} · ${o.phone} · ${o.address}</div>
      <div class="order-meta">Төлбөр: ${o.payment === "cash" ? "💵 Бэлэн мөнгө" : "🏦 Шилжүүлэг"}</div>
      ${o.items.map(i => `<div class="order-item">• ${i.name} × ${i.qty} — ${fmt(i.price * i.qty)}</div>`).join("")}
      <div class="order-total">Нийт: ${fmt(o.total)}</div>
    </div>`).join("");
}

function updateOrderStatus(id, status) {
  const o = state.orders.find(x => x.id === id);
  if (o) { o.status = status; save(); notify("Захиалгын төлөв шинэчлэгдлээ"); }
}

function startEdit(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  state.editProductId = id;
  document.getElementById("editId").value = id;
  document.getElementById("pName").value = p.name;
  document.getElementById("pPrice").value = p.price;
  document.getElementById("pStock").value = p.stock;
  document.getElementById("pCat").value = p.category;
  document.getElementById("pImage").value = p.image;
  document.getElementById("pDesc").value = p.desc;
  document.getElementById("pFeatured").checked = p.featured;
  document.getElementById("adminFormTitle").textContent = "Бараа засах: " + p.name;
  document.getElementById("cancelEditBtn").style.display = "block";
  // Switch to add tab
  const addTabBtn = document.getElementById("addTabBtn");
  setAdminTab("add", addTabBtn);
  window.scrollTo({ top: 300, behavior: "smooth" });
}

function cancelEdit() {
  state.editProductId = null;
  document.getElementById("editId").value = "";
  document.getElementById("pName").value = "";
  document.getElementById("pPrice").value = "";
  document.getElementById("pStock").value = "";
  document.getElementById("pImage").value = "";
  document.getElementById("pDesc").value = "";
  document.getElementById("pFeatured").checked = false;
  document.getElementById("adminFormTitle").textContent = "Шинэ бараа нэмэх";
  document.getElementById("cancelEditBtn").style.display = "none";
  const listBtn = document.querySelector(".tab-btn");
  setAdminTab("list", listBtn);
}

function saveProduct() {
  const name = document.getElementById("pName").value.trim();
  const price = parseFloat(document.getElementById("pPrice").value);
  if (!name || !price) { notify("Нэр болон үнэ заавал бөглөнө үү", "error"); return; }
  const data = {
    name,
    price,
    stock: parseInt(document.getElementById("pStock").value) || 10,
    category: document.getElementById("pCat").value,
    image: document.getElementById("pImage").value.trim() || "https://placehold.co/600x400/141414/22c55e?text=🚲",
    desc: document.getElementById("pDesc").value.trim(),
    featured: document.getElementById("pFeatured").checked,
  };
  if (state.editProductId) {
    const idx = state.products.findIndex(p => p.id === state.editProductId);
    if (idx !== -1) state.products[idx] = { ...data, id: state.editProductId };
    notify("Бараа амжилттай шинэчлэгдлээ!");
  } else {
    data.id = Date.now();
    state.products.push(data);
    notify("Шинэ бараа амжилттай нэмэгдлээ!");
  }
  save();
  cancelEdit();
  document.getElementById("adminProductCount").textContent = state.products.length;
  renderAdminGrid();
}

function deleteProduct(id) {
  if (!confirm("Энэ барааг устгах уу?")) return;
  state.products = state.products.filter(p => p.id !== id);
  save();
  notify("Бараа устгагдлаа");
  document.getElementById("adminProductCount").textContent = state.products.length;
  renderAdminGrid();
}

// ── INIT ──────────────────────────────────────────────────────
function init() {
  load();
  document.body.className = state.dark ? "dark" : "light";
  if (state.dark) document.querySelector(".icon-btn[onclick='toggleDark()']").textContent = "☀️";
  updateNavUI();
  navigate("home");
}

document.addEventListener("DOMContentLoaded", init);
