import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const LIMIT = 20; // items per batch
const DELAY = 5000; // 5 seconds delay

function App() {
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();

  const fetchItems = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      // simulate network delay
      await new Promise(resolve => setTimeout(resolve, DELAY));

      const res = await axios.get("http://localhost:5000/api/items", {
        params: { skip, limit: LIMIT }
      });

      setItems(prev => [...prev, ...res.data.items]);
      setTotal(res.data.total);
      setSkip(prev => prev + LIMIT);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  }, [skip, loading]);

  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, []);

  // Intersection observer for lazy loading
  const lastItemRef = useCallback(node => {
    if (loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && items.length < total) {
        fetchItems();
      }
    }, { rootMargin: "200px" });

    if (node) observerRef.current.observe(node);
  }, [loading, items, total, fetchItems]);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Item List</h1>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px"
      }}>
        {items.map((item, index) => {
          const card = (
            <div key={item._id} style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
              cursor: "pointer"
            }}>
              <img
                src={item.imagePath}
                alt={item.name}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <div style={{ padding: "10px" }}>
                <h3 style={{ margin: "5px 0" }}>{item.name}</h3>
                <p style={{ margin: 0, color: "#555" }}>{item.category}</p>
              </div>
            </div>
          );

          if (index === items.length - 1) {
            return <div ref={lastItemRef} key={item._id}>{card}</div>;
          }
          return card;
        })}
      </div>

      {loading && <p style={{ textAlign: "center", marginTop: "20px" }}>Loading next batch...</p>}
      {items.length >= total && !loading &&
        <p style={{ textAlign: "center", marginTop: "20px" }}>All items loaded</p>}
    </div>
  );
}

export default App;
