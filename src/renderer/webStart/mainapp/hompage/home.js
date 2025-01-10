import H_Navbar from "./h_navbar";
import H_Clock from "./h_clock";
import H_Blocks from "./h_blocks";
import { Outlet } from "react-router-dom";

const Home = () => {


    return (
        <>
            <Outlet />
            <H_Clock />
            <H_Blocks />


        </>
    )
}

export default Home;