import { renderListWithTemplate, getLocalStorage, setLocalStorage, updateCartCount, alertMessage, animateCartIcon } from "./utils.mjs";

function productCardTemplate(product) {
    const hasDiscount = product.FinalPrice < product.SuggestedRetailPrice;
    const discountPercentage = hasDiscount
        ? Math.round(((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice) * 100) : 0;

    const discountIndicator = hasDiscount
        ? `<div class="discount-indicator">
                <span class="discount-badge">-${discountPercentage}% OFF</span>
                <span class="original-price">$${product.SuggestedRetailPrice.toFixed(2)}</span>
            </div>`
        : '';

    const imageSmall = product.Images?.PrimarySmall || product.Images?.PrimaryMedium;
    const imageMedium = product.Images?.PrimaryMedium;
    const imageLarge = product.Images?.PrimaryLarge;

    const srcsetParts = [];
    if (imageSmall) srcsetParts.push(`${imageSmall} 320w`);
    if (imageMedium) srcsetParts.push(`${imageMedium} 640w`);
    if (imageLarge) srcsetParts.push(`${imageLarge} 1080w`);
    const srcset = srcsetParts.join(', ');

    const category = product.Category || '';

    return `
        <li class="product-card ${hasDiscount ? 'product-card--discounted' : ''}">
            <a href="/product_pages/?product=${product.Id}&category=${product.Category}">
                ${discountIndicator}
                <img src="${imageMedium || imageSmall || imageLarge}" srcset="${srcset}" 
                    sizes="(max-width: 500px) 200px, (max-width: 900px) 300px, 400px"
                    alt="${product.NameWithoutBrand}"
                    loading="lazy"
                >
                <h2 class="card__brand">${product.Brand.Name}</h2>
                <h3 class="card__name">${product.NameWithoutBrand}</h3>
                <div class="price-container">
                    <p class="product-card__price ${hasDiscount ? 'product-card__price--sale' : ''}">
                        $${product.FinalPrice.toFixed(2)}
                    </p>
                </div>
            </a>
            <button class="quick-view-btn" data-id="${product.Id}" aria-label="Quick view ${product.NameWithoutBrand}"> Quick View</button>
        </li>
    `;
}

export default class ProductList {
    constructor(category, dataSource, listElement) {
        this.category = category;
        this.dataSource = dataSource;
        this.listElement = listElement;
        this.products = [];
    }

    async init() {
        // Show loading spinner
        this.listElement.innerHTML = `
            <li class="loading">
                <div class="spinner"></div>
                <p>Loading products...</p>
            </li>
        `;

        try {
            const list = await this.dataSource.getData(this.category);

            // Add category to each product
            this.products = list.map(product => ({
                ...product,
                Category: this.category,
            }));

            this.renderList(this.products);
            this.setupSortListener();
            this.setupQuickViewListeners();
            return this;
        } catch (error) {
            console.error("Error loading products:", error);
            this.listElement.innerHTML = `
                <li class="error-message">
                    <p>We were unable to load the products.</p>
                    <p>Please, try again.</p>
                    <a href="/">← Back to Home</a>
                </li>
            `;
            return this;
        }
    }

    // Set up click listener for quick view
    setupQuickViewListeners() {
        const quickViewButtons = document.querySelectorAll(".quick-view-btn");
        quickViewButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productId = e.target.dataset.id;
                this.showQuickView(productId);
            });
        });
    }

    // Show quick view
    showQuickView(productId) {
        const product = this.products.find((p) => p.Id === productId);
        if (!product) return;

        const imageUrl = product.Images?.PrimaryLarge || product.Images?.PrimaryMedium;

        // Create the modal 
        const modalOverlay = document.createElement("div");
        modalOverlay.classList.add("modal-overlay");
        modalOverlay.innerHTML = `
            <div class="modal">
                <button class="modal__close" aria-label="Close quick view">✕</button>
                    <div class="modal__image-container">
                        <div class="modal__image-spinner">
                            <div class="spinner"></div>
                        </div>
                        <img class="modal__image" src="${imageUrl}" alt="${product.NameWithoutBrand}">
                    </div>
                    <p class="modal__brand">${product.Brand.Name}</p> 
                    <a href="/product_pages/?product=${product.Id}&category=${product.Category}" class="modal__link">
                        <h3 class="modal__name">${product.NameWithoutBrand}</h3> 
                    </a>
                    <p class="modal__price">$${product.FinalPrice.toFixed(2)}</p>
                    <p class="modal__color">${product.Colors?.[0]?.ColorName || ''}</p>
                    <p class="modal__description">${product.Description || ''}</p>
                <button class="modal__add-to-cart" data-id="${product.Id}">Add to Cart</button>
            </div>
        `;

        // Add the modal to the DOM
        document.body.appendChild(modalOverlay);

        // Manage the image loading
        const image = modalOverlay.querySelector(".modal__image");
        const spinner = modalOverlay.querySelector(".modal__image-spinner");

        image.addEventListener("load", () => {
            // When the image loads, hide the spinner and show the image
            spinner.style.display = "none";
            image.style.display = "block";
        });

        image.addEventListener("error", () => {
            // If the image fails to load, show a default image
            spinner.style.display = "none";
            image.src = "/images/noun_Tent_2517.svg";
            image.style.display = "block";
        });

        // Hide the image and show the spinner.
        image.style.display = "none";
        spinner.style.display = "flex";

        // Close the modal when clicking the close button
        modalOverlay.querySelector(".modal__close").addEventListener("click", () => {
            modalOverlay.remove();
        });

        // Close the modal when clicking outside
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });

        // Close the modal with the escape key
        const escapeHandler = (e) => {
            if (e.key === "Escape") {
                modalOverlay.remove();
                document.removeEventListener("keydown", escapeHandler);
            }
        };
        document.addEventListener("keydown", escapeHandler);

        // Add product to cart
        modalOverlay.querySelector(".modal__add-to-cart").addEventListener("click", (e) => {
            e.stopPropagation();
            this.addProductToCart(product);
        });
    }

    // Add product to cart
    addProductToCart(product) {
        const cartItems = getLocalStorage("so-cart") || [];

        // Verify if the product is already in the cart
        const existingItem = cartItems.find((item) => item.Id === product.Id);

        if (existingItem) {
            existingItem.Quantity = (existingItem.Quantity || 1) + 1;
        } else {
            product.Quantity = 1;
            cartItems.push(product);
        }

        setLocalStorage("so-cart", cartItems);
        updateCartCount();
        animateCartIcon();

        // Show success message
        alertMessage(`${product.Name} added to cart!`);

        // Close the modal
        const modal = document.querySelector(".modal-overlay");
        if (modal) modal.remove();
    }

    renderList(list) {
        if (!list || list.length === 0) {
            this.listElement.innerHTML = `
                <li class="no-results">
                    <p>Sorry, we could not find that product for you!</p>
                    <p>Please try again or select a category:</p>
                    <div class="category-suggestions">
                        <a href="/product_listing/?category=tents" class="suggestion-link">Tents</a>
                        <a href="/product_listing/?category=backpacks" class="suggestion-link">Backpacks</a>
                        <a href="/product_listing/?category=sleeping-bags" class="suggestion-link">Sleeping Bags</a>
                        <a href="/product_listing/?category=hammocks" class="suggestion-link">Hammocks</a>
                    </div>
                </li>
            `;
            return;
        }
        renderListWithTemplate(productCardTemplate, this.listElement, list, "afterbegin", true);
    }

    setupSortListener() {
        const sortSelect = document.getElementById("sort-select");
        if (!sortSelect) return;

        sortSelect.addEventListener("change", (e) => {
            const sortBy = e.target.value;
            this.sortProducts(sortBy);
        });
    }

    sortProducts(sortBy) {
        let sortedProducts = [...this.products];

        switch (sortBy) {
            case "name-asc":
                sortedProducts.sort((a, b) => a.Name.localeCompare(b.Name));
                break;

            case "name-desc":
                sortedProducts.sort((a, b) => b.Name.localeCompare(a.Name));
                break;

            case "price-asc":
                sortedProducts.sort((a, b) => a.FinalPrice - b.FinalPrice);
                break;

            case "price-desc":
                sortedProducts.sort((a, b) => b.FinalPrice - a.FinalPrice);
                break;

            default:
                // "default" — Keeps the original order
                sortedProducts = [...this.products];
        }

        this.renderList(sortedProducts);
    }
}