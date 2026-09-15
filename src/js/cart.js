import { getLocalStorage, setLocalStorage, updateCartCount } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];

  if (cartItems.length === 0) {
    document.querySelector(".product-list").innerHTML = `
      <li class="empty-cart">
        <p>Your cart is empty</p>
      </li>
    `;
    updateCartCount();
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");

  addRemoveItemListeners();
  displayCartTotal(cartItems);
  updateCartCount();
}

function addRemoveItemListeners() {
  const removeButtons = document.querySelectorAll(".cart-card__remove");

  removeButtons.forEach((button) => {
    button.addEventListener("click", removeFromCart);
  });
}

function removeFromCart(e) {
  const productId = e.currentTarget.dataset.id;
  let cartItems = getLocalStorage("so-cart") || [];

  const index = cartItems.findIndex((item) => item.Id === productId);

  if (index !== -1) {
    cartItems.splice(index, 1);
  }

  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

function displayCartTotal(cartItems) {
  const cartFooter = document.querySelector(".cart-footer");
  cartFooter.classList.remove("hide");

  // Calculate the total price of items in the cart
  const total = cartItems.reduce((sum, item) => sum + item.FinalPrice, 0);

  // Insert the total into the cart footer
  const cartTotal = document.querySelector(".cart-total");
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

function cartItemTemplate(item) {
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img src="${item.Image}" alt="${item.Name}">
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
  <span class="cart-card__remove" data-id="${item.Id}" title="Remove item">✕</span>
</li>`;

  return newItem;
}

renderCartContents();
