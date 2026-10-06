// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}
// Obtener un parámetro de la URL
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const product = urlParams.get(param);
  return product;
}
// Render a list of items using a template and insert it into a parent element
export function renderListWithTemplate(template, parentElement, list, position = "afterbegin", clear = false) {
  const htmlStrings = list.map(template);
  if (clear) {
    parentElement.innerHTML = "";
  }
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}
// Update the cart count in the header
export function updateCartCount() {
  const count = getCartCount();
  const badge = document.querySelector(".cart-count");

  if (!badge) return;

  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("hide");
  } else {
    badge.textContent = "0";
    badge.classList.add("hide");
  }
}
// Render a template into a parent element
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

// Loads a template from a file and returns it as text.
export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

// Load the header and footer on the page
export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");

  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  renderWithTemplate(headerTemplate, headerElement);
  renderWithTemplate(footerTemplate, footerElement);

  searchProducts();
  updateCartCount();
  updateWishlistCount();
  initWelcomeModal();
  updateAuthLink();
}

// Perform a search and navigate to the product listing page
export function performSearch(term) {
  if (!term || !term.trim()) {
    alert("Please enter a search term");
    return;
  }

  // Create a URLSearchParams object to hold the search parameter
  const searchParams = new URLSearchParams();
  searchParams.append("category", term);

  // Navegate to the product listing page with the search parameter
  window.location.href = `/product_listing/index.html?${searchParams.toString()}`;
}

// Set up search functionality for the search form
export function searchProducts() {
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");
  const searchToggle = document.getElementById("search-toggle");
  const searchWrapper = document.querySelector(".search-wrapper");

  if (!searchButton || !searchInput) return;

  if (searchToggle && searchWrapper) {
    searchToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      searchWrapper.classList.add("open");
      searchToggle.setAttribute("aria-expanded", "true");

      setTimeout(() => searchInput.focus(), 100);
    });
  }

  searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value;
    performSearch(searchTerm);
  });

  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const searchTerm = searchInput.value;
      performSearch(searchTerm);
    }
  });

  document.addEventListener("click", (e) => {
    if (
      searchWrapper &&
      searchWrapper.classList.contains("open") &&
      !searchWrapper.contains(e.target)
    ) {
      searchWrapper.classList.remove("open");
      if (searchToggle) {
        searchToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      searchWrapper &&
      searchWrapper.classList.contains("open")
    ) {
      searchWrapper.classList.remove("open");
      if (searchToggle) {
        searchToggle.setAttribute("aria-expanded", "false");
      }
    }
  });
}

export function getCartCount() {
  const cartItems = getLocalStorage("so-cart") || [];
  // Add up the quantities of all items in the cart, defaulting to 1 if Quantity is not set
  return cartItems.reduce((count, item) => count + (item.Quantity || 1), 0);
}

export function renderBreadcrumbs({ category, itemCount, productName } = {}) {
  const breadcrumbsElement = document.getElementById("breadcrumbs");

  if (!breadcrumbsElement) return;

  // Determine the current page
  const path = window.location.pathname;
  const isHome = path === "/" || path === "/index.html";
  const isListing = path.includes("/product_listing/");
  const isDetail = path.includes("/product_pages/");

  // In Home: hide
  if (isHome) {
    breadcrumbsElement.classList.add("hide");
    return;
  }

  // In other pages: show
  breadcrumbsElement.classList.remove("hide");

  let html = '<ol>';

  // "Home" always present (except on the Home page)
  html += `<li><a href="/">Home</a></li>`;

  // Listing page: "Category → (N items)"
  if (isListing && category) {
    const formattedCategory = category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    if (itemCount !== undefined) {
      html += `<li class="current">${formattedCategory} → (${itemCount} items)</li>`;
    } else {
      html += `<li class="current">${formattedCategory}</li>`;
    }
  }

  // Detail page: "Category" (with a link to the list)
  if (isDetail && category) {
    const formattedCategory = category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    html += `<li>
      <a href="/product_listing/?category=${category}">${formattedCategory}</a>
    </li>`;

    // Add the product name
    if (productName) {
      html += `<li class="current">${productName}</li>`;
    }
  }

  html += '</ol>';
  breadcrumbsElement.innerHTML = html;
}

// Alert message function 
export function alertMessage(message, scroll = true) {
  // Create the alert
  const alert = document.createElement("div");
  alert.classList.add("alert");

  // Add the message and button to close 
  alert.innerHTML = `
    <p>${message}</p>
    <span class="alert-close">✕</span>
  `;

  // Listener for closing the alert
  alert.addEventListener("click", function (e) {
    if (e.target.classList.contains("alert-close")) {
      const main = document.querySelector("main");
      if (main) main.removeChild(alert);
    }
  });

  // Insert at the top
  const main = document.querySelector("main");
  if (main) {
    main.prepend(alert);
  }

  // Scroll to the top
  if (scroll) {
    window.scrollTo(0, 0);
  }

  setTimeout(() => {
    removeAlert(alert);
  }, 3000);
}

// Function to remove an alert with a fade-out effect
function removeAlert(alertElement) {
  if (!alertElement || !alertElement.parentNode) return;

  // Add the fade-out class
  alertElement.classList.add("fade-out");

  // Remove after the animation completes
  setTimeout(() => {
    if (alertElement.parentNode) {
      alertElement.parentNode.removeChild(alertElement);
    }
  }, 500);
}

//Remove all alerts
export function removeAllAlerts() {
  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((alert) => alert.remove());
}

// Function to initialize the Welcome/Giveaway Modal
export function initWelcomeModal() {
  const modal = document.getElementById("welcome-modal");
  const closeBtn = document.getElementById("close-welcome-modal");
  const noThanksBtn = document.getElementById("no-thanks-btn");
  const registerBtn = document.getElementById("register-now-btn");
  const storageKey = "so-welcome-seen";

  // If the modal doesn't exist on this page, exit.
  if (!modal) return;

  // Function to close the modal and set the flag in localStorage
  const closeModal = () => {
    modal.classList.add("hide");
    setLocalStorage(storageKey, true);
  };

  // Add event listeners to the buttons
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (noThanksBtn) noThanksBtn.addEventListener("click", closeModal);

  // If they click "Register Now", we also close and mark as seen.
  if (registerBtn) registerBtn.addEventListener("click", closeModal);

  // Optional: Close if clicking outside the modal content
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Now, check if we need to SHOW the modal
  const hasSeen = getLocalStorage(storageKey);
  if (!hasSeen) {
    modal.classList.remove("hide");
  }
}

// Function to animate the cart icon when an item is added
export function animateCartIcon() {
  const cartIcon = document.querySelector(".cart");

  if (!cartIcon) return;

  // Remove the class if it's already there (to restart the animation)
  cartIcon.classList.remove("animate");

  // Force a reflow to restart the animation
  void cartIcon.offsetWidth;

  // Add the animation class
  cartIcon.classList.add("animate");

  // Remove the class after the animation ends (0.6s = 600ms)
  setTimeout(() => {
    cartIcon.classList.remove("animate");
  }, 600);
}

// Function to initialize the Newsletter Signup form
export function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  const emailInput = document.getElementById("newsletter-email");
  const messageElement = document.getElementById("newsletter-message");
  const storageKey = "so-newsletter-subscribed";

  // If the form doesn't exist on this page, exit.
  if (!form) return;

  // Check if the user already subscribed
  const alreadySubscribed = getLocalStorage(storageKey);

  if (alreadySubscribed) {
    // Show a message instead of the form
    form.classList.add("hide");
    if (messageElement) {
      messageElement.textContent = "You're already subscribed to our newsletter!";
      messageElement.classList.remove("hide", "error");
      messageElement.classList.add("success");
    }
    return;
  }

  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Basic validation (HTML5 already handles most of it)
    if (!email || !email.includes("@")) {
      if (messageElement) {
        messageElement.textContent = "Please enter a valid email address.";
        messageElement.classList.remove("hide", "success");
        messageElement.classList.add("error");
      }
      return;
    }

    // Save the subscription to localStorage
    setLocalStorage(storageKey, { email: email, date: new Date().toISOString() });

    // Show success message
    if (messageElement) {
      messageElement.textContent = "Thanks for subscribing! Check your inbox for a welcome email.";
      messageElement.classList.remove("hide", "error");
      messageElement.classList.add("success");
    }

    // Hide the form
    form.classList.add("hide");

    // Show a global alert too
    alertMessage(`Welcome aboard! You've been subscribed with ${email}.`);
  });
}

// Function to update the authentication link in the header based on login status
function updateAuthLink() {
  const authSection = document.getElementById("auth-section");
  if (!authSection) return;

  const storedData = getLocalStorage("so-auth-token");

  // Check if the stored data is an object with a user property or a string 
  let user = null;
  if (storedData) {
    if (storedData.user) {
      user = storedData.user;
    } else if (typeof storedData === "string") {
      try {
        const decoded = atob(storedData);
        const email = decoded.split(":")[0];
        const localUsers = getLocalStorage("so-local-users") || [];
        user = localUsers.find((u) => u.email === email) || {
          email,
          firstname: email.split("@")[0],
          avatar: "",
        };
      } catch (error) {
        console.error("Could not decode token:", error);
      }
    }
  }

  if (user) {
    const displayName = user.firstname || user.email.split("@")[0];

    let avatarHtml = "";
    if (user.avatar) {
      avatarHtml = `<img src="${user.avatar}" alt="${displayName}" class="user-avatar">`;
    } else {
      const initial = displayName.charAt(0).toUpperCase();
      avatarHtml = `<span class="user-avatar user-avatar--fallback">${initial}</span>`;
    }

    authSection.innerHTML = `
      <div class="user-menu">
        <button id="user-menu-toggle" class="user-menu-toggle" aria-haspopup="true" aria-expanded="false">
          ${avatarHtml}
          <span class="user-name">${displayName}</span>
          <span class="user-menu-caret">▾</span>
        </button>
        <div id="user-dropdown" class="user-dropdown hide">
          <a href="/orders/" class="user-dropdown__item">&#x1F4E6; My Orders</a>
          <a href="/profile/" class="user-dropdown__item">&#128100; My Profile</a>
          <hr class="user-dropdown__divider" />
          <button id="logout-button" class="user-dropdown__item user-dropdown__item--danger">&#128682; Logout</button>
        </div>
      </div>
    `;

    const toggleBtn = document.getElementById("user-menu-toggle");
    const dropdown = document.getElementById("user-dropdown");

    // Toggle dropdown
    if (toggleBtn && dropdown) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = !dropdown.classList.contains("hide");
        if (isOpen) {
          dropdown.classList.add("hide");
          toggleBtn.setAttribute("aria-expanded", "false");
        } else {
          dropdown.classList.remove("hide");
          toggleBtn.setAttribute("aria-expanded", "true");
        }
      });

      // Close when clicking outside
      document.addEventListener("click", (e) => {
        if (
          !dropdown.classList.contains("hide") &&
          !authSection.contains(e.target)
        ) {
          dropdown.classList.add("hide");
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      });

      // Close with Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !dropdown.classList.contains("hide")) {
          dropdown.classList.add("hide");
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById("logout-button");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("so-auth-token");
        window.location.href = "/";
      });
    }
  } else {
    authSection.innerHTML = `
      <a href="/login/" class="auth-link">Login</a>
    `;
  }
}

// Update the wishlist count in the header
export function updateWishlistCount() {
  const badge = document.querySelector(".wishlist-count");
  if (!badge) return;

  const token = getLocalStorage("so-auth-token");
  const storageKey = token && token.user && token.user.email
    ? `so-wishlist-${token.user.email}`
    : "so-wishlist-guest";

  const items = getLocalStorage(storageKey) || [];

  if (items.length > 0) {
    badge.textContent = items.length;
    badge.classList.remove("hide");
  } else {
    badge.textContent = "0";
    badge.classList.add("hide");
  }
}