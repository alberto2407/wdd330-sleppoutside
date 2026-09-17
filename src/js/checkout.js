import { loadHeaderFooter, updateCartCount } from "./utils.mjs";

// Load Dynamic Header and Footer
loadHeaderFooter().then(() => {
  updateCartCount();
});
