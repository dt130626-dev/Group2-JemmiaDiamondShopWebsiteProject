import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/usermanagement.css";
import "../styles/ordermanagement.css";

function OrderManagement() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!token || role !== "admin") { navigate("/"); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Cập nhật trạng thái thành công!");
        setTimeout(() => setSuccess(""), 3000);
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const statusLabel = {
    processing: { text: "Đang xử lý", color: "#f39c12" },
    confirmed:  { text: "Đã xác nhận", color: "#3498db" },
    shipping:   { text: "Đang giao", color: "#9b59b6" },
    delivered:  { text: "Đã giao", color: "#27ae60" },
    cancelled:  { text: "Đã hủy", color: "#e74c3c" }
  };

  const paymentLabel = {
    pending: { text: "Chưa thanh toán", color: "#e74c3c" },
    paid:    { text: "Đã thanh toán", color: "#27ae60" }
  };

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter((o) => o.orderStatus === filterStatus);

  if (loading) return <div className="um-loading">Đang tải...</div>;

  return (
    <div>
      <Navbar />
      <div className="um-container">

        {/* Header */}
        <div className="um-header">
          <h2 className="um-title">Quản Lý Đơn Hàng</h2>
          <p className="um-count">
            Tổng: <strong>{orders.length}</strong> đơn hàng
          </p>
        </div>

        {success && <div className="um-success">✓ {success}</div>}
        {error && <div className="um-error">✕ {error}</div>}

        {/* Filter theo trạng thái */}
        <div className="filter-status-bar">
          {["all", "processing", "confirmed", "shipping", "delivered", "cancelled"].map((s) => (
            <button
              key={s}
              className={`filter-status-btn ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "Tất cả" : statusLabel[s]?.text}
              {s === "all"
                ? ` (${orders.length})`
                : ` (${orders.filter((o) => o.orderStatus === s).length})`
              }
            </button>
          ))}
        </div>

        <div className="om-layout">

          {/* Bảng đơn hàng */}
          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={selectedOrder?._id === order._id ? "selected-row" : ""}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <p style={{ fontWeight: 500, marginBottom: 2 }}>{order.user?.name}</p>
                      <p style={{ fontSize: 12, color: "#aaa" }}>{order.user?.email}</p>
                    </td>
                    <td style={{ color: "#b8962e", fontWeight: 600 }}>
                      {order.totalPrice.toLocaleString()} đ
                    </td>
                    <td>
                      <span className="status-badge" style={{
                        background: paymentLabel[order.paymentStatus]?.color + "20",
                        color: paymentLabel[order.paymentStatus]?.color,
                        border: `1px solid ${paymentLabel[order.paymentStatus]?.color}`
                      }}>
                        {paymentLabel[order.paymentStatus]?.text}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge" style={{
                        background: statusLabel[order.orderStatus]?.color + "20",
                        color: statusLabel[order.orderStatus]?.color,
                        border: `1px solid ${statusLabel[order.orderStatus]?.color}`
                      }}>
                        {statusLabel[order.orderStatus]?.text}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "#888" }}>
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => setSelectedOrder(
                          selectedOrder?._id === order._id ? null : order
                        )}
                      >
                        {selectedOrder?._id === order._id ? "Đóng" : "Xem"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Panel chi tiết đơn hàng */}
          {selectedOrder && (
            <div className="order-detail-panel">
              <div className="panel-header">
                <h3>Chi tiết đơn hàng</h3>
                <button className="panel-close" onClick={() => setSelectedOrder(null)}>✕</button>
              </div>

              {/* Thông tin giao hàng */}
              <div className="panel-section">
                <p className="panel-label">Thông tin giao hàng</p>
                <p><strong>{selectedOrder.shippingAddress?.fullName}</strong></p>
                <p>📞 {selectedOrder.shippingAddress?.phone}</p>
                <p>📍 {selectedOrder.shippingAddress?.address}</p>
                {selectedOrder.note && <p>📝 {selectedOrder.note}</p>}
              </div>

              {/* Sản phẩm */}
              <div className="panel-section">
                <p className="panel-label">Sản phẩm</p>
                {selectedOrder.items.map((item, i) => (
                  <div className="panel-item" key={i}>
                    <img src={item.image} alt={item.name} />
                    <div>
                      <p className="panel-item-name">{item.name}</p>
                      <p className="panel-item-price">
                        {item.price.toLocaleString()} đ × {item.quantity}
                      </p>
                    </div>
                    <p className="panel-item-total">
                      {(item.price * item.quantity).toLocaleString()} đ
                    </p>
                  </div>
                ))}
              </div>

              {/* Tổng tiền */}
              <div className="panel-section">
                <div className="panel-total">
                  <span>Tổng cộng</span>
                  <span>{selectedOrder.totalPrice.toLocaleString()} đ</span>
                </div>
                <p style={{ fontSize: 13, color: "#aaa", marginTop: 6 }}>
                  Phương thức: {selectedOrder.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : "VNPay"}
                </p>
              </div>

              {/* Cập nhật trạng thái */}
              {selectedOrder.orderStatus !== "cancelled" &&
               selectedOrder.orderStatus !== "delivered" && (
                <div className="panel-section">
                  <p className="panel-label">Cập nhật trạng thái</p>
                  <div className="status-actions">
                    {selectedOrder.orderStatus === "processing" && (
                      <button className="btn-status confirmed"
                        onClick={() => updateStatus(selectedOrder._id, "confirmed")}>
                        ✓ Xác nhận đơn
                      </button>
                    )}
                    {selectedOrder.orderStatus === "confirmed" && (
                      <button className="btn-status shipping"
                        onClick={() => updateStatus(selectedOrder._id, "shipping")}>
                        🚚 Bắt đầu giao
                      </button>
                    )}
                    {selectedOrder.orderStatus === "shipping" && (
                      <button className="btn-status delivered"
                        onClick={() => updateStatus(selectedOrder._id, "delivered")}>
                        ✓ Đã giao xong
                      </button>
                    )}
                    <button className="btn-status cancelled"
                      onClick={() => updateStatus(selectedOrder._id, "cancelled")}>
                      ✕ Hủy đơn
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default OrderManagement;