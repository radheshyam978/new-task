require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ----------------- CONFIG -----------------
const app = express();
app.use(cors()); // Allow all origins
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/testdb";

// ----------------- MONGOOSE MODEL -----------------
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  imagePath: { type: String, required: true },
  sequence: { type: Number, required: true }
});

const Item = mongoose.model('Item', itemSchema);

// ----------------- CONNECT TO MONGO -----------------
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ MongoDB connected");

    // Seed DB only if empty
    const count = await Item.countDocuments();
    if (count === 0) {
      const docs = Array.from({ length: 100 }).map((_, i) => ({
        name: `Item ${i + 1}`,
        category: `Category ${((i % 5) + 1)}`, // 5 categories
        imagePath: `https://picsum.photos/seed/item${i + 1}/300/200`,
        sequence: i + 1
      }));
      await Item.insertMany(docs);
      console.log("🌱 Seeded 100 items");
    }
  })
  .catch(err => console.error("❌ MongoDB error:", err));

// ----------------- API ENDPOINTS -----------------

// GET /api/items?skip=0&limit=20&search=&category=&sort=
app.get('/api/items', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = parseInt(req.query.skip) || 0;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const sort = req.query.sort || "latest";

    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (category && category !== "all") filter.category = category;

    let sortOption = { sequence: 1 }; // default by sequence
    if (sort === "latest") sortOption = { sequence: -1 };
    if (sort === "az") sortOption = { name: 1 };
    if (sort === "za") sortOption = { name: -1 };

    const [items, total] = await Promise.all([
      Item.find(filter).sort(sortOption).skip(skip).limit(limit),
      Item.countDocuments(filter)
    ]);

    res.json({ items, total });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/categories → distinct categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Item.distinct("category");
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
