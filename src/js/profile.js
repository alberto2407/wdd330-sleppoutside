import {
  loadHeaderFooter,
  updateCartCount,
  getLocalStorage,
} from "./utils.mjs";

loadHeaderFooter().then(() => {
  updateCartCount();
});

const profileContent = document.getElementById("profile-content");

// Get the logged-in user
function getUser() {
  const storedData = getLocalStorage("so-auth-token");
  if (!storedData) return null;

  if (storedData.user) return storedData.user;

  if (typeof storedData === "string") {
    try {
      const decoded = atob(storedData);
      const email = decoded.split(":")[0];
      const localUsers = getLocalStorage("so-local-users") || [];
      return localUsers.find((u) => u.email === email) || { email };
    } catch (error) {
      console.error("Could not decode token:", error);
      return null;
    }
  }
  return null;
}

// Render the profile
function renderProfile() {
  const user = getUser();

  if (!user) {
    // Not logged in: redirect to login
    window.location.href = "/login/?redirect=/profile/";
    return;
  }

  const displayName = user.firstname || user.email.split("@")[0];
  const avatarHtml = user.avatar
    ? `<img src="${user.avatar}" alt="${displayName}" class="profile-avatar" />`
    : `<span class="profile-avatar profile-avatar--fallback">${displayName.charAt(0).toUpperCase()}</span>`;

  profileContent.innerHTML = `
        <div class="profile-header">
            ${avatarHtml}
            <div class="profile-header__info">
                <h2>${user.firstname || ""} ${user.lastname || ""}</h2>
                <p class="profile-header__email">${user.email}</p>
            </div>
        </div>

        <div class="profile-section">
            <h3>Personal Information</h3>
            <div class="profile-field">
                <span class="profile-field__label">First Name</span>
                <span class="profile-field__value">${user.firstname || "—"}</span>
            </div>
            <div class="profile-field">
                <span class="profile-field__label">Last Name</span>
                <span class="profile-field__value">${user.lastname || "—"}</span>
            </div>
            <div class="profile-field">
                <span class="profile-field__label">Email</span>
                <span class="profile-field__value">${user.email}</span>
            </div>
        </div>

        <div class="profile-section">
            <h3>Shipping Address</h3>
            <div class="profile-field">
                <span class="profile-field__label">Street</span>
                <span class="profile-field__value">${user.street || "—"}</span>
            </div>
            <div class="profile-field">
                <span class="profile-field__label">City</span>
                <span class="profile-field__value">${user.city || "—"}</span>
            </div>
            <div class="profile-field">
                <span class="profile-field__label">State</span>
                <span class="profile-field__value">${user.state || "—"}</span>
            </div>
            <div class="profile-field">
                <span class="profile-field__label">Zip Code</span>
                <span class="profile-field__value">${user.zip || "—"}</span>
            </div>
        </div>

        <div class="profile-actions">
        <a href="/orders/" class="profile-btn">View My Orders</a>
        </div>
    `;
}

renderProfile();
