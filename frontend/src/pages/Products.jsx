import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Fuse from "fuse.js";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import "../styles/products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState(100000000);
  const productsPerPage = 6;
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { fetchCartCount } = useCart();
  const { wishlistIds, fetchWishlist } = useWishlist();

  const queryParams = new URLSearchParams(location.search);
  const searchKeyword = queryParams.get("search") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(data.products);
      } catch (error) {
        setError("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchKeyword.trim()) {
      const fuse = new Fuse(products, {
        keys: ["name", "category", "brand"],
        threshold: 0.4,
      });
      const fuseResults = fuse.search(searchKeyword);
      result = fuseResults.map((r) => r.item);
    }
    return result.filter((p) => p.price <= priceRange);
  }, [searchKeyword, products, priceRange]);

  const handleReset = () => {
    setPriceRange(100000000);
    navigate("/products");
    setCurrentPage(1);
  };

  const addToCart = async (productId) => {
    if (!token) {
      setErrorMessage("Vui lòng đăng nhập để mua hàng!");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (res.ok) {
        await fetchCartCount();
        navigate("/cart");
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "Có lỗi xảy ra");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error) {
      setErrorMessage("Lỗi kết nối máy chủ");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!token) {
      setErrorMessage("Vui lòng đăng nhập để lưu sản phẩm yêu thích!");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    const isWished = wishlistIds.includes(productId);
    try {
      if (isWished) {
        await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await fetch("http://localhost:5000/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId })
        });
      }
      fetchWishlist();
    } catch (error) { console.log(error); }
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexStart = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(indexStart, indexStart + productsPerPage);

  if (loading) return <div className="loading">Đang tải sản phẩm...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <Navbar />
      <div className="products-container">
        <h2 className="products-title">Bộ Sưu Tập</h2>
        <p className="products-subtitle">Trang sức cao cấp — Tinh tế từng chi tiết</p>

        {errorMessage && (
          <div style={{
            background: "#fdf0f0", color: "#e74c3c", border: "1px solid #e74c3c",
            padding: "12px 16px", borderRadius: "4px", marginBottom: "16px",
            fontSize: "14px", textAlign: "center"
          }}>
            {errorMessage}
          </div>
        )}

        <div className="filter-bar">
          <div className="filter-slider" style={{ flex: 1 }}>
            <div className="slider-label">
              <span>Giá tối đa: </span>
              <strong>{priceRange.toLocaleString()} đ</strong>
            </div>
            <input
              type="range"
              min={500000}
              max={100000000}
              step={500000}
              value={priceRange}
              onChange={(e) => { setPriceRange(Number(e.target.value)); setCurrentPage(1); }}
              className="price-slider"
            />
          </div>
          {(searchKeyword || priceRange < 100000000) && (
            <button className="filter-reset" onClick={handleReset}>✕ Xóa lọc</button>
          )}
        </div>

        {searchKeyword && (
          <p className="filter-result">
            Kết quả tìm kiếm cho: "<strong>{searchKeyword}</strong>" ({filteredProducts.length} sản phẩm)
          </p>
        )}

        {currentProducts.length === 0 ? (
          <div className="no-result">Không tìm thấy sản phẩm phù hợp</div>
        ) : (
          <div className="products-grid">
            {currentProducts.map((product) => (
              <div className="product-card" key={product._id}>

             
                <button
                  className="btn-wish"
                  onClick={() => toggleWishlist(product._id)}
                >
                  {wishlistIds.includes(product._id) ? "❤️" : "🤍"}
                </button>

                {product.countInStock < 10 && product.countInStock > 0 && (
                  <span className="stock-warning">Chỉ còn {product.countInStock}!</span>
                )}

                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">{product.price.toLocaleString()} đ</p>
                  <button
                    className="btn-detail"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    Xem chi tiết
                  </button>
                  <button
                    className="btn-add-cart"
                    onClick={() => addToCart(product._id)}
                    disabled={product.countInStock <= 0}
                  >
                    {product.countInStock <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Products;