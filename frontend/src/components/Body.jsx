import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/body.css";
import video from "../images/video.webm";

function Body() {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProducts();
  }, []);

  // Tự động chạy slideshow
  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [products]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  return (
    <div className="body">

      <h2 className="intro-title">DẪN ĐẦU TRONG CHẾ TÁC KIM CƯƠNG</h2>

      <video
        className="intro-video"
        src={video}
        autoPlay
        muted
        loop
        controls
      />

      <h2 className="title">SẢN PHẨM NỔI BẬT</h2>

      {products.length > 0 && (
        <div className="slideshow">

          {/* Nút trái */}
          <button className="slide-btn slide-prev" onClick={prevSlide}>‹</button>

          {/* Các card hiển thị */}
          <div className="slide-track">
            {[0, 1, 2].map((offset) => {
              const index = (currentIndex + offset) % products.length;
              const product = products[index];
              return (
                <div
                  className="slide-card"
                  key={product._id}
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <div className="slide-img">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="slide-info">
                    <h3>{product.name}</h3>
                    <p className="slide-price">{product.price.toLocaleString()} đ</p>
                    <span className="slide-detail">Xem chi tiết →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nút phải */}
          <button className="slide-btn slide-next" onClick={nextSlide}>›</button>

          {/* Dots */}
          <div className="slide-dots">
            {products.map((_, i) => (
              <button
                key={i}
                className={`slide-dot ${i === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

export default Body;