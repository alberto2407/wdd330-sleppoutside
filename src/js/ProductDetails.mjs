import { getLocalStorage, setLocalStorage, updateCartCount } from './utils.mjs';

export default class ProductDetails {
    constructor(productId, dataSource) {
        this.productId = productId;
        this.dataSource = dataSource;
        this.product = {}; // Here we save the product data
    }

    async init() {
        // Retrieve product data from the data source (asynchronous)
        this.product = await this.dataSource.findProductById(this.productId);

        // Render the product details page with the data obtained
        this.renderProductDetails();

        // Add listener for the "Add to Cart" button
        document.getElementById('addToCart').addEventListener('click', this.addProductToCart.bind(this));
    }

    addProductToCart() {
        const cartItems = getLocalStorage("so-cart") || [];
        cartItems.push(this.product);
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
        <span class="discount-info">Save ${discountPercent}%</span>
      </div>
    `;
    }

    return `
    <div class="price-container">
      <span class="sale-price">$${product.FinalPrice.toFixed(2)}</span>
    </div>
  `;
}