import Alert from "./Alert.js";
import { updateCartCount, loadHeaderFooter, initNewsletter } from "./utils.mjs";

// Alerts
const alert = new Alert();
alert.init();

// Load Dynamic Header and Footer
loadHeaderFooter().then(() => {
  updateCartCount();
  initNewsletter();
});
