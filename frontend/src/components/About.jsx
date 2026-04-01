import "../styles/about.css";
import aboutImg from "../images/about.jpg";

function About() {
  return (
    <div className="about">

      <h2 className="about-title">VỀ JEMMIA DIAMOND</h2>

      <div className="about-container">

        <div className="about-image">
          <img src={aboutImg} alt="diamond"/>
        </div>

        <div className="about-text">
          <h3>Dẫn đầu trong chế tác kim cương</h3>

          <p>
            Jemmia Diamond là thương hiệu trang sức kim cương cao cấp,
            nổi bật với những thiết kế tinh xảo và sang trọng.
          </p>

          <p>
            Mỗi sản phẩm được chế tác bởi đội ngũ nghệ nhân lành nghề,
            sử dụng kim cương tự nhiên được tuyển chọn kỹ lưỡng.
          </p>

          <p>
            Chúng tôi cam kết mang đến giá trị thẩm mỹ, chất lượng
            và trải nghiệm dịch vụ cao cấp cho khách hàng.
          </p>

        </div>

      </div>

    </div>
  );
}

export default About;