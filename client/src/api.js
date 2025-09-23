import axios from 'axios';

export const fetchItems = async (skip = 0, limit = 20) => {
  try {
    const response = await axios.get('https://new-task-4.onrender.com/api/items', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};
