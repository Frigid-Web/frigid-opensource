import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';

import { useNavigate } from "react-router-dom";
import SideRail from "../utils/sideRail";
import { useEffect } from "react";
function MetaMaskRoot() {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <>
            <SideRail railItems={[
                { name: "Introduction", path: "/docs/metamask/introduction" },
                { name: "Installation", path: "/docs/metamask/installation" },
                { name: "Usage", path: "/docs/metamask/usage" },
            ]} outlet={<Outlet />} />

        </>


    );
}

export default MetaMaskRoot

