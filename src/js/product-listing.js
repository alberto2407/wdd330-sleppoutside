import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam, updateCartCount } from "./utils.mjs";

// Load dynamic header and footer
loadHeaderFooter().then(() => {
  updateCartCount();
});

// Get the category parameter from the URL and create an instance of ProductList with it as a parameter
const category = getParam("category");
const dataSource = new ProductData();
const listElement = document.querySelector(".product-list");

// Create an instance of ProductList
const myList = new ProductList(category, dataSource, listElement);

// Initialize the product list
myList.init();

// Update the page title
const titleElement = document.getElementById("product-title");
if (titleElement && category) {
  // Capitalize the first letter of each word in the category for better display
  const formattedCategory = category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  titleElement.textContent = `Top Products: ${formattedCategory}`;
}
