import axios from 'axios';

const BASE_URL = "https://new-task-6.onrender.com/api"; // ✅ updated to deployed backend

export const fetchItems = async (skip = 0, limit = 20) => {
  try {
    const response = await axios.get(`${BASE_URL}/items`, {
      params: { skip, limit },
      timeout: 10000,
    });
    return response.data; // { items: [...], total: 100 }
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};
