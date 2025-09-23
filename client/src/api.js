import axios from 'axios';

export const fetchItems = async (skip = 0, limit = 20) => {
  const res = await axios.get(`https://new-task-3.onrender.com/`);
  return res.data; // { items: [...], totalCap: 100 }
};
