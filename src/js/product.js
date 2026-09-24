import {
  getParam,
  updateCartCount,
  loadHeaderFooter,
  renderBreadcrumbs,
} from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";

// Crear instancia de ExternalServices
const dataSource = new ExternalServices("tents");

// Obtener el ID del producto de la URL
const productID = getParam("product");
// Obtener la categoría de la URL
const category = getParam("category");

// Crear instancia de ProductDetails
const product = new ProductDetails(productID, dataSource);

// Inicializar (carga y renderiza el producto)
product.init().then(() => {
  // Render the product details
  renderBreadcrumbs({
    category: category || "Products", // Look for the real category
    productName: product.product?.NameWithoutBrand,
  });
});

// Actualizar el contador de carrito
updateCartCount();

// Load Dynamic Header and Footer
loadHeaderFooter().then(() => {
  updateCartCount();
});
