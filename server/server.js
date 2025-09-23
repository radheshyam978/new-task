require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ----------------- CONFIG -----------------
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/testdb";

// ----------------- MONGOOSE MODEL -----------------
const itemSchema = new mongoose.Schema({
  name: String,
  category: String,
  imagePath: String,
  sequence: Number
});
const Item = mongoose.model('Item', itemSchema);

// ----------------- CONNECT TO MONGO -----------------
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("MongoDB connected");

    // Seed DB only if empty
    const count = await Item.countDocuments();
    if (count === 0) {
      const docs = Array.from({ length: 100 }).map((_, i) => ({
        name: `Item ${i + 1}`,
        category: `Category ${((i % 5) + 1)}`,
        imagePath: `https://picsum.photos/seed/item${i + 1}/300/200`,
        sequence: i + 1
      }));
      await Item.insertMany(docs);
      console.log("Seeded 100 items");
    }
  })
  .catch(err => console.error("MongoDB error:", err));

// ----------------- API ENDPOINT -----------------
// GET /api/items?skip=0&limit=20
app.get('/api/items', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = parseInt(req.query.skip) || 0;

    const [items, total] = await Promise.all([
      Item.find({})
          .sort({ sequence: 1 })
          .skip(skip)
          .limit(limit),
      Item.countDocuments()
    ]);

    res.json({ items, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
