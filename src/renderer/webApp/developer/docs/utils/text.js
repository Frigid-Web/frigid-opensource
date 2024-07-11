import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';

import { useNavigate } from "react-router-dom";

function Text(props) {
    const dispatch = useDispatch()

    const navigate = useNavigate()


    return (
        <>
            <div className="text-block">
                {
                    props.title &&
                    <h1>{props.title}</h1>
                }
                {
                    props.subtitle &&
                    <h2>{props.subtitle}</h2>
                }
                {
                    props.content &&
                    <p>
                        {props.content}
                    </p>
                }
                {
                    props.link &&
                    <div className="text-link">
                        {
                            props.link.map((l, i) => {
                                return (
                                    <Link to={l.link} key={i}>{l.name}</Link>
                                )

                            }
                            )
                        }
                    </div>
                }
            </div>
        </>


    );
}

export default Text

