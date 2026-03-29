import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import "../styles/wishlist.css";

function Wishlist() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { wishlistIds, fetchWishlist } = useWishlist();
  const { fetchCartCount } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setProducts(data.wishlist);
    } catch (error) { console.log(error); }
    finally { setLoading(false); }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter((p) => p._id !== productId));
      fetchWishlist();
    } catch (error) { console.log(error); }
  };

  const addToCart = async (productId) => {
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (res.ok) {
        await fetchCartCount();
        navigate("/cart");
      }
    } catch (error) { console.log(error); }
  };

  if (loading) return <div className="wishlist-loading">Đang tải...</div>;

  return (
    <div>
      <Navbar />
      <div className="wishlist-container">
        <h2 className="wishlist-title">Sản Phẩm Yêu Thích</h2>

        {products.length === 0 ? (
          <div className="wishlist-empty">
            <p>❤️ Bạn chưa có sản phẩm yêu thích nào</p>
            <button onClick={() => navigate("/products")}>Khám phá sản phẩm</button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {products.map((product) => (
              <div className="wishlist-card" key={product._id}>
                <button
                  className="btn-remove-wish"
                  onClick={() => removeFromWishlist(product._id)}
                >✕</button>
                <img
                  src={product.image}
                  alt={product.name}
                  onClick={() => navigate(`/products/${product._id}`)}
                />
                <div className="wishlist-info">
                  <h3 onClick={() => navigate(`/products/${product._id}`)}>
                    {product.name}
                  </h3>
                  <p className="wishlist-price">{product.price.toLocaleString()} đ</p>
                  <p className="wishlist-stock">
                    {product.countInStock > 0 ? `Còn ${product.countInStock} sản phẩm` : "Hết hàng"}
                  </p>
                  <button
                    className="btn-wish-cart"
                    onClick={() => addToCart(product._id)}
                    disabled={product.countInStock === 0}
                  >
                    {product.countInStock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;