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
}

//Remove all alerts
export function removeAllAlerts() {
  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((alert) => alert.remove());
}