import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';

import { useNavigate } from "react-router-dom";
import SideRail from "../utils/sideRail";

function DomainRoot() {
    const dispatch = useDispatch()

    const navigate = useNavigate()

    return (
        <>
            <SideRail railItems={[
                { name: "Overview", path: "/docs/domains/overview" },
                { name: "How To Buy a Domain", path: "/docs/domains/howto" },
                { name: "Sell/Transfer Domain", path: "/docs/domains/sellandtransfer" },
                /* { name: "Setup Redirects", path: "/docs/metamask/installation" },
             
                { name: "Indexing By Search Engine", path: "/docs/metamask/usage" } */
            ]} outlet={<Outlet />} />

        </>


    );
}

export default DomainRoot

