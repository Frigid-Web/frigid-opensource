import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
function MetamaskInstallationPage() {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <>
            <h1>Installation</h1>
        </>


    );
}

export default MetamaskInstallationPage

