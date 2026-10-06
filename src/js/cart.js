import { loadHeaderFooter, updateCartCount, alertMessage } from "./utils.mjs";
import ShoppingCart from "./ShoppingCart.mjs";
import Wishlist from "./WishList.mjs";

// Initialize the shopping cart

// Get the list and footer elements
const listElement = document.querySelector(".cart-list");
const footerElement = document.querySelector(".cart-footer");

// Create an instance of the shopping cart
const shoppingCart = new ShoppingCart(listElement, footerElement);

// Initialize the shopping cart
shoppingCart.init();

addMoveToWishlistListeners();

// Initialize the wishlist
const wishlist = new Wishlist();
const wishlistListElement = document.querySelector("#wishlist-list");

// Render the wishlist
function renderWishlist() {
  if (!wishlistListElement) return;

  const items = wishlist.getItems();

  if (items.length === 0) {
    wishlistListElement.innerHTML = `
      <li class="empty-wishlist">
        <p>Your wishlist is empty.</p>
      </li>
    `;
    return;
  }

  wishlistListElement.innerHTML = items.map(wishlistItemTemplate).join("");
  addWishlistListeners();
}

function wishlistItemTemplate(item) {
  const imageUrl =
    item.Images?.PrimaryMedium ||
    item.Images?.PrimarySmall ||
    "/images/placeholder.jpg";
  const price = item.FinalPrice || 0;
  const colorName =
    item.SelectedColor?.ColorName || item.Colors?.[0]?.ColorName || "";

  return `
    <li class="wishlist-card divider">
      <a href="/product_pages/?product=${item.Id}&category=${item.Category || ""}" class="wishlist-card__image">
        <img src="${imageUrl}" alt="${item.Name}" />
      </a>
      <div class="wishlist-card__info">
        <h2 class="card__name">${item.Name}</h2>
        <p class="wishlist-card__color">${colorName}</p>
        <p class="wishlist-card__price">$${price.toFixed(2)}</p>
      </div>
      <button class="move-to-cart-btn" data-id="${item.Id}">Move to Cart</button>
    </li>
  `;
}

function addWishlistListeners() {
  const moveButtons = document.querySelectorAll(".move-to-cart-btn");
  moveButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      const success = wishlist.moveToCart(id);
      if (success) {
        updateCartCount();
        alertMessage(" Item moved to cart!");
        window.location.reload();
      }
    });
  });
}

// Add listeners to "Move to Wishlist" buttons in the cart
function addMoveToWishlistListeners() {
  const moveButtons = document.querySelectorAll(".move-to-wishlist-btn");
  moveButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      const item = shoppingCart.cartItems.find((i) => i.Id === id);
      if (!item) return;

      const added = wishlist.addItem(item);
      if (added) {
        // Remove from cart
        const index = shoppingCart.cartItems.findIndex((i) => i.Id === id);
        if (index !== -1) {
          shoppingCart.cartItems.splice(index, 1);
          localStorage.setItem(
            "so-cart",
            JSON.stringify(shoppingCart.cartItems),
          );
          shoppingCart.renderCart();
          updateCartCount();
          alertMessage("Item moved to wishlist!");
          renderWishlist();
        }
      } else {
        alertMessage("Item is already in your wishlist.");
      }
    });
  });
}

// Hook: after the cart is rendered, add listeners and render the wishlist
const originalRenderCart = shoppingCart.renderCart.bind(shoppingCart);
shoppingCart.renderCart = function () {
  originalRenderCart();
  setTimeout(addMoveToWishlistListeners, 3000);
};

// Initial renders
renderWishlist();

// Load Dynamic Header and Footer
loadHeaderFooter().then(() => {
  updateCartCount();
});
