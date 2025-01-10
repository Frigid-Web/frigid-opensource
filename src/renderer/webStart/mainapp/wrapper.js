import { Outlet } from "react-router-dom";
import H_Navbar from "./hompage/h_navbar";

import peng from '../../../../assets/penguins.png'
import { useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";
import { setCurrentHue } from "../../store/schemas/hueSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

const Wrapper = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    // 1) On mount, load color (hue) from localStorage if it exists.
    useEffect(() => {
        const storedHue = localStorage.getItem('selectedHue');
        if (storedHue) {
            // parse the stored hue object
            const parsedHue = JSON.parse(storedHue);
            dispatch(setCurrentHue(parsedHue));
        } else {
            navigate('/onboarding/start')
        }
    }, [dispatch]);

    const currentHue = useSelector(state => state.mainapp.hueSlice.currentHue)

    return (
        <>
            <div className="start-background">
                {/*     <img src={peng} /> */}
                <div className="start-background-overlay" style={
                    {
                        background: 'linear-gradient(90deg, ' + currentHue.primaryColor + ' 0%, ' + currentHue.backgroundColor + ' 100%)'
                    }
                }></div>
            </div>
            <div className="start-aligner">

                <H_Navbar />
                <Outlet />

                <div className="customize-btn">
                    <button onClick={
                        () => navigate('/onboarding/hue')
                    } style={
                        {
                            background: currentHue.lightPrimaryColor
                        }
                    } className="color-hue-customize">
                        <i style={
                            {
                                color: currentHue.backgroundColor
                            }
                        } className="material-icons">

                        </i>
                    </button>
                </div>
            </div>

            {
                <style>
                    {
                        `
                            :root {
                            --main-color: ${currentHue.lightPrimaryColor};
                            `
                    }
                </style>
            }
        </>
    )
}

export default Wrapper;