// src/App.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

const LIMIT = 20; // items per batch
const DELAY = 500; // delay to simulate loading
const BASE_URL = "http://localhost:5000"; // backend URL

// ------------------ Login Component ------------------
function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/login`, form);
      alert("Login successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Login
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Don’t have an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}

// ------------------ Signup Component ------------------
function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/signup`, form);
      alert("Signup successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Signup
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

// ------------------ Items Component ------------------
function Items() {
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [categories, setCategories] = useState([]);
  const observerRef = useRef();

  // Fetch categories for filter
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const fetchItems = useCallback(
    async (reset = false) => {
      if (loading) return;
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, DELAY));
        const res = await axios.get(`${BASE_URL}/api/items`, {
          params: { skip: reset ? 0 : skip, limit: LIMIT, search, category, sort },
        });

        if (reset) {
          setItems(res.data.items);
          setSkip(LIMIT);
        } else {
          setItems((prev) => [...prev, ...res.data.items]);
          setSkip((prev) => prev + LIMIT);
        }
        setTotal(res.data.total);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    },
    [skip, loading, search, category, sort]
  );

  // Initial + filters fetch
  useEffect(() => {
    fetchItems(true);
  }, [search, category, sort]);

  // Infinite scroll observer
  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && items.length < total) {
            fetchItems();
          }
        },
        { rootMargin: "200px" }
      );
      if (node) observerRef.current.observe(node);
    },
    [loading, items, total, fetchItems]
  );

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "20px" }}>
      {/* Filters + Search */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1",
            minWidth: "200px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px" }}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px" }}
        >
          <option value="latest">Latest</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
      </div>

      {/* Items Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {items.map((item, index) => {
          const card = (
            <div
              key={item._id}
              style={{
                background: "#111",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                color: "#fff",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={item.imagePath}
                alt={item.name}
                style={{ width: "100%", height: "180px", objectFit: "cover" }}
              />
              <div style={{ padding: "12px" }}>
                <h3
                  style={{
                    margin: "5px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {item.name}
                </h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#bbb" }}>
                  {item.category}
                </p>
              </div>
            </div>
          );
          if (index === items.length - 1)
            return (
              <div ref={lastItemRef} key={item._id}>
                {card}
              </div>
            );
          return card;
        })}
      </div>

      {/* Status */}
      {loading && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>Loading...</p>
      )}
      {items.length >= total && !loading && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>All items loaded</p>
      )}
    </div>
  );
}

// ------------------ Main App ------------------
export default function AppWrapper() {
  return (
    <Router>
      <nav style={{ textAlign: "center", margin: "20px 0" }}>
        <Link to="/" style={{ margin: "0 10px" }}>
          Home
        </Link>
        <Link to="/login" style={{ margin: "0 10px" }}>
          Login
        </Link>
        <Link to="/signup" style={{ margin: "0 10px" }}>
          Signup
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Items />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}
