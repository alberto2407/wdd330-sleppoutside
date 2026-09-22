import { getLocalStorage, setLocalStorage, updateCartCount } from './utils.mjs';

export default class ProductDetails {
    constructor(productId, dataSource) {
        this.productId = productId;
        this.dataSource = dataSource;
        this.product = {}; // Here we save the product data
    }

    async init() {
        // ✅ Mostrar spinner SIN borrar los elementos existentes
        this.showLoading();

        try {
            this.product = await this.dataSource.findProductById(this.productId);

            if (!this.product) {
                throw new Error("Producto no encontrado");
            }

            // ✅ Ocultar spinner y renderizar
            this.hideLoading();
            this.renderProductDetails();

            document.getElementById("addToCart")
                .addEventListener("click", this.addProductToCart.bind(this));
        } catch (error) {
            console.error("Error:", error);
            this.showError();
        }
    }

    showLoading() {
        // ✅ Crear overlay con spinner
        const existing = document.getElementById("loading-overlay");
        if (existing) existing.remove();

        const overlay = document.createElement("div");
        overlay.id = "loading-overlay";
        overlay.className = "loading-overlay";
        overlay.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Cargando producto...</p>
            </div>
        `;
        document.querySelector(".product-detail").appendChild(overlay);
    }

    hideLoading() {
        const overlay = document.getElementById("loading-overlay");
        if (overlay) overlay.remove();
    }

    showError() {
        const container = document.querySelector(".product-detail");
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>😕 No pudimos cargar el producto.</p>
                    <p>Por favor, intenta de nuevo.</p>
                    <a href="/">← Volver al inicio</a>
                </div>
            `;
        }
    }

    addProductToCart() {
        const cartItems = getLocalStorage("so-cart") || [];

        // Look for if the product is already in the cart
        const existingItem = cartItems.find((item) => item.Id === this.product.Id);

        if (existingItem) {
            // Increase quantity
            existingItem.Quantity = (existingItem.Quantity || 1) + 1;
        } else {
            // Add to cart
            this.product.Quantity = 1;
            cartItems.push(this.product);
        }

        setLocalStorage("so-cart", cartItems);
        updateCartCount();
    }

    renderProductDetails() {
        productDetailsTemplate(this.product);
    }
}

function productDetailsTemplate(product) {
    document.querySelector('h1').innerText = product.Brand.Name;
    document.querySelector('h2').innerText = product.NameWithoutBrand;

    const productImage = document.getElementById('productImage');
    productImage.src = product.Images.PrimaryLarge;
    productImage.alt = product.NameWithoutBrand;

    const flagContainer = document.getElementById('discount-flag-container');
    const hasDiscount = product.FinalPrice < product.SuggestedRetailPrice;

    if (hasDiscount && flagContainer) {
        const discountPercent = Math.round(
            ((product.SuggestedRetailPrice - product.FinalPrice) /
                product.SuggestedRetailPrice) * 100
        );
        flagContainer.innerHTML = `<span class="discount-flag">-${discountPercent}% OFF</span>`;
    } else if (flagContainer) {
        flagContainer.innerHTML = '';
    }

    document.getElementById('productPrice').innerHTML = priceTemplate(product);
    document.getElementById('productColor').textContent = product.Colors[0].ColorName;
    document.getElementById('productDescription').innerHTML = product.DescriptionHtmlSimple;

    document.getElementById('addToCart').dataset.id = product.Id;
}

function priceTemplate(product) {
    const hasDiscount = product.FinalPrice < product.SuggestedRetailPrice;

    if (hasDiscount) {
        const discountPercent = Math.round(
            ((product.SuggestedRetailPrice - product.FinalPrice) /
                product.SuggestedRetailPrice) * 100
        );

        return `
      <div class="price-container">
        <span class="original-price">$${product.SuggestedRetailPrice.toFixed(2)}</span>
        <span class="sale-price">$${product.FinalPrice.toFixed(2)}</span>
        <!-- <span class="discount-info">Save ${discountPercent}%</span> -->
      </div>
    `;
    }

    return `
    <div class="price-container">
      <span class="sale-price">$${product.FinalPrice.toFixed(2)}</span>
    </div>
  `;
}