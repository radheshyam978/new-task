import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchItems } from './api';

export default function App() {
  const CHUNK = 20;
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const loaderRef = useRef(null);

  // Load more items
  const loadMore = useCallback(async () => {
    if (loading || finished) return;
    setLoading(true);

    try {
      const { items: newItems, totalCap } = await fetchItems(skip, CHUNK);

      if (!newItems || newItems.length === 0) {
        setFinished(true);
        return;
      }

      // Append and sort
      setItems(prev => [...prev, ...newItems].sort((a, b) => a.sequence - b.sequence));
      setSkip(prev => prev + newItems.length);

      if (skip + newItems.length >= totalCap) setFinished(true);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, [skip, loading, finished]);

  // Initial load
  useEffect(() => {
    loadMore();
  }, []);

  // Lazy-load with IntersectionObserver
  useEffect(() => {
    if (finished) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !finished) {
          loadMore();
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore, finished, loading]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Items (Lazy Loaded with Skeletons)</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Render loaded items */}
        {items.length > 0 && items.map((it, i) => (
          <div key={i} className="border rounded p-2">
            <img
              src={it.imagePath}
              alt={it.name}
              loading="lazy"
              className="w-full h-32 object-cover mb-2 rounded"
            />
            <div className="font-semibold">{it.name}</div>
            <div className="text-sm text-gray-600">{it.category}</div>
          </div>
        ))}

        {/* Show skeletons while loading */}
        {loading && Array.from({ length: CHUNK }).map((_, idx) => (
          <div key={`skeleton-${idx}`} className="border rounded p-2 animate-pulse">
            <div className="w-full h-32 bg-gray-300 mb-2 rounded"></div>
            <div className="h-4 bg-gray-300 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}

        {/* No items */}
        {!loading && items.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            No items found
          </div>
        )}
      </div>

      {/* Observer div */}
      <div ref={loaderRef} className="py-4 text-center">
        {!finished && loading && "Loading..."}
        {finished && items.length > 0 && "✅ All items loaded"}
      </div>
    </div>
  );
}
