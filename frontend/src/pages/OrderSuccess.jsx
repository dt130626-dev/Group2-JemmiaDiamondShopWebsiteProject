import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        background: "#fafaf8",
        textAlign: "center",
        padding: "40px"
      }}>
        <div style={{ fontSize: "60px", marginBottom: "24px" }}>✓</div>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "400",
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "#1a1a1a",
          marginBottom: "16px"
        }}>
          Đặt hàng thành công
        </h2>
        <p style={{ color: "#aaa", fontSize: "14px", letterSpacing: "1px", marginBottom: "40px" }}>
          Cảm ơn bạn đã tin tưởng JEMMIA DIAMOND. Chúng tôi sẽ liên hệ sớm nhất.
        </p>
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => navigate("/products")}
            style={{
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              padding: "14px 32px",
              fontSize: "12px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: "2px"
            }}
          >
            Tiếp tục mua sắm
          </button>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              color: "#888",
              border: "1px solid #ddd",
              padding: "14px 32px",
              fontSize: "12px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: "2px"
            }}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;