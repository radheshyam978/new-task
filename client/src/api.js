import axios from 'axios';

export const fetchItems = async (skip = 0, limit = 20) => {
  const res = await axios.get(`http://localhost:5000/api/items?skip=${skip}&limit=${limit}`);
  return res.data; // { items: [...], totalCap: 100 }
};
