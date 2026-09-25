const baseURL = import.meta.env.VITE_SERVER_URL;

// Convert response to JSON
async function convertToJson(res) {
  const jsonResponse = await res.json();
  if (res.ok) {
    return jsonResponse;
  } else {
    throw {
      name: "serviceError",
      message: jsonResponse
    };
  }
}

// Class to handle product data fetching
export default class ExternalServices {
  async getData(category) {
    const categories = ["tents", "backpacks", "sleeping-bags", "hammocks"];

    if (categories.includes(category.toLowerCase())) {
      const response = await fetch(`${baseURL}products/search/${category}`);
      const data = await convertToJson(response);
      return data.Result;
    }
    const allProducts = [];
    for (const cat of categories) {
      try {
        const response = await fetch(`${baseURL}products/search/${cat}`);
        if (response.ok) {
          const data = await response.json();
          const matches = data.Result.filter((product) =>
            product.Name.toLowerCase().includes(category.toLowerCase()) ||
            product.NameWithoutBrand.toLowerCase().includes(category.toLowerCase()) ||
            product.Brand.Name.toLowerCase().includes(category.toLowerCase())
          );
          allProducts.push(...matches);
        }
      } catch (error) {
        console.error(`Error en ${cat}:`, error);
      }
    }
    return allProducts;
  }

  // Fetch a single product by its ID
  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${id}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  async checkout(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    return await fetch(`${baseURL}checkout`, options).then(convertToJson);
  }
}