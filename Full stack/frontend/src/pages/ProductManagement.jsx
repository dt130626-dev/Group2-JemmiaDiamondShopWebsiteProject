import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/usermanagement.css";

function ProductManagement() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
    countInStock: ""
  });

  useEffect(() => {
    if (!token || role !== "admin") { navigate("/"); return; }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", price: "", description: "", category: "", image: "", countInStock: "" });
    setEditProduct(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.description || !form.category || !form.image) {
      setError("Vui lòng điền đầy đủ thông tin"); return;
    }
    try {
      const url = editProduct
        ? `http://localhost:5000/api/products/${editProduct._id}`
        : "http://localhost:5000/api/products";
      const method = editProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          description: form.description,
          category: form.category,
          image: form.image,
          countInStock: Number(form.countInStock) || 0
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(editProduct ? "Cập nhật thành công!" : "Thêm sản phẩm thành công!");
        setTimeout(() => setSuccess(""), 3000);
        fetchProducts();
        resetForm();
      } else {
        setError(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      countInStock: product.countInStock
    });
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Đã xóa sản phẩm!");
        setTimeout(() => setSuccess(""), 3000);
        fetchProducts();
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) return <div className="um-loading">Đang tải...</div>;

  return (
    <div>
      <Navbar />
      <div className="um-container">

        {/* Header */}
        <div className="um-header">
          <h2 className="um-title">Quản Lý Sản Phẩm</h2>
          <button className="btn-add-user" onClick={() => { resetForm(); setShowForm(true); }}>
            + Thêm sản phẩm
          </button>
        </div>

        {success && <div className="um-success">✓ {success}</div>}
        {error && <div className="um-error">✕ {error}</div>}

        {/* Form */}
        {showForm && (
          <div className="um-form">
            <h3>{editProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
            <div className="um-form-grid">
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  placeholder="Nhẫn vàng 18k"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Giá (đ) *</label>
                <input
                  type="number"
                  placeholder="5000000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Danh mục *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">-- Chọn danh mục --</option>
                  <option value="ring">Nhẫn</option>
                  <option value="necklace">Dây chuyền</option>
                  <option value="earring">Bông tai</option>
                  <option value="bracelet">Vòng tay</option>
                  <option value="diamond">Kim cương</option>
                </select>
              </div>
              <div className="form-group">
                <label>Số lượng tồn kho</label>
                <input
                  type="number"
                  placeholder="10"
                  value={form.countInStock}
                  onChange={(e) => setForm({ ...form, countInStock: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label>Link ảnh *</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label>Mô tả *</label>
                <textarea
                  placeholder="Mô tả chi tiết sản phẩm..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  style={{ width: "100%", padding: "11px 14px", border: "1px solid #ddd", borderRadius: "2px", fontSize: "14px", outline: "none", resize: "none", fontFamily: "inherit", background: "#fafaf8" }}
                />
              </div>
            </div>

            {/* Preview ảnh */}
            {form.image && (
              <div className="image-preview">
                <p className="preview-label">Preview ảnh:</p>
                <img
                  src={form.image}
                  alt="preview"
                  onError={(e) => e.target.style.display = "none"}
                />
              </div>
            )}

            <div className="um-form-actions">
              <button className="btn-save" onClick={handleSubmit}>
                {editProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
              </button>
              <button className="btn-cancel" onClick={resetForm}>Hủy</button>
            </div>
          </div>
        )}

        {/* Bảng sản phẩm */}
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="table-img"
                      onError={(e) => e.target.src = "https://via.placeholder.com/50"}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>
                    <span className="role-badge user">{product.category}</span>
                  </td>
                  <td style={{ color: "#b8962e", fontWeight: "600" }}>
                    {product.price.toLocaleString()} đ
                  </td>
                  <td>{product.countInStock}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-edit" onClick={() => handleEdit(product)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDelete(product._id, product.name)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="um-count">Tổng: <strong>{products.length}</strong> sản phẩm</p>
      </div>
    </div>
  );
}

export default ProductManagement;