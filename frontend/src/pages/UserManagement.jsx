import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/usermanagement.css";

function UserManagement() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token || role !== "admin") { navigate("/"); return; }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "user" });
    setEditUser(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError("Vui lòng điền đầy đủ thông tin"); return; }
    if (!editUser && !form.password) { setError("Vui lòng nhập mật khẩu"); return; }

    try {
      const url = editUser
        ? `http://localhost:5000/api/auth/users/${editUser._id}`
        : "http://localhost:5000/api/auth/users";
      const method = editUser ? "PUT" : "POST";

      const body = editUser
        ? { name: form.name, email: form.email, role: form.role }
        : { name: form.name, email: form.email, password: form.password, role: form.role };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(editUser ? "Cập nhật thành công!" : "Tạo user thành công!");
        setTimeout(() => setSuccess(""), 3000);
        fetchUsers();
        resetForm();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa user "${name}"?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Đã xóa user!");
        setTimeout(() => setSuccess(""), 3000);
        fetchUsers();
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
          <h2 className="um-title">Quản Lý Users</h2>
          <button className="btn-add-user" onClick={() => { resetForm(); setShowForm(true); }}>
            + Thêm user
          </button>
        </div>

        {/* Thông báo */}
        {success && <div className="um-success">✓ {success}</div>}
        {error && <div className="um-error">✕ {error}</div>}

        {/* Form thêm/sửa */}
        {showForm && (
          <div className="um-form">
            <h3>{editUser ? "Chỉnh sửa user" : "Thêm user mới"}</h3>
            <div className="um-form-grid">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {!editUser && (
                <div className="form-group">
                  <label>Mật khẩu *</label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 5 ký tự"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {error && <p className="um-error">{error}</p>}
            <div className="um-form-actions">
              <button className="btn-save" onClick={handleSubmit}>
                {editUser ? "Lưu thay đổi" : "Tạo user"}
              </button>
              <button className="btn-cancel" onClick={resetForm}>Hủy</button>
            </div>
          </div>
        )}

        {/* Bảng users */}
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-edit" onClick={() => handleEdit(user)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDelete(user._id, user.name)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="um-count">Tổng: <strong>{users.length}</strong> users</p>
      </div>
    </div>
  );
}

export default UserManagement;