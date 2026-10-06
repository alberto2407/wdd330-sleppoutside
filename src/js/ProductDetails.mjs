import { getLocalStorage, setLocalStorage, updateCartCount, animateCartIcon, alertMessage } from './utils.mjs';

// Map of color names to hex codes (approximations)
const COLOR_MAP = {
    // Reds
    red: "#e74c3c",
    burgundy: "#800020",
    maroon: "#800000",
    crimson: "#dc143c",
    rust: "#b7410e",
    rusted: "#b7410e",

    // Oranges
    orange: "#e67e22",
    "fire orange": "#ff6600",
    pumpkin: "#ff7518",
    terracotta: "#e2725b",
    apricot: "#fbceb1",
    copper: "#b87333",

    // Yellows
    yellow: "#f1c40f",
    mustard: "#ffdb58",
    gold: "#ffd700",
    "golden oak": "#c9a227",
    saffron: "#f4c430",
    sand: "#c2b280",
    "red sand": "#c19a6b",

    // Greens
    green: "#2ecc71",
    "green apple": "#8db600",
    "forest green": "#228b22",
    "dark forest": "#1a3b1a",
    "army green": "#4b5320",
    olive: "#808000",
    "moss green": "#8a9a5b",
    pine: "#01472e",
    moss: "#8a9a5b",
    spruce: "#0a5c36",
    "shaded spruce": "#1f3d2c",
    "turf green": "#4cbb17",
    "garden green": "#4cbb17",
    "lichen": "#7a9b76",
    gulch: "#4a5d23",
    jade: "#00a86b",
    clover: "#3ea055",
    "four leaf clover": "#3ea055",
    cactus: "#5a7d3c",

    // Blues
    blue: "#3498db",
    "navy blue": "#001f3f",
    "altitude blue": "#4a90e2",
    "paradise blue": "#00bfff",
    "river blue": "#1e90ff",
    "deep teal": "#005f5f",
    teal: "#008080",
    "marine": "#002b5c",
    "mazerine blue": "#1c39bb",
    "bondi blue": "#0095b6",
    "limoges blue": "#1c39bb",
    "pearl blue": "#88b4d1",
    "cosmic blue": "#4a5b8c",
    "bomber blue": "#4a6fa5",
    "cobalt blue": "#0047ab",
    "zeta blue": "#3b7a9e",
    "sunset grey": "#8b8b8b",
    "atmospheric grey": "#9ca3af",

    // Purples
    purple: "#9b59b6",
    "mountain purple": "#5d3a6b",
    plum: "#8e4585",
    eggplant: "#4b2840",

    // Pinks
    pink: "#ff69b4",
    fuschia: "#ff00ff",
    magenta: "#ff00ff",

    // Browns
    brown: "#8b4513",
    "coyote brown": "#81613c",
    coyote: "#81613c",
    "dark olive": "#3b3c36",
    mahogany: "#c04000",
    woodbine: "#7a5c3a",
    henna: "#a52a2a",

    // Greys/Black/White
    black: "#000000",
    "tnf black": "#000000",
    "dark shadow": "#2f2f2f",
    "dark charcoal": "#333333",
    charcoal: "#333333",
    "asphalt grey": "#4a4a4a",
    "high rise grey": "#b0b0b0",
    "zinc grey": "#7a7a7a",
    "stone grey": "#8a8a8a",
    "shady blue": "#4a6fa5",
    "obsidian": "#1a1a1a",
    "phantom": "#3a3a3a",
    "deep sea": "#003b46",
    "ocean": "#005b7f",
    "sea scape": "#4a8ba5",
    "fjord": "#4a6e8a",
    "atlantic": "#3a6b7a",
    "magnetite": "#4a4a4a",
    "slate": "#708090",
    "onyx": "#0f0f0f",
    "oxide": "#5a4a3a",
    "arctic navy": "#1c2e4a",
    "adobe": "#bd8c62",
    "clay": "#b66a50",
    "rust clay": "#b7410e",
    "cargo": "#7a7a5a",
    "galaxy": "#3a3a5a",
    "mystery pop": "#ff69b4",
    "lemon": "#fff44f",
    "retro camo": "#5a5a3a",
    "urban camo": "#4a4a4a",
    "forest camo": "#3a4a2a",
    "dark camo": "#3a3a2a",
    "hemlock": "#5a7d3c",
    "chevron": "#4a6a4a",
    "scribble tree": "#5a8a5a",
    "branches": "#4a6a3a",
    "blue wing teal": "#1e90ff",
    "papaya orange": "#ff8c00",
    "zinnia orange": "#ff6600",
    "vintage white": "#f5f5dc",
    "desert floral": "#d4a76a",
    "windells speed team": "#3a6a9a",
    "sunset grey": "#8b8b8b",
    "deep earth": "#5a4a3a",
    "shadow": "#4a4a4a",
    "cranberry": "#8b1a3a",
    "graphite": "#4a4a4a",
    "steel": "#71797e",
    "oxide": "#5a4a3a",
    "spruce": "#0a5c36",
    "magnetite": "#4a4a4a",
    "fuchsia": "#ff00ff",
    "neon": "#39ff14",
    "forest grey": "#5a6a5a",
    "phoenix red": "#e74c3c",
    "slickrock": "#b85c38",
    "haute red": "#d62828",
    "deep teal": "#005f5f",
    "sunset grey": "#8b8b8b",
    "omega blue": "#1a4a8a",
    "kings camo": "#4a5a3a",
    "rootbeer": "#5a3a1a",
    "stone grey": "#8a8a8a",
    "tangerine": "#f28500",
    "yellow green": "#9acd32",
    "patina green": "#5a8a5a",
    "fuchsia": "#ff00ff",
    "neon": "#39ff14",
};

// Default color if no match found
const DEFAULT_COLOR = "#888888";

// Function to get a hex color from a color name
function getColorHex(colorName) {
    if (!colorName) return DEFAULT_COLOR;

    const lowerName = colorName.toLowerCase();

    // Check for exact match first
    if (COLOR_MAP[lowerName]) {
        return COLOR_MAP[lowerName];
    }

    // Check for partial matches (e.g., "Burgundy/Dark Yellow" contains "burgundy")
    for (const [key, value] of Object.entries(COLOR_MAP)) {
        if (lowerName.includes(key)) {
            return value;
        }
    }

    // If nothing matches, return default
    return DEFAULT_COLOR;
}
export default class ProductDetails {
    constructor(productId, dataSource) {
        this.productId = productId;
        this.dataSource = dataSource;
        this.product = {}; // Here we save the product data
    }

    async init() {
        // Shgow the spinner
        this.showLoading();

        try {
            this.product = await this.dataSource.findProductById(this.productId);

            if (!this.product) {
                throw new Error("Producto no encontrado");
            }

            // Hide the spinner
            this.hideLoading();
            this.renderProductDetails();

            document.getElementById("addToCart")
                .addEventListener("click", this.addProductToCart.bind(this));

            await this.loadComments();

            const commentForm = document.getElementById("comment-form");
            if (commentForm) {
                commentForm.addEventListener("submit", this.handleCommentSubmit.bind(this));
            }
        } catch (error) {
            console.error("Error:", error);
            this.showError();
        }
    }

    async loadComments() {
        const commentsList = document.getElementById("comments-list");
        if (!commentsList) return;

        try {
            const comments = await this.dataSource.getComments(this.productId);

            if (!comments || comments.length === 0) {
                commentsList.innerHTML = `
                    <li class="no-comments">
                        <p>No comments yet. Be the first to review this product!</p>
                    </li>
                `;
                return;
            }

            // Order comments by date (newest first)
            comments.sort((a, b) => new Date(b.date) - new Date(a.date));

            commentsList.innerHTML = comments.map((comment) => this.commentTemplate(comment)).join("");
        } catch (error) {
            console.error("Error loading comments:", error);
            commentsList.innerHTML = `
                <li class="error-message">
                    <p>Could not load comments. Please try again later.</p>
                </li>
            `;
        }
    }

    // Template para un comentario
    commentTemplate(comment) {
        const date = new Date(comment.date).toLocaleString();
        const safeComment = this.escapeHtml(comment.comment);
        const safeAuthor = this.escapeHtml(comment.author);

        return `
            <li class="comment-card">
                <div class="comment-card__header">
                    <p class="comment-card__author">${safeAuthor}</p>
                    <p class="comment-card__date">${date}</p>
                </div>
                <p class="comment-card__text">${safeComment}</p>
            </li>
        `;
    }

    // Escape HTML to prevent XSS attacks
    escapeHtml(text) {
        if (!text) return "";
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    // Manage the comment form submission
    async handleCommentSubmit(event) {
        event.preventDefault();

        const authorInput = document.getElementById("comment-author");
        const commentInput = document.getElementById("comment-text");
        const submitButton = document.querySelector(".comment-submit");

        const author = authorInput.value.trim();
        const comment = commentInput.value.trim();

        // Basic validation
        if (!author || !comment) {
            alertMessage("Please fill in both your name and your comment.");
            return;
        }

        // Disable the button while submitting
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Posting...";
        }

        try {
            const commentData = {
                productId: this.productId,
                author: author,
                comment: comment,
                date: new Date().toISOString(),
            };

            await this.dataSource.addComment(commentData);

            // Clear the form inputs
            authorInput.value = "";
            commentInput.value = "";

            // Reload the comments to show the new one
            await this.loadComments();

            // Show a success message
            alertMessage("Your comment has been posted!");

        } catch (error) {
            console.error("Error posting comment:", error);
            alertMessage("Could not post your comment. Please try again.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Post Comment";
            }
        }
    }

    showLoading() {
        // Create the loading overlay
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
                    <p>We couldn't find the product you're looking for.</p>
                    <p>Please try again.</p>
                    <a href="/">← Back to Home</a>
                </div>
            `;
        }
    }

    addProductToCart() {
        const cartItems = getLocalStorage("so-cart") || [];

        // Add the selected color to the product if not already set
        if (!this.product.SelectedColor && this.product.Colors && this.product.Colors.length > 0) {
            this.product.SelectedColor = this.product.Colors[0];
        }

        // Look for if the product is already in the cart
        const existingItem = cartItems.find((item) =>
            item.Id === this.product.Id &&
            (item.SelectedColor?.ColorCode === this.product.SelectedColor?.ColorCode)
        );

        if (existingItem) {
            existingItem.Quantity = (existingItem.Quantity || 1) + 1;
        } else {
            this.product.Quantity = 1;
            cartItems.push(this.product);
        }

        setLocalStorage("so-cart", cartItems);
        updateCartCount();
        animateCartIcon();
    }

    renderColorSwatches() {
        const colors = this.product.Colors || [];
        const colorsContainer = document.getElementById("product-colors");
        const colorNameElement = document.getElementById("productColor");

        if (!colorsContainer) return;

        // If the product has no colors, hide the container
        if (colors.length === 0) {
            colorsContainer.classList.add("hide");
            if (colorNameElement) colorNameElement.classList.add("hide");
            return;
        }

        // If there's only one color, hide the swatches and just show the color name
        if (colors.length === 1) {
            colorsContainer.classList.add("hide");
            if (colorNameElement) {
                colorNameElement.classList.remove("hide");
                colorNameElement.textContent = colors[0].ColorName;
            }
            return;
        }

        // Show the color swatches
        colorsContainer.classList.remove("hide");
        if (colorNameElement) colorNameElement.classList.remove("hide");

        colorsContainer.innerHTML = colors.map((color, index) => {
            const hexColor = getColorHex(color.ColorName);
            const isSelected = index === 0 ? "selected" : "";

            return `
                <button 
                    type="button"
                    class="color-swatch ${isSelected}" 
                    data-color-index="${index}"
                    aria-label="Select color ${color.ColorName}"
                    title="${color.ColorName}"
                    style="background-color: ${hexColor};"
                ></button>
            `;
        }).join("");

        // Event listeners
        const swatchButtons = colorsContainer.querySelectorAll(".color-swatch");
        swatchButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                const index = parseInt(e.currentTarget.dataset.colorIndex);
                this.selectColor(index);
            });
        });

        if (colorNameElement) {
            colorNameElement.textContent = colors[0].ColorName;
        }

        this.product.SelectedColor = colors[0];
    }
    selectColor(index) {
        const colors = this.product.Colors || [];
        const selectedColor = colors[index];
        if (!selectedColor) return;

        // Update the main product image
        const productImage = document.getElementById("productImage");
        if (productImage && selectedColor.ColorPreviewImageSrc) {
            productImage.src = selectedColor.ColorPreviewImageSrc;
            productImage.alt = `${this.product.NameWithoutBrand} - ${selectedColor.ColorName}`;
        }

        // Update the color name display
        const colorNameElement = document.getElementById("productColor");
        if (colorNameElement) {
            colorNameElement.textContent = selectedColor.ColorName;
        }

        // Update the selected class on the swatches
        const swatchButtons = document.querySelectorAll(".color-swatch");
        swatchButtons.forEach((button, i) => {
            if (i === index) {
                button.classList.add("selected");
            } else {
                button.classList.remove("selected");
            }
        });

        // Save the selected color to the product object (so it's added to the cart with the right color)
        this.product.SelectedColor = selectedColor;
    }

    renderProductDetails() {
        productDetailsTemplate(this.product);
        this.renderColorSwatches();
        this.renderImageCarousel();
    }

    renderImageCarousel() {
        const thumbnailsContainer = document.getElementById("product-thumbnails");
        const productImage = document.getElementById("productImage");

        if (!thumbnailsContainer || !productImage) return;

        const images = this.product.Images || {};
        const extraImages = images.ExtraImages || [];

        // If there are no extra images, hide the thumbnails container
        if (extraImages.length === 0) {
            thumbnailsContainer.classList.add("hide");
            return;
        }

        // Build the list of all images
        const allImages = [
            {
                src: images.PrimaryLarge || images.PrimaryMedium || images.PrimarySmall,
                title: "Main View",
                isMain: true,
            },
            ...extraImages.map((img, index) => ({
                src: img.Src,
                title: img.Title || `View ${index + 1}`,
                isMain: false,
            })),
        ];

        // Show the thumbnails container
        thumbnailsContainer.classList.remove("hide");

        // Render the thumbnails
        thumbnailsContainer.innerHTML = allImages.map((img, index) => {
            const isSelected = index === 0 ? "selected" : "";
            return `
                <button 
                    type="button"
                    class="product-thumbnail ${isSelected}" 
                    data-image-index="${index}"
                    aria-label="View image ${index + 1}: ${img.title}"
                    title="${img.title}"
                >
                    <img src="${img.src}" alt="${img.title}" />
                </button>
            `;
        }).join("");

        // Add event listeners to the thumbnails
        const thumbnailButtons = thumbnailsContainer.querySelectorAll(".product-thumbnail");
        thumbnailButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                const index = parseInt(e.currentTarget.dataset.imageIndex);
                this.selectImage(allImages[index], index);
            });
        });
    }

    selectImage(imageData, index) {
        if (!imageData) return;

        // Update the main image
        const productImage = document.getElementById("productImage");
        if (productImage) {
            productImage.src = imageData.src;
            productImage.alt = `${this.product.NameWithoutBrand} - ${imageData.title}`;
        }

        // Update the "selected" class on the thumbnails
        const thumbnailButtons = document.querySelectorAll(".product-thumbnail");
        thumbnailButtons.forEach((button, i) => {
            if (i === index) {
                button.classList.add("selected");
            } else {
                button.classList.remove("selected");
            }
        });
    }
}

function productDetailsTemplate(product) {
    document.querySelector('h1').innerText = product.Brand.Name;

    const productNameElement = document.getElementById('productName');
    if (productNameElement) {
        productNameElement.innerText = product.NameWithoutBrand;
    }

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