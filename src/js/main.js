import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import Alert from "./Alert.js";
import { updateCartCount } from "./utils.mjs";

const listElement = document.querySelector(".product-list");
const dataSource = new ProductData("tents");
const productList = new ProductList("tents", dataSource, listElement);
const alert = new Alert();

productList.init();
updateCartCount();
alert.init();
