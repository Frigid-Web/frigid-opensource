import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';

import { useNavigate } from "react-router-dom";
import pluriIcon from '../../../../../assets/pluriIcon.png'
import usdtIcon from '../../../../../assets/usdtIcon.png'

function C_Domains() {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    return (
        <>
            <div className="content-chunks">
                <div className="banner-chunk">
                    <i className="material-icons">
                        info
                    </i>
                    <span> These two currencies are required to buy a domain using {
                        currentSelectedChain.name
                    }</span>
                </div>
                <div className="chunk-wrapper">
                    <button onClick={
                        () => window.open("https://simpleswap.io/", "_blank")

                    } className="chunk-btn">
                        <div className="chunk-left">
                            <img src={usdtIcon} alt="" />
                            <div className="chunk-text">
                                <h3>Get {currentSelectedChain.stableToken.name} for {currentSelectedChain.name}</h3>
                                <p>Available with SimpleSwap</p>
                            </div>
                        </div>
                        <div className="chunk-right">
                            <button className="chunk-right-btn">
                                <p>Open SimpleSwap</p>
                                <i className="material-icons">
                                    launch
                                </i>
                            </button>
                        </div>
                    </button>

                    <button onClick={
                        () => window.open("https://simpleswap.io/", "_blank")

                    } className="chunk-btn">
                        <div className="chunk-left">
                            <img src={
                                currentSelectedChain.image
                            } alt="" />
                            <div className="chunk-text">
                                <h3>Get {currentSelectedChain.nativeCurrency.symbol}</h3>
                                <p>Available with SimpleSwap</p>
                            </div>
                        </div>
                        <div className="chunk-right">
                            <button className="chunk-right-btn">
                                <p>Open SimpleSwap</p>
                                <i className="material-icons">
                                    launch
                                </i>
                            </button>
                        </div>
                    </button>
                </div>
            </div>
        </>


    );
}

export default C_Domains;

