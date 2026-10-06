import { loadHeaderFooter, updateCartCount } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import Auth from "./Auth.mjs";

const auth = new Auth();
const dataSource = new ExternalServices();

// Protect the page: redirect to login if not authenticated
if (!auth.isLoggedIn()) {
  window.location.href = "/login/?redirect=/orders/";
}

// Load Dynamic Header and Footer
loadHeaderFooter().then(() => {
  updateCartCount();
});

// Load orders
const ordersList = document.getElementById("orders-list");

async function loadOrders() {
  try {
    const token = auth.getToken();
    const orders = await dataSource.getOrders(token);

    if (!orders || orders.length === 0) {
      ordersList.innerHTML = `
        <li class="no-results">
          <p>No orders yet.</p>
        </li>
      `;
      return;
    }

    ordersList.innerHTML = orders.map(orderTemplate).join("");
  } catch (error) {
    console.error("Error loading orders:", error);

    // If unauthorized (token expired), redirect to login
    if (
      error.name === "serviceError" &&
      error.message?.message?.includes("Unauthorized")
    ) {
      auth.logout();
      window.location.href = "/login/?redirect=/orders/";
      return;
    }

    ordersList.innerHTML = `
      <li class="error-message">
        <p>We couldn't load the orders.</p>
        <p>Please try again later.</p>
      </li>
    `;
  }
}

function orderTemplate(order) {
  const orderDate = new Date(order.orderDate).toLocaleDateString();
  const items = order.items || [];

  // Convert orderTotal to a number, defaulting to 0 if it's not a valid number
  const total = Number(order.orderTotal) || 0;

  return `
    <li class="order-card">
      <div class="order-card__header">
        <h3>Order #${order.id}</h3>
        <span class="order-card__date">${orderDate}</span>
      </div>
      <div class="order-card__customer">
        <p><strong>Customer:</strong> ${order.fname} ${order.lname}</p>
        <p><strong>Email:</strong> ${order.email || "N/A"}</p>
      </div>
      <div class="order-card__items">
        <p><strong>Items (${items.length}):</strong></p>
        <ul>
          ${items
            .map((item) => {
              const quantity = Number(item.quantity) || 1;
              const price = Number(item.price) || 0;
              return `
            <li>${item.name} × ${quantity} — $${(price * quantity).toFixed(2)}</li>
          `;
            })
            .join("")}
        </ul>
      </div>
      <div class="order-card__total">
        <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      </div>
    </li>
  `;
}

// Load orders when the page is ready
loadOrders();
