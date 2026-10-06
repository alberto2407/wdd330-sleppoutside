import { loadHeaderFooter, updateCartCount, getParam } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import Auth from "./Auth.mjs";

// Load Dynamic Header and Footer
loadHeaderFooter().then(() => {
  updateCartCount();
});

const auth = new Auth();
const dataSource = new ExternalServices();

// If already logged in, redirect to orders
if (auth.isLoggedIn()) {
  window.location.href = "/orders/";
}

const form = document.getElementById("login-form");
const messageElement = document.getElementById("login-message");

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Clear previous message
  messageElement.classList.add("hide");

  // Disable submit button
  const submitButton = document.querySelector(".login-submit");
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";
  }

  try {
    const response = await dataSource.login(email, password);
    const token = response.token || response.accessToken;

    if (!token) {
      throw new Error("No token received from server");
    }

    // Save the token
    auth.setToken(response);

    // Show success message
    messageElement.textContent = "Login successful! Redirecting...";
    messageElement.classList.remove("hide", "error");
    messageElement.classList.add("success");

    // Redirect to orders page (or back to where they came from)
    const redirect = getParam("redirect") || "/orders/";
    setTimeout(() => {
      window.location.href = redirect;
    }, 1000);
  } catch (error) {
    console.error("Login error:", error);

    // Show error message
    messageElement.textContent = "Invalid email or password. Please try again.";
    messageElement.classList.remove("hide", "success");
    messageElement.classList.add("error");

    // Re-enable the button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Sign In";
    }
  }
});
