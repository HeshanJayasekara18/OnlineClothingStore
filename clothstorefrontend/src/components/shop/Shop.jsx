import Navbar from "../common/navbar/Navbar";
import ChatBot from "../common/ChatBot/ChatBot";
import Section1 from "./section1/Section1";

function Shop (){
    return(
        <div>
            <Navbar/>
            <Section1/>
            <ChatBot />
        </div>
    )
}


export default  Shop;