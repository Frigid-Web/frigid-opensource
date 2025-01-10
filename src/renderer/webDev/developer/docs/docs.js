import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';

import { useNavigate } from "react-router-dom";

function Docs() {
    const dispatch = useDispatch()

    const navigate = useNavigate()

    return (
        <>
            <div className="top-rail-wrapper">
                <div className="top-rail-container">
                    <h1>Documentation</h1>
                    <div className="top-rail">
                        <NavLink className={({ isActive, isPending }) =>
                            isPending ? "pending" : isActive ? "top-rail-active top-rail-item" : "top-rail-item"
                        } to="/docs/publishing" >
                            <p>Publishing</p>
                        </NavLink>
                        <NavLink className={({ isActive, isPending }) =>
                            isPending ? "pending" : isActive ? "top-rail-active top-rail-item" : "top-rail-item"
                        } to="/docs/domains" >
                            <p>Domains</p>
                        </NavLink>
                        {/*  <NavLink className={({ isActive, isPending }) =>
                            isPending ? "pending" : isActive ? "top-rail-active top-rail-item" : "top-rail-item"
                        } to="/docs/metamask" >
                            <p>MetaMask</p>
                        </NavLink> */}

                        {/*  <NavLink className={({ isActive, isPending }) =>
                            isPending ? "pending" : isActive ? "top-rail-active top-rail-item" : "top-rail-item"
                        } to="/docs/design" >
                            <p>Design</p>
                        </NavLink>  */}
                    </div>

                    {/*   <p>iceburg54</p> */}
                </div>
                <Outlet />
                <style>
                    {
                        `
                        .top-rail-container {
                            border:none
                        }
                        `
                    }
                </style>
            </div>
        </>


    );
}

export default Docs;

