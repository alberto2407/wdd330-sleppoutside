import { getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

// Crear instancia de ProductData
const dataSource = new ProductData("tents");

// Obtener el ID del producto de la URL
const productId = getParam("product");

// Crear instancia de ProductDetails
const product = new ProductDetails(productId, dataSource);

// Inicializar (carga y renderiza el producto)
product.init();
