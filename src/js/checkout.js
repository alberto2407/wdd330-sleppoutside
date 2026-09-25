import { loadHeaderFooter, updateCartCount, alertMessage } from "./utils.mjs";
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

  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const submitButton = document.querySelector(".checkout-submit");
  if (submitButton) submitButton.disabled = true;

  try {
    await checkout.checkout();
  } catch (error) {
    console.error("Error submitting order:", error);

    if (error.name === "serviceError") {
      const messages = Object.values(error.message);
      messages.forEach((msg) => alertMessage(msg));
    } else {
      alertMessage(
        "There was an error submitting your order. Please try again.",
      );
    }

    if (submitButton) submitButton.disabled = false;
  }
});
