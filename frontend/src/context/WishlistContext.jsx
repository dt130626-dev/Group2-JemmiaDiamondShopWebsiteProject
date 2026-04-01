import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState([]);

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setWishlistIds([]); return; }
    try {
      const res = await fetch("http://localhost:5000/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWishlistIds(data.wishlist.map((p) => p._id));
      }
    } catch (error) { console.log(error); }
  };

  useEffect(() => { fetchWishlist(); }, []);

  return (
    <WishlistContext.Provider value={{ wishlistIds, setWishlistIds, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}