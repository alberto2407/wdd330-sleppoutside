import { alertMessage, getLocalStorage, removeAllAlerts, setLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

const services = new ExternalServices();

function formDataToJSON(formElement) {
    const formData = new FormData(formElement);
    const convertedJSON = {};
    formData.forEach((value, key) => {
        convertedJSON[key] = value;
    });
    return convertedJSON;
}

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
        const numItems = this.list.reduce((sum, item) => sum + (item.Quantity || 1), 0);
        this.itemTotal = this.list.reduce(
            (sum, item) => sum + item.FinalPrice * (item.Quantity || 1),
            0
        );

        document.getElementById("num-items").textContent = numItems;
        document.getElementById("subtotal").textContent = `$${this.itemTotal.toFixed(2)}`;
    }

    calculateOrderTotal() {
        this.tax = this.itemTotal * 0.06;
        const numItems = this.list.reduce((sum, item) => sum + (item.Quantity || 1), 0);
        this.shipping = numItems > 0 ? 10 + (numItems - 1) * 2 : 0;
        this.orderTotal = this.itemTotal + this.tax + this.shipping;
        this.displayOrderTotals();
    }

    displayOrderTotals() {
        document.getElementById("tax").textContent = `$${this.tax.toFixed(2)}`;
        document.getElementById("shipping").textContent = `$${this.shipping.toFixed(2)}`;
        document.getElementById("orderTotal").textContent = `$${this.orderTotal.toFixed(2)}`;
    }

    async checkout() {
        const form = document.forms.checkout;
        const payload = formDataToJSON(form);
        payload.orderDate = new Date().toISOString();
        payload.orderTotal = this.orderTotal;
        payload.tax = this.tax;
        payload.shipping = this.shipping;
        payload.items = packageItems(this.list);

        try {
            await services.checkout(payload);
            setLocalStorage(this.key, []);
            window.location.assign("/checkout/success.html");
        } catch (error) {
            removeAllAlerts();
            const messages = error.message && typeof error.message === "object"
                ? Object.values(error.message)
                : [error.message || "Unable to place your order."];
            messages.forEach((message) => alertMessage(message));
        }
    }
}