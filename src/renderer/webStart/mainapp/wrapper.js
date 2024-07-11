import { Outlet } from "react-router-dom";
import H_Navbar from "./hompage/h_navbar";

import peng from '../../../../assets/penguins.png'


const Wrapper = () => {


    return (
        <>
            <div className="start-background">
                <img src={peng} />
                <div className="start-background-overlay"></div>
            </div>
            <div className="start-aligner">

                <H_Navbar />
                <Outlet />
            </div>

        </>
    )
}

export default Wrapper;