import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import Alert from "./Alert.js";
import { updateCartCount, loadHeaderFooter } from "./utils.mjs";

// Get the list element from the DOM
const listElement = document.querySelector(".product-list");
const dataSource = new ProductData("tents");
const productList = new ProductList("tents", dataSource, listElement);
const alert = new Alert();

// Initialize the product list and alert
productList.init();
updateCartCount();
alert.init();

// Load header and footer
loadHeaderFooter().then(() => {
  updateCartCount();
});
