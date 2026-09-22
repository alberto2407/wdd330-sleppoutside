import { getLocalStorage, setLocalStorage, updateCartCount } from "./utils.mjs";

// Template for a single cart item
function cartItemTemplate(item) {
    const quantity = item.Quantity || 1;
    const imageUrl =
        item.Images?.PrimaryMedium ||
        item.Image ||
        "/images/placeholder.jpg";
    const colorName = item.Colors?.[0]?.ColorName || "";
    const itemTotal = (item.FinalPrice * quantity).toFixed(2);

    return `<li class="cart-card divider">
        <a href="/product_pages/?product=${item.Id}" class="cart-card__image">
            <img src="${imageUrl}" alt="${item.Name}">
        </a>
        <a href="/product_pages/?product=${item.Id}">
            <h2 class="card__name">${item.Name}</h2>
        </a>
        <p class="cart-card__color">${colorName}</p>
        
        <div class="cart-card__quantity">
            <div class="qtd-container">
                <button class="quantity-button decrease" data-id="${item.Id}" aria-label="Decrease quantity">−</button>
                <span class="qtd-display">${quantity}</span>
                <button class="quantity-button increase" data-id="${item.Id}" aria-label="Increase quantity">+</button>
            </div>
        </div>
        
        <p class="cart-card__price">$${itemTotal}</p>
        
        <button class="cart-card__remove" data-id="${item.Id}" aria-label="Remove item">✕</button>
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

        this.cartItems = this.cartItems.filter(item => {
            return item.Images?.PrimaryMedium && item.Id && item.FinalPrice;
        });

        if (this.cartItems.length !== (getLocalStorage("so-cart") || []).length) {
            setLocalStorage("so-cart", this.cartItems);
        }

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
        const total = this.cartItems.reduce((sum, item) => {
            const quantity = item.Quantity || 1;
            return sum + (item.FinalPrice * quantity);
        }, 0);
        // Insert the total into the cart footer
        const cartTotal = document.querySelector(".cart-total");
        if (cartTotal) {
            cartTotal.textContent = `Total: $${total.toFixed(2)}`;
        }
    }
    // Adds event listeners to remove buttons
    addRemoveListeners() {
        // Listeners for remove buttons
        const removeButtons = document.querySelectorAll(".cart-card__remove");
        removeButtons.forEach((button) => {
            button.addEventListener("click", (e) => this.removeFromCart(e));
        });
        // Listeners for quantity buttons
        const decreaseButtons = document.querySelectorAll(".quantity-button.decrease");
        decreaseButtons.forEach((button) => {
            button.addEventListener("click", (e) => this.decreaseQuantity(e));
        });
        // Listeners for increase buttons
        const increaseButtons = document.querySelectorAll(".quantity-button.increase");
        increaseButtons.forEach((button) => {
            button.addEventListener("click", (e) => this.increaseQuantity(e));
        });
    }
    // Increases the quantity of an item in the cart
    increaseQuantity(e) {
        const productId = e.currentTarget.dataset.id;
        const item = this.cartItems.find((item) => item.Id === productId);

        if (item) {
            item.Quantity = (item.Quantity || 1) + 1;
            setLocalStorage("so-cart", this.cartItems);
            this.renderCart();
            updateCartCount();
        }
    }
    // Decreases the quantity of an item in the cart
    decreaseQuantity(e) {
        const productId = e.currentTarget.dataset.id;
        const item = this.cartItems.find((item) => item.Id === productId);

        if (item) {
            const newQuantity = (item.Quantity || 1) - 1;

            if (newQuantity <= 0) {
                const index = this.cartItems.findIndex((i) => i.Id === productId);
                this.cartItems.splice(index, 1);
            } else {
                item.Quantity = newQuantity;
            }

            setLocalStorage("so-cart", this.cartItems);
            this.renderCart();
            updateCartCount();
        }
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