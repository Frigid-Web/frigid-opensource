import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';

import { useNavigate } from "react-router-dom";
import pluriIcon from '../../../../../assets/pluriIcon.png'
import PluriFaucet from "./pluriFaucet";
import { Modal } from '@mantine/core';
function C_AppPublishing() {
    const dispatch = useDispatch()
    const [opened, { open, close }] = useDisclosure(false);
    const toggleModal = () => opened ? close() : open();
    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    const navigate = useNavigate()

    return (
        <>
            <div className="content-chunks">
                <div className="banner-chunk">
                    <i className="material-icons">
                        info
                    </i>
                    <span> These two currencies are required to publish an app using {
                        currentSelectedChain.name
                    }</span>
                </div>
                <div className="chunk-wrapper">
                    <button className="chunk-btn" onClick={
                        toggleModal
                    }>
                        <div className="chunk-left">
                            <img src={pluriIcon} alt="" />
                            <div className="chunk-text">
                                <h3>Get PLURI Coin for {currentSelectedChain.name}</h3>
                                <p>Available with PLURI Faucet</p>
                            </div>
                        </div>
                        <div className="chunk-right">
                            <button className="chunk-right-btn">
                                <p>Launch Faucet</p>
                                <i className="material-icons">
                                    arrow_forward_ios
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
            <Modal title="Pluri Faucet" opened={opened} size={470} radius={25} onClose={close} centered overlayProps={{
                backgroundOpacity: 0.55,
                blur: 20,
            }}>
                <PluriFaucet toggleModal={toggleModal} />
            </Modal>
        </>


    );
}

export default C_AppPublishing;

