import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "src/index.html"),
        cart: resolve(import.meta.dirname, "src/cart/index.html"),
        checkout: resolve(import.meta.dirname, "src/checkout/index.html"),
        product: resolve(import.meta.dirname, "src/product_pages/index.html"),
      },
    },
  },
});
