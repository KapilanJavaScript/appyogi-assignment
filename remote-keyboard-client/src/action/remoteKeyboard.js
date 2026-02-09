import { handleConfig } from "../helper/config";

const API_URL = import.meta.env.VITE_API_URL;
const getKeyboardState = async (user) => {
    try {
      const config = handleConfig(user);
      const response = await fetch(`${API_URL}/keyboard`, config);
      return response.json();
    } catch (error) {
      console.error("Error fetching keyboard state:", error);
      throw error; // Rethrow to handle in the calling function
    }
}

const toggleKey = async (user, keyId, data) => {
    try {
      const config = handleConfig(user);
      const response = await fetch(`${API_URL}/keyboard/toggle/${keyId}`, {
        ...config,
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('response', response);
      return response.json();
    } catch (error) {
      console.error("Error toggling key:", error);
      throw error; // Rethrow to handle in the calling function
    }
}

const acquireControl = async (user) => {
  try {
    const config = handleConfig(user);
    const response = await fetch(`${API_URL}/keyboard/control`, {
      ...config,
      method: 'POST',
    });
    return response.json();
  } catch (error) {
    console.error("Error acquiring control:", error);
    throw error; // Rethrow to handle in the calling function
  }
}

export {
    getKeyboardState,
    toggleKey,
    acquireControl
}