import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import "../styles/checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { fetchCartCount } = useCart();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "Hồ Chí Minh",
    district: "",
    ward: "",
    street: "",
    note: ""
  });

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchCart();
    fetchUserInfo(); 
  }, []);

 const fetchUserInfo = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && data.user) {
      const { name, phone, address } = data.user;
      setForm({
        fullName: name    || "",
        phone:    phone   || "",
        street:   address?.street   || "",
        ward:     address?.ward     || "",
        district: address?.district || "",
        city:     address?.city     || "Hồ Chí Minh",
        note: ""
      });
    }
  } catch (error) {
    console.log("Lỗi tải thông tin user:", error);
  }
};

  const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.cart || data.cart.items.length === 0) {
        navigate("/cart");
        return;
      }
      setCart(data.cart);
    } catch (error) { console.log(error); } 
    finally { setLoading(false); }
  };

  const validate = () => {
    let newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!form.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Số điện thoại không hợp lệ";
    if (!form.district.trim()) newErrors.district = "Nhập Quận/Huyện";
    if (!form.ward.trim()) newErrors.ward = "Nhập Phường/Xã";
    if (!form.street.trim()) newErrors.street = "Nhập số nhà, tên đường";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrder = async () => {
    setServerError("");
    if (!validate()) return;

    const fullAddress = `${form.street}, ${form.ward}, ${form.district}, ${form.city}`;

    setOrdering(true);
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress: {
            fullName: form.fullName,
            phone: form.phone,
            address: fullAddress
          },
          userDetails: {
          name: form.fullName,
          phone: form.phone,
          address: {
            street: form.street,
            ward: form.ward,
            district: form.district,
            city: form.city
          }
        },
          paymentMethod,
          note: form.note
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchCartCount();
        navigate("/order-success");
      } else {
        setServerError(data.message || "Có lỗi xảy ra khi đặt hàng");
      }
    } catch (error) {
      setServerError("Lỗi kết nối server. Vui lòng thử lại sau.");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <div className="checkout-loading">Đang tải...</div>;
  if (!cart) return null;

  return (
    <div>
      <Navbar />
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="checkout-back" onClick={() => navigate("/cart")}>
            ← Quay lại giỏ hàng
          </button>
          <h2 className="checkout-title">Thanh Toán</h2>
        </div>

        <div className="checkout-content">
          {/* CỘT TRÁI */}
          <div className="checkout-left">
            <div className="checkout-section">
              <h3 className="section-title">
                <span className="section-num">1</span> Thông tin giao hàng
              </h3>
              
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  className={errors.fullName ? "input-error" : ""}
                  value={form.fullName}
                  onChange={(e) => {
                    setForm({ ...form, fullName: e.target.value });
                    if(errors.fullName) setErrors({...errors, fullName: ""});
                  }}
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="text"
                  className={errors.phone ? "input-error" : ""}
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    if(errors.phone) setErrors({...errors, phone: ""});
                  }}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="address-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div className="form-group">
                  <label>Tỉnh/Thành phố *</label>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quận/Huyện *</label>
                  <input
                    type="text"
                    className={errors.district ? "input-error" : ""}
                    value={form.district}
                    onChange={(e) => {
                        setForm({ ...form, district: e.target.value });
                        if(errors.district) setErrors({...errors, district: ""});
                    }}
                  />
                  {errors.district && <span className="error-text">{errors.district}</span>}
                </div>

                <div className="form-group">
                  <label>Phường/Xã *</label>
                  <input
                    type="text"
                    className={errors.ward ? "input-error" : ""}
                    value={form.ward}
                    onChange={(e) => {
                        setForm({ ...form, ward: e.target.value });
                        if(errors.ward) setErrors({...errors, ward: ""});
                    }}
                  />
                  {errors.ward && <span className="error-text">{errors.ward}</span>}
                </div>

                <div className="form-group">
                  <label>Số nhà, tên đường *</label>
                  <input
                    type="text"
                    className={errors.street ? "input-error" : ""}
                    value={form.street}
                    onChange={(e) => {
                        setForm({ ...form, street: e.target.value });
                        if(errors.street) setErrors({...errors, street: ""});
                    }}
                  />
                  {errors.street && <span className="error-text">{errors.street}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú đơn hàng</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

           
            <div className="checkout-section">
              <h3 className="section-title">
                <span className="section-num">2</span> Phương thức thanh toán
              </h3>
              <div className="payment-options">
                <div className={`payment-option ${paymentMethod === "cod" ? "active" : ""}`} onClick={() => setPaymentMethod("cod")}>
                  <div className="payment-radio">{paymentMethod === "cod" && <div className="radio-dot" />}</div>
                  <div className="payment-info"><span>🚚</span> <p className="payment-name">Thanh toán khi nhận hàng</p></div>
                </div>
                <div className={`payment-option ${paymentMethod === "vnpay" ? "active" : ""}`} onClick={() => setPaymentMethod("vnpay")}>
                  <div className="payment-radio">{paymentMethod === "vnpay" && <div className="radio-dot" />}</div>
                  <div className="payment-info"><span>💳</span> <p className="payment-name">VNPay</p></div>
                </div>
              </div>
            </div>
          </div>

       
          <div className="checkout-right">
            <div className="order-summary">
              <h3 className="section-title" style={{ marginBottom: "20px" }}>
                <span className="section-num">3</span> Đơn hàng
              </h3>
              <div className="order-items">
                {cart.items.map((item) => (
                  <div className="order-item" key={item._id}>
                    <div className="order-item-img">
                      <img src={item.product?.image} alt={item.product?.name} />
                      <span className="order-item-qty">{item.quantity}</span>
                    </div>
                    <div className="order-item-info">
                      <p className="order-item-name">{item.product?.name}</p>
                      <p className="order-item-price">{item.price.toLocaleString()} đ</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-divider" />
              <div className="order-total">
                <span>Tổng cộng</span>
                <span>{cart.totalPrice.toLocaleString()} đ</span>
              </div>

           
              {serverError && <p className="server-error-text">{serverError}</p>}

              <button className="btn-place-order" onClick={handleOrder} disabled={ordering}>
                {ordering ? "Đang xử lý..." : "Đặt hàng ngay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;