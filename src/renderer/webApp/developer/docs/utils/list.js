import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';

import { useNavigate } from "react-router-dom";

function List(props) {
    const dispatch = useDispatch()

    const navigate = useNavigate()


    return (
        <>
            <div className="list-block">

                {
                    props.content &&
                    <ul>
                        {
                            props.content.map((item, index) => {
                                return (
                                    <li key={index}>
                                        {item}
                                    </li>
                                )
                            })
                        }
                    </ul>
                }
            </div>
        </>


    );
}

export default List

