import { getLocalStorage } from "./utils.mjs";

function packageItems(items) {
    return items.map((item) => ({
        id: item.Id,
        name: item.Name,
        price: item.FinalPrice,
        quantity: item.Quantity || 1,
    }));
}

export default class CheckoutProcess {
    constructor(key, outputSelector) {
        this.key = key;
        this.outputSelector = outputSelector;
        this.list = [];
        this.itemTotal = 0;
        this.shipping = 0;
        this.tax = 0;
        this.orderTotal = 0;
    }

    init() {
        this.list = getLocalStorage(this.key) || [];
        this.calculateItemSummary();
    }

    calculateItemSummary() {
        // Calculate item total
        const numItems = this.list.reduce((sum, item) => sum + (item.Quantity || 1), 0);
        this.itemTotal = this.list.reduce(
            (sum, item) => sum + item.FinalPrice * (item.Quantity || 1),
            0
        );

        // Show subtotals
        document.getElementById("num-items").textContent = numItems;
        document.getElementById("subtotal").textContent = `$${this.itemTotal.toFixed(2)}`;
    }

    calculateOrderTotal() {
        // Calculate tax
        this.tax = this.itemTotal * 0.06;

        // Calculate shipping
        const numItems = this.list.reduce((sum, item) => sum + (item.Quantity || 1), 0);
        this.shipping = numItems > 0 ? 10 + (numItems - 1) * 2 : 0;

        // Calculate order total
        this.orderTotal = this.itemTotal + this.tax + this.shipping;

        // Show totals
        this.displayOrderTotals();
    }

    displayOrderTotals() {
        document.getElementById("tax").textContent = `$${this.tax.toFixed(2)}`;
        document.getElementById("shipping").textContent = `$${this.shipping.toFixed(2)}`;
        document.getElementById("orderTotal").textContent = `$${this.orderTotal.toFixed(2)}`;
    }

    async checkout(form) {
        // Convert form data to JSON
        const formData = new FormData(form);
        const orderData = {};
        formData.forEach((value, key) => {
            orderData[key] = value;
        });

        // Add order date
        const orderDate = new Date().toISOString();
        const items = packageItems(this.list);

        const payload = {
            orderDate: orderDate,
            ...orderData,
            items: items,
            orderTotal: this.orderTotal.toFixed(2),
            shipping: this.shipping,
            tax: this.tax.toFixed(2),
        };

        const { default: ExternalServices } = await import("./ExternalServices.mjs");
        const externalServices = new ExternalServices();
        const response = await externalServices.checkout(payload);
        return response;
    }
}