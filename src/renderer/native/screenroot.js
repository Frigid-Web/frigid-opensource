import React, { useEffect } from "react";
import { Link, Outlet, Route, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from '../../../assets/frigidlogo.png'
import { toggleNetworkActive } from "../store/schemas/networkSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Permission from "./permissions/permission";
import { Tooltip } from "@mantine/core";


function ScreenRoot() {
    const dispatch = useDispatch()
    const networkActive = useSelector(state => state.mainapp.networkSlice.networkActive)

    const [loaded, setLoaded] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        (async () => {
            const onBoarding = await window.electron.store.get('onboardingStatus')
            if (onBoarding != true) {
                navigate('/onboarding/start')
            }
            setLoaded(true)
        })()
    }, [])

    return (
        <>
            <div className="root-container">


                <div className="side-panel">
                    <div className="side-panel-drag-header">
                    </div>
                    <div className="side-panel-mid">
                        <img src={logo} />
                        <div className="side-panel-items">
                            <NavLink to="/" className="side-panel-item" activeClassName="active">
                                <div className="side-item">
                                    <i className="material-icons">bolt</i>
                                    <p>Network</p>
                                </div>
                            </NavLink>


                            {/*      <NavLink to="/whatsnew" className="side-panel-item" activeClassName="active">
                                <div className="side-item">
                                    <i style={{ fontSize: 22 }} className="material-icons">new_releases</i>
                                    <p>What's New</p>
                                </div>
                            </NavLink> */}


                            {/*   <NavLink to="/apps" className="side-panel-item" activeClassName="active">
                                <div className="side-item">
                                    <i style={{ fontSize: 22 }} className="material-icons">local_mall</i>
                                    <p>DApps</p>
                                </div>
                            </NavLink> */}


                            {
                                networkActive ? <NavLink to="/developer" className="side-panel-item" activeClassName="active">
                                    <div className="side-item">
                                        <i style={{ fontSize: 22 }} className="material-icons">terminal</i>
                                        <p>Developer</p>
                                    </div>
                                </NavLink> : <Tooltip label="Power On Network to View Developer Tools" offset={15} position="right">
                                    <div className="side-panel-item" style={{
                                        cursor: 'not-allowed'

                                    }}>
                                        <div className="side-item">
                                            <i style={{ fontSize: 22 }} className="material-icons">terminal</i>
                                            <p>Developer</p>
                                        </div>
                                    </div>
                                </Tooltip>
                            }



                        </div>
                    </div>
                    <div className="side-panel-dragger"></div>
                    <div className="side-panel-footer">
                        {/*   {
         
            window.location.pathname === '/' ? null : <button className='mini-net-btn' onClick={
                () => {
                   
                    if (!networkActive) {
                        setLoading(true)
                    }
                    setTimeout(() => {

                        if (!networkActive) {
                            dispatch(toggleNetworkActive())
                            setLoading(false)
                        }


                    }, 1400)
                    if (networkActive) {
                        dispatch(toggleNetworkActive())
                    }

                }

            }>

                <i className={
                    loading ? 'material-icons vivify blink infinite' : 'material-icons'
                }>power_settings_new</i>

            </button>

        } */}
                        <NavLink to="/settings" className="side-panel-item" activeClassName="active">
                            <div className="side-item">
                                <i style={{ fontSize: 25 }} className="material-icons">settings</i>
                                <p>Settings</p>
                            </div>
                        </NavLink>
                    </div>
                </div>
                <div className="main-panel">
                    <div className="main-panel-inlet">
                        <Outlet />
                    </div>
                </div>


                <style>
                    {
                        networkActive ? `
body {
background: linear-gradient(110deg, #00699D 23.08%, #00224A 93.64%);
}
` : `
body {
background: var(--base-gray)
}
.network-status > i {
color: white; 
opacity: 0.2
}
.mini-net-btn {
background: transparent;
border: 2.5px solid rgba(255, 255, 255, 0.59);
}
.mini-net-btn > i {
color: rgba(255, 255, 255, 0.59)
}

.net-btn {
background: transparent;
border: 4.5px solid rgba(255, 255, 255, 0.59);
}
.net-btn > i {
color: rgba(255, 255, 255, 0.59)
}
`
                    }
                </style>
            </div>
        </>


    );
}

export default ScreenRoot;

