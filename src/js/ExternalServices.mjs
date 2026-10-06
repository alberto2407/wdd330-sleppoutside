import { getLocalStorage, setLocalStorage } from "./utils.mjs";

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

  async login(email, password) {
    // Look for the user in localStorage first
    const localUsers = getLocalStorage("so-local-users") || [];
    let user = localUsers.find(
      (u) => u.email === email && u.password === password
    );

    // If not found locally, check the server
    if (!user) {
      const response = await fetch(`${baseURL}users`);
      const serverUsers = await convertToJson(response);
      user = serverUsers.find(
        (u) => u.email === email && u.password === password
      );
    }

    if (user) {
      const token = btoa(`${user.email}:${Date.now()}`);
      return {
        token,
        user: {
          email: user.email,
          firstname: user.firstname || "",
          lastname: user.lastname || "",
          avatar: user.avatar || "",
          street: user.street || "",
          city: user.city || "",
          state: user.state || "",
          zip: user.zip || "",
        }
      };
    } else {
      throw {
        name: "serviceError",
        message: { message: "Invalid email or password" }
      };
    }
  }

  // Get orders from the server
  async getOrders(token) {
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(`${baseURL}orders`, options);
    const data = await convertToJson(response);
    return data; // json-server returns the array directly
  }

  // Register a new user
  async registerUser(userData) {
    const localUsers = getLocalStorage("so-local-users") || [];
    const newUser = {
      ...userData,
      id: Date.now(), // Unique local ID
    };
    localUsers.push(newUser);
    setLocalStorage("so-local-users", localUsers);

    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      };
      // Attempt to save the user on the server
      const response = await fetch(`${baseURL}users`, options);
      const data = await convertToJson(response);
      return data;
    } catch (error) {
      console.warn("Server rejected user, but saved locally:", error);
      return newUser;
    }
  }

  // Check if an email already exists
  async emailExists(email) {
    // Look for the email in localStorage 
    const localUsers = getLocalStorage("so-local-users") || [];
    if (localUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return true;
    }

    // Look for the email on the server
    try {
      const response = await fetch(`${baseURL}users`);
      const users = await convertToJson(response);
      return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
      console.warn("Could not check server for email:", error);
      return false;
    }
  }

  // Get comments for a specific product
  async getComments(productId) {
    // Simulate a short delay so the spinner is visible.
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allComments = getLocalStorage("so-comments") || [];
    return allComments.filter((c) => c.productId === productId);
  }

  // Add a new comment (to localStorage)
  async addComment(commentData) {
    const allComments = getLocalStorage("so-comments") || [];
    const newComment = {
      ...commentData,
      id: Date.now(), // Unique ID
    };
    allComments.push(newComment);
    setLocalStorage("so-comments", allComments);
    return newComment;
  }
}