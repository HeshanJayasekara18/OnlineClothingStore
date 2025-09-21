import Section1 from "../landing/section1/Section1"
import Navbar from "../common/navbar/Navbar";
import { Outlet } from "react-router-dom";
import Section2 from "../landing/section2/Section2"
import Footer from "../common/footer/footer"

function Landing() {
    return (
        <div>
            <Navbar/>
            <Section1/>
            <Section2/>
            <Outlet />
            <Footer/>
        </div>
    )

    
      
    
}

export default Landing;