import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const name = localStorage.getItem("name");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const { cartCount } = useCart();
  const { wishlistIds } = useWishlist();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/products?search=${keyword.trim()}`);
    else navigate("/products");
  };

  return (
    <nav className="navbar-container">
      <div className="nav-logo">
        <Link to="/" className="logo-text">💎 JEMMIA</Link>
      </div>

      <form className="nav-search-form" onSubmit={handleSearch}>
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm trang sức..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="search-btn">🔍</button>
        </div>
      </form>

      <div className="nav-menu">
        <Link to="/products" className="nav-item">Sản phẩm</Link>

        <Link to="/wishlist" className="nav-item wishlist-icon-wrapper">
          ❤️
          {wishlistIds.length > 0 && (
            <span className="wishlist-badge">{wishlistIds.length}</span>
          )}
        </Link>

        <Link to="/cart" className="nav-item cart-icon-wrapper">
          Giỏ hàng {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {token ? (
          <div className="nav-dropdown"
            onMouseEnter={() => setShowUserMenu(true)}
            onMouseLeave={() => setShowUserMenu(false)}>
            <span className="nav-item user-name">👤 {name} ▼</span>
            {showUserMenu && (
              <div className="dropdown-content">
                <Link to="/profile">Trang cá nhân</Link>
             
                <button onClick={logout} className="logout-btn">Đăng xuất</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-link">Đăng nhập</Link>
        )}

        {role === "admin" && (
          <div className="nav-dropdown admin-dropdown"
            onMouseEnter={() => setShowAdminMenu(true)}
            onMouseLeave={() => setShowAdminMenu(false)}>
            <span className="nav-item admin-label">⚙️ QUẢN TRỊ ▼</span>
            {showAdminMenu && (
              <div className="dropdown-content">
                <Link to="/admin/users">Quản lý Users</Link>
                <Link to="/admin/products">Quản lý Sản phẩm</Link>
                <Link to="/admin/orders">Quản lý Đơn hàng</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;