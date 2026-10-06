import { loadHeaderFooter, updateCartCount } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

loadHeaderFooter().then(() => {
  updateCartCount();
});

const dataSource = new ExternalServices();

// Generate a list of avatars using DiceBear API
const AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Max",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Bear",
];

let selectedAvatar = AVATARS[0]; // Default to the first avatar

// Render the avatar picker
function renderAvatarPicker() {
  const picker = document.getElementById("avatar-picker");
  if (!picker) return;

  picker.innerHTML = AVATARS.map((url, index) => {
    const isSelected = index === 0 ? "selected" : "";
    return `
      <button type="button" class="avatar-option ${isSelected}" data-avatar-url="${url}" aria-label="Select avatar ${index + 1}">
        <img src="${url}" alt="Avatar ${index + 1}" />
      </button>
    `;
  }).join("");

  // Add event listeners to avatar buttons
  const avatarButtons = picker.querySelectorAll(".avatar-option");
  avatarButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      selectedAvatar = e.currentTarget.dataset.avatarUrl;

      // Update selected state
      avatarButtons.forEach((btn) => btn.classList.remove("selected"));
      e.currentTarget.classList.add("selected");
    });
  });
}

renderAvatarPicker();

// Handle form submission
const form = document.getElementById("register-form");
const messageElement = document.getElementById("register-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitButton = document.querySelector(".register-submit");
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";
  }

  messageElement.classList.add("hide");

  // Collect form data
  const userData = {
    firstname: document.getElementById("firstname").value.trim(),
    lastname: document.getElementById("lastname").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    street: document.getElementById("street").value.trim(),
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value.trim().toUpperCase(),
    zip: document.getElementById("zip").value.trim(),
    avatar: selectedAvatar,
  };

  try {
    // Check if email already exists
    const emailExists = await dataSource.emailExists(userData.email);
    if (emailExists) {
      throw new Error("An account with that email already exists.");
    }

    // Create the user
    await dataSource.registerUser(userData);

    // Show success message
    messageElement.textContent =
      "Account created successfully! Redirecting to login...";
    messageElement.classList.remove("hide", "error");
    messageElement.classList.add("success");

    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = "/login/";
    }, 2000);
  } catch (error) {
    console.error("Registration error:", error);

    let errorMessage = "Something went wrong. Please try again.";
    if (error.message && error.message.includes("already exists")) {
      errorMessage = "An account with that email already exists.";
    }

    messageElement.textContent = errorMessage;
    messageElement.classList.remove("hide", "success");
    messageElement.classList.add("error");

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Create Account";
    }
  }
});
