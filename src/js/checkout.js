import { loadHeaderFooter, updateCartCount } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

// Load Dynamic Header and Footer
loadHeaderFooter().then(() => {
  updateCartCount();
});

// Initialize the checkout
const checkout = new CheckoutProcess("so-cart", ".order-summary");
checkout.init();

// Calculate order total when zip code is entered
const zipInput = document.getElementById("zip");
zipInput.addEventListener("blur", () => {
  if (zipInput.value.length === 5) {
    checkout.calculateOrderTotal();
  }
});

// Manage form submission
const form = document.getElementById("checkout-form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitButton = document.querySelector(".checkout-submit");
  submitButton.disabled = true;

  try {
    await checkout.checkout(form);
    alert("Order submitted successfully!");
    localStorage.removeItem("so-cart");
    window.location.href = "/";
  } catch (error) {
    console.error("Error submitting order:", error);
    alert("There was an error submitting your order. Please try again.");
    submitButton.disabled = false;
  }
});
