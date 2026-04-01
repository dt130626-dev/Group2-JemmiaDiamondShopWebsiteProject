import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/profile.css";

function Profile() {
  const [user, setUser] = useState({
    name: "", email: "", phone: "",
    address: { street: "", ward: "", district: "", city: "Hồ Chí Minh" }
  });
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("info");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
    fetchMyOrders();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUser(data.user);
    } catch (error) { console.log(error); }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (error) { console.log(error); }
  };

  const [error, setError] = useState("");

const handleUpdate = async (e) => {
  e.preventDefault();
  setError("");

  // ✅ Validate SĐT
  if (user.phone && !/^\d{10}$/.test(user.phone)) {
    setError("Số điện thoại không hợp lệ — phải đúng 10 chữ số");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    if (data.success) {
      setSuccess("Cập nhật thành công!");
      setTimeout(() => setSuccess(""), 3000);
      localStorage.setItem("name", data.user.name);
    }
  } catch (error) { console.log(error); }
};

  const statusLabel = {
    processing: "Đang xử lý",
    confirmed:  "Đã xác nhận",
    shipping:   "Đang giao",
    delivered:  "Đã giao",
    cancelled:  "Đã hủy"
  };

  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <div className="profile-sidebar">
          <button
            onClick={() => setActiveTab("info")}
            className={activeTab === "info" ? "active" : ""}
          >👤 Thông tin cá nhân</button>
          <button
            onClick={() => setActiveTab("orders")}
            className={activeTab === "orders" ? "active" : ""}
          >📦 Đơn hàng của tôi</button>
        </div>

        <div className="profile-content">
          {activeTab === "info" ? (
            <form onSubmit={handleUpdate} className="profile-form">
              <h2>Tài khoản của tôi</h2>

              {success && <div className="profile-success">✓ {success}</div>}

              {/* Thông tin cơ bản */}
              <div className="profile-section-label">Thông tin cơ bản</div>
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  style={{ background: "#f0f0f0", color: "#aaa", cursor: "not-allowed" }}
                />
              </div>
              <div className="form-group">
  <label>Số điện thoại</label>
  <input
    type="text"
    value={user.phone}
    onChange={(e) => {
      setUser({ ...user, phone: e.target.value });
      if (error) setError(""); // ✅ xóa lỗi khi user gõ lại
    }}
    style={{ borderColor: error ? "#e74c3c" : "" }}
  />
  {error && <span style={{
    color: "#e74c3c",
    fontSize: "12px",
    marginTop: "6px",
    display: "block",
    letterSpacing: "0.5px"
  }}>{error}</span>}
</div>
              {/* Địa chỉ giao hàng */}
              <div className="profile-section-label" style={{ marginTop: "24px" }}>
                Địa chỉ giao hàng mặc định
              </div>
              <div className="address-grid">
                <div className="form-group">
                  <label>Tỉnh/Thành phố</label>
                  <select
                    value={user.address?.city || "Hồ Chí Minh"}
                    onChange={(e) => setUser({ ...user, address: { ...user.address, city: e.target.value } })}
                  >
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Quận 1"
                    value={user.address?.district || ""}
                    onChange={(e) => setUser({ ...user, address: { ...user.address, district: e.target.value } })}
                  />
                </div>
                <div className="form-group">
                  <label>Phường/Xã</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Phường Bến Nghé"
                    value={user.address?.ward || ""}
                    onChange={(e) => setUser({ ...user, address: { ...user.address, ward: e.target.value } })}
                  />
                </div>
                <div className="form-group">
                  <label>Số nhà, tên đường</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 123 Nguyễn Huệ"
                    value={user.address?.street || ""}
                    onChange={(e) => setUser({ ...user, address: { ...user.address, street: e.target.value } })}
                  />
                </div>
              </div>

              <button type="submit" className="btn-save">Lưu thay đổi</button>
            </form>
          ) : (
            <div className="orders-list">
              <h2>Lịch sử đặt hàng</h2>
              {orders.length === 0 ? (
                <p style={{ color: "#aaa", textAlign: "center", padding: "40px", letterSpacing: "1px" }}>
                  Bạn chưa có đơn hàng nào
                </p>
              ) : (
                orders.map(order => (
                  <div key={order._id} className="order-card">
                    <div className="order-card-header">
                      <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                      <span className={`status ${order.orderStatus}`}>
                        {statusLabel[order.orderStatus] || order.orderStatus}
                      </span>
                    </div>
                    <p>📅 {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                    <p>📍 {order.shippingAddress?.address}</p>
                    <div className="order-card-items">
                      {order.items?.map((item, i) => (
                        <span key={i} className="order-item-tag">{item.name} x{item.quantity}</span>
                      ))}
                    </div>
                    <p className="order-card-total">
                      Tổng: <strong>{order.totalPrice?.toLocaleString()}đ</strong>
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;