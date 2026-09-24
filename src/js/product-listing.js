import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import {
  loadHeaderFooter,
  getParam,
  updateCartCount,
  renderBreadcrumbs,
} from "./utils.mjs";

// Load dynamic header and footer
loadHeaderFooter().then(() => {
  updateCartCount();
});

// Get the category parameter from the URL and create an instance of ProductList with it as a parameter
const category = getParam("category");
const dataSource = new ExternalServices();
const listElement = document.querySelector(".product-list");

// Create an instance of ProductList
const myList = new ProductList(category, dataSource, listElement);

// Initialize the product list
myList.init().then(() => {
  // Render the product list
  renderBreadcrumbs({
    category: category,
    itemCount: myList.products.length,
  });
});

// Update the page title based on the category or search term
const titleElement = document.getElementById("product-title");
if (titleElement && category) {
  const knownCategories = ["tents", "backpacks", "sleeping-bags", "hammocks"];
  const isCategory = knownCategories.includes(category.toLowerCase());

  if (isCategory) {
    const formattedCategory = category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    titleElement.textContent = `Top Products: ${formattedCategory}`;
  } else {
    titleElement.textContent = `Search Results for: "${category}"`;
  }
}
