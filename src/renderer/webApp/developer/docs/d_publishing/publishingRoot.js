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
function PublishingRoot() {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <>
            <SideRail railItems={[
                { name: "Overview", path: "/docs/publishing/overview" },
                { name: "Quick Start Guide", path: "/docs/publishing/startguide" },
                { name: "Speed Up Publishing & Handle Large Files", path: "/docs/publishing/speedup" },
            ]} outlet={<Outlet />} />

        </>


    );
}

export default PublishingRoot

