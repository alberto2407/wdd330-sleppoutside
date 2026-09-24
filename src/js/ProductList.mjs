import { renderListWithTemplate } from "./utils.mjs";

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
                />
                <h2 class="card__brand">${product.Brand.Name}</h2>
                <h3 class="card__name">${product.NameWithoutBrand}</h3>
                <div class="price-container">
                    <p class="product-card__price ${hasDiscount ? 'product-card__price--sale' : ''}">
                        $${product.FinalPrice.toFixed(2)}
                    </p>
                </div>
            </a>
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
                <p>Cargando productos...</p>
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
            return this;
        } catch (error) {
            console.error("Error loading products:", error);
            this.listElement.innerHTML = `
                <li class="error-message">
                    <p>😕 No pudimos cargar los productos.</p>
                    <p>Por favor, intenta de nuevo.</p>
                    <a href="/">← Volver al inicio</a>
                </li>
            `;
            return this;
        }
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
                sortedProducts.sort((a, b) =>
                    a.Name.localeCompare(b.Name)
                );
                break;

            case "name-desc":
                sortedProducts.sort((a, b) =>
                    b.Name.localeCompare(a.Name)
                );
                break;

            case "price-asc":
                sortedProducts.sort((a, b) =>
                    a.FinalPrice - b.FinalPrice
                );
                break;

            case "price-desc":
                sortedProducts.sort((a, b) =>
                    b.FinalPrice - a.FinalPrice
                );
                break;

            default:
                // "default" — Keeps the original order
                sortedProducts = [...this.products];
        }

        this.renderList(sortedProducts);
    }
}