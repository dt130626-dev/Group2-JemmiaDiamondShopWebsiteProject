import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import "../styles/productdetail.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const { fetchCartCount } = useCart();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await res.json();
        setProduct(data.product);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
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
      body: JSON.stringify({ productId: id, quantity: 1 })
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

  if (loading) return <div className="detail-loading">Đang tải...</div>;
  if (!product) return <div className="detail-error">Không tìm thấy sản phẩm</div>;

  return (
    <div>
      <Navbar />
      <div className="detail-container">
        <button className="btn-back" onClick={() => navigate("/products")}>
          ← Quay lại
        </button>
        <div className="detail-content">
          <div className="detail-image">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="detail-info">
            <p className="detail-category">{product.category}</p>
            <h1 className="detail-name">{product.name}</h1>
            <p className="detail-price">{product.price.toLocaleString()} đ</p>
            <div className="detail-divider" />
            <p className="detail-description">{product.description}</p>
            <div className="detail-divider" />
            <p className="detail-stock">
              {product.countInStock > 0
                ? `Còn ${product.countInStock} sản phẩm`
                : "Hết hàng"}
            </p>
            <button
              className="btn-detail-cart"
              onClick={addToCart}
              disabled={product.countInStock === 0}
            >
              {product.countInStock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
            </button>
            {errorMessage && (
                <p style={{ color: 'red', fontSize: '14px', marginTop: '10px', fontWeight: 'bold' }}>
                         {errorMessage}
                </p>
                    )}
            <button className="btn-detail-back" onClick={() => navigate("/products")}>
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;