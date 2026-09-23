const menu = [
  {id:1,name:"Classic Smash Burger",category:"Burgers",price:650,emoji:"🍔",desc:"Double patty, cheddar, onion and signature sauce."},
  {id:2,name:"Crispy Chicken Burger",category:"Burgers",price:590,emoji:"🍗",desc:"Crispy chicken, lettuce and creamy house sauce."},
  {id:3,name:"Pepperoni Pizza",category:"Pizza",price:850,emoji:"🍕",desc:"Loaded with pepperoni, mozzarella and tomato sauce."},
  {id:4,name:"Creamy Alfredo Pasta",category:"Pizza",price:780,emoji:"🍝",desc:"Creamy parmesan sauce with herbs and tender chicken."},
  {id:5,name:"Loaded Fries",category:"Sides",price:420,emoji:"🍟",desc:"Crispy fries topped with cheese, jalapeño and sauce."},
  {id:6,name:"Chicken Wings",category:"Sides",price:520,emoji:"🍗",desc:"Six crispy wings tossed in your choice of house glaze."},
  {id:7,name:"Fresh Lemonade",category:"Drinks",price:220,emoji:"🍋",desc:"Chilled lemon, mint and sparkling water."},
  {id:8,name:"Chocolate Lava Cake",category:"Dessert",price:390,emoji:"🍫",desc:"Warm chocolate cake with a rich molten center."}
];

let cart = {};

const money = n => `Rs. ${n.toLocaleString("en-PK")}`;
const $ = id => document.getElementById(id);

function renderMenu(filter = "all") {
  const items = filter === "all" ? menu : menu.filter(x => x.category === filter);
  $("menuGrid").innerHTML = items.map(item => `
    <article class="food-card">
      <div class="food-image" aria-hidden="true">${item.emoji}</div>
      <div class="food-body">
        <div class="food-category">${item.category}</div>
        <h3 class="food-title">${item.name}</h3>
        <p class="food-desc">${item.desc}</p>
        <div class="food-bottom">
          <span class="price">${money(item.price)}</span>
          <button class="add-btn" type="button" data-add="${item.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");
}

function cartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function totals() {
  const subtotal = Object.entries(cart).reduce((sum,[id,qty]) => {
    const item = menu.find(x => x.id === Number(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const delivery = subtotal > 0 ? 120 : 0;
  return {subtotal, delivery, total: subtotal + delivery};
}

function renderCart() {
  const entries = Object.entries(cart).filter(([id,qty]) => qty > 0);
  $("cartCount").textContent = cartCount();

  if (!entries.length) {
    $("cartItems").innerHTML = `<div class="empty-cart">Your cart is empty.<br>Add something delicious from the menu.</div>`;
  } else {
    $("cartItems").innerHTML = entries.map(([id,qty]) => {
      const item = menu.find(x => x.id === Number(id));
      return `
        <div class="cart-row">
          <div class="cart-emoji">${item.emoji}</div>
          <div>
            <div class="cart-name">${item.name}</div>
            <div class="cart-price">${money(item.price)} each</div>
            <div class="qty">
              <button type="button" data-minus="${item.id}" aria-label="Decrease ${item.name}">−</button>
              <strong>${qty}</strong>
              <button type="button" data-plus="${item.id}" aria-label="Increase ${item.name}">+</button>
            </div>
          </div>
          <div class="cart-line-total">${money(item.price * qty)}</div>
        </div>
      `;
    }).join("");
  }

  const t = totals();
  $("subtotal").textContent = money(t.subtotal);
  $("delivery").textContent = money(t.delivery);
  $("total").textContent = money(t.total);
}

function add(id, amount = 1) {
  cart[id] = Math.max(0, (cart[id] || 0) + amount);
  if (cart[id] === 0) delete cart[id];
  renderCart();
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function openCart() {
  $("cartDrawer").classList.add("open");
  $("cartDrawer").setAttribute("aria-hidden","false");
  $("overlay").classList.add("show");
}

function closeCart() {
  $("cartDrawer").classList.remove("open");
  $("cartDrawer").setAttribute("aria-hidden","true");
  $("overlay").classList.remove("show");
}

$("category").addEventListener("change", e => renderMenu(e.target.value));

$("menuGrid").addEventListener("click", e => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  const id = Number(btn.dataset.add);
  add(id);
  const item = menu.find(x => x.id === id);
  toast(`${item.name} added to cart`);
});

$("cartItems").addEventListener("click", e => {
  const plus = e.target.closest("[data-plus]");
  const minus = e.target.closest("[data-minus]");
  if (plus) add(Number(plus.dataset.plus), 1);
  if (minus) add(Number(minus.dataset.minus), -1);
});

$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);

$("checkoutBtn").addEventListener("click", () => {
  if (!cartCount()) {
    toast("Add at least one item before checkout.");
    return;
  }
  closeCart();
  $("checkoutModal").hidden = false;
  $("checkoutModal").querySelector("input").focus();
});

$("closeCheckout").addEventListener("click", () => $("checkoutModal").hidden = true);

$("checkoutModal").addEventListener("click", e => {
  if (e.target === $("checkoutModal")) $("checkoutModal").hidden = true;
});

$("checkoutForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const name = String(form.get("name") || "").trim();
  if (!name) return;
  $("checkoutModal").hidden = true;
  cart = {};
  renderCart();
  e.currentTarget.reset();
  toast(`Order placed successfully, ${name}!`);
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeCart();
    $("checkoutModal").hidden = true;
  }
});

renderMenu();
renderCart();
