import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';

import { useNavigate } from "react-router-dom";

function SideRail(props) {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    const railItems = props.railItems

    return (
        <>
            <div className="rail-wrapper">
                <div className="side-rail">
                    {
                        railItems.map((item, index) => {
                            return (
                                <>

                                    <NavLink to={item.path} className={({ isActive, isPending }) =>
                                        isPending ? "pending" : isActive ? "rail-active side-rail-item" : "side-rail-item"
                                    } key={index}>
                                        <div className="rail-line"></div>
                                        <div className="rail-item">

                                            <p>{item.name}</p>
                                        </div>
                                    </NavLink></>
                            )
                        })

                    }

                </div>
                <div className="rail-outlet">
                    {props.outlet}
                </div>
            </div>
        </>


    );
}

export default SideRail

