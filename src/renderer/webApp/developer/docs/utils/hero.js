import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';

import { useNavigate } from "react-router-dom";

function Hero(props) {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    const railItems = props.railItems

    return (
        <>
            <div className="hero" style={{
                backgroundColor: props.color,
            }}>
                <div className="hero-text">
                    <h1>{props.title}</h1>
                    <p>
                        {props.description}
                    </p>
                </div>
                <i className="material-icons" style={{
                    color: props.color
                }}>
                    {props.icon}
                </i>
            </div>
            <style>
                {
                    `
                    :root {
                        --doc-color: ${props.color};
                    } 
                    `
                }
            </style>
        </>


    );
}

export default Hero

