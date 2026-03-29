import Navbar from "../components/Navbar";
import banner from "../images/image.png";
import Body from "../components/Body";
import About from "../components/About";
import Footer from "../components/Footer";
function Home() {
  return (
    <div>

   
      <Navbar />
 <img
        src={banner}
        alt="Banner"
        style={{ width: "100%", height: "auto" }}
      />
       <Body />
        <About />
        <Footer />

    </div>
  );
}

export default Home;