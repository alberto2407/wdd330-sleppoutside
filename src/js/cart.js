import { loadHeaderFooter, updateCartCount } from "./utils.mjs";
import ShoppingCart from "./ShoppingCart.mjs";

// Initialize the shopping cart

// Get the list and footer elements
const listElement = document.querySelector(".product-list");
const footerElement = document.querySelector(".cart-footer");

// Create an instance of the shopping cart
const shoppingCart = new ShoppingCart(listElement, footerElement);

// Initialize the shopping cart
shoppingCart.init();

// Load Dynamic Header and Footer
loadHeaderFooter().then(() => {
  updateCartCount();
});
