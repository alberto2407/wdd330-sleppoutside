import { getLocalStorage, setLocalStorage, updateCartCount } from "./utils.mjs";

// Template for a single cart item
function cartItemTemplate(item) {
    return `<li class="cart-card divider">
    <a href="/product_pages/?product=${item.Id}" class="cart-card__image">
      <img src="${item.Image}" alt="${item.Name}">
    </a>
    <a href="/product_pages/?product=${item.Id}">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${item.Colors[0].ColorName}</p>
    <p class="cart-card__quantity">qty: 1</p>
    <p class="cart-card__price">$${item.FinalPrice}</p>
    <span class="cart-card__remove" data-id="${item.Id}" title="Remove item">✕</span>
  </li>`;
}

// Template for an empty cart message
function emptyCartTemplate() {
    return `<li class="empty-cart">
    <p>Your cart is empty</p>
  </li>`;
}

//Class ShoppingCart
//Handles the logic for the shopping cart
export default class ShoppingCart {
    constructor(listElement, footerElement) {
        this.listElement = listElement;
        this.footerElement = footerElement;
        this.cartItems = [];
    }

    // Initializes the cart: loads items and renders the cart
    init() {
        this.cartItems = getLocalStorage("so-cart") || [];
        this.renderCart();
    }

    //Renders the entire shopping cart
    renderCart() {
        if (this.cartItems.length === 0) {
            this.renderEmptyCart();
            return;
        }

        this.renderItems();
        this.renderTotal();
        this.addRemoveListeners();
    }

    // Renders the empty cart message
    renderEmptyCart() {
        this.listElement.innerHTML = emptyCartTemplate();

        // Hide the footer
        // if (this.footerElement) {
        //     this.footerElement.classList.add("hide");
        // }

        // Clear the total
        const cartTotal = document.querySelector(".cart-total");
        if (cartTotal) {
            cartTotal.textContent = "Total: $0.00";
        }

        updateCartCount();
    }

    // Renders the list of items
    renderItems() {
        const htmlItems = this.cartItems.map((item) => cartItemTemplate(item));
        this.listElement.innerHTML = htmlItems.join("");
    }

    // Renders the total of the cart
    renderTotal() {
        // Show the footer
        if (this.footerElement) {
            this.footerElement.classList.remove("hide");
        }

        // Calculate the total price of items in the cart
        const total = this.cartItems.reduce((sum, item) => sum + item.FinalPrice, 0);

        // Insert the total into the cart footer
        const cartTotal = document.querySelector(".cart-total");
        if (cartTotal) {
            cartTotal.textContent = `Total: $${total.toFixed(2)}`;
        }
    }
    // Adds event listeners to remove buttons
    addRemoveListeners() {
        const removeButtons = document.querySelectorAll(".cart-card__remove");
        removeButtons.forEach((button) => {
            button.addEventListener("click", (e) => this.removeFromCart(e));
        });
    }

    // Removes an item from the cart based on its ID
    removeFromCart(e) {
        const productId = e.currentTarget.dataset.id;
        const index = this.cartItems.findIndex((item) => item.Id === productId);

        if (index !== -1) {
            this.cartItems.splice(index, 1);
        }

        setLocalStorage("so-cart", this.cartItems);
        this.renderCart();
        updateCartCount();
    }
}