import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import "../styles/cart.css";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { fetchCartCount } = useCart();
  const [errorId, setErrorId] = useState(null);
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCart(data.cart);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


const updateQuantity = async (item, newQuantity) => {
  if (newQuantity < 1) return;

  const stock = item.product?.countInStock || 0;
  
  if (newQuantity > stock) {
    setErrorId(item._id); 
    setTimeout(() => setErrorId(null), 3000);
    return;
  }
  setErrorId(null);
  try {
    const res = await fetch(`http://localhost:5000/api/cart/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ quantity: newQuantity })
    });
    const data = await res.json();
    setCart(data.cart);
    fetchCartCount();
  } catch (error) { console.log(error); }
};

  const removeItem = async (itemId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCart(data.cart);
      fetchCartCount();
    } catch (error) { console.log(error); }
  };

  const clearCart = async () => {
    try {
      await fetch("http://localhost:5000/api/cart/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart({ items: [], totalPrice: 0 });
      fetchCartCount();
    } catch (error) { console.log(error); }
  };

  if (loading) return <div className="cart-loading">Đang tải giỏ hàng...</div>;

  const items = cart?.items || [];

  return (
    <div>
      <Navbar />
      <div className="cart-container">
        <h2 className="cart-title">Giỏ Hàng</h2>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Giỏ hàng của bạn đang trống</p>
            <button className="btn-shop" onClick={() => navigate("/products")}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item._id}>
                  <img src={item.product?.image} alt={item.product?.name} />
                  <div className="item-info">
                    <h3>{item.product?.name}</h3>
                    <p className="item-price">{item.price.toLocaleString()} đ</p>
                  </div>
                  <div className="item-quantity">
                   <button onClick={() => updateQuantity(item, item.quantity - 1)}>−</button>
                     <span>{item.quantity}</span>
                     <button onClick={() => updateQuantity(item, item.quantity + 1)}>+</button>
                  </div>
                  {errorId === item._id && (
                    <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                        Chỉ còn {item.product?.countInStock} sản phẩm
                    </p>
                  )}
                  <p className="item-subtotal">{(item.price * item.quantity).toLocaleString()} đ</p>
                  <button className="btn-remove" onClick={() => removeItem(item._id)}>✕</button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Tổng đơn hàng</h3>
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{cart.totalPrice.toLocaleString()} đ</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="summary-total">
                <span>Tổng cộng</span>
                <span>{cart.totalPrice.toLocaleString()} đ</span>
              </div>
              <button className="btn-checkout" onClick={() => navigate("/checkout")}>
                Thanh toán
              </button>
              <button className="btn-clear" onClick={clearCart}>Xóa giỏ hàng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;