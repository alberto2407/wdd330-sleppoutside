import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class Wishlist {
    constructor() {
        this.storageKey = this.getStorageKey();
    }

    // Determine the storage key based on the user's email or use a default for guests
    getStorageKey() {
        const token = getLocalStorage("so-auth-token");
        if (token && token.user && token.user.email) {
            return `so-wishlist-${token.user.email}`;
        }
        return "so-wishlist-guest";
    }

    // Get all items in the wishlist
    getItems() {
        return getLocalStorage(this.storageKey) || [];
    }

    // Save items to localStorage
    saveItems(items) {
        setLocalStorage(this.storageKey, items);
    }

    // Add an item to the wishlist
    addItem(product) {
        const items = this.getItems();
        const existing = items.find((item) => item.Id === product.Id);
        if (existing) {
            return false; // Already in wishlist
        }
        const itemToAdd = { ...product };
        items.push(itemToAdd);
        this.saveItems(items);
        return true;
    }

    // Remove an item from the wishlist
    removeItem(productId) {
        const items = this.getItems().filter((item) => item.Id !== productId);
        this.saveItems(items);
        return true;
    }

    // Check if an item is in the wishlist
    isInWishlist(productId) {
        return this.getItems().some((item) => item.Id === productId);
    }

    // Get the count of items in the wishlist
    getCount() {
        return this.getItems().length;
    }

    // Move an item from the wishlist to the shopping cart
    moveToCart(productId) {
        const items = this.getItems();
        const item = items.find((i) => i.Id === productId);
        if (!item) return false;

        const cartItems = getLocalStorage("so-cart") || [];
        const existingInCart = cartItems.find(
            (c) =>
                c.Id === item.Id &&
                c.SelectedColor?.ColorCode === item.SelectedColor?.ColorCode
        );

        // If the item already exists in the cart, increase its quantity
        if (existingInCart) {
            existingInCart.Quantity = (existingInCart.Quantity || 1) + 1;
        } else {
            item.Quantity = 1;
            cartItems.push(item);
        }

        // Remove the item from the wishlist
        setLocalStorage("so-cart", cartItems);
        this.removeItem(productId);
        return true;
    }
}