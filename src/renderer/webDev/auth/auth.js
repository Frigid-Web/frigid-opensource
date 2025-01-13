import React, { useEffect } from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';

import { useNavigate } from "react-router-dom";

import logo from '../../../../assets/logoWhite.svg'
import MetaMaskOnboarding from "@metamask/onboarding";
import { OnboardingButton } from "./authBtn";
import SwapNetwork from "./swapNetwork";

function Auth() {
    const dispatch = useDispatch()


    const navigate = useNavigate();
    const metamaskConnected = useSelector(state => state.mainapp.authSlice.metamask.connected);
    const isOnChain = useSelector(state => state.mainapp.authSlice.metamask.isOnChain);

    const [showAuthWindow, setShowAuthWindow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowAuthWindow(!metamaskConnected);
        }, 3000);

        return () => clearTimeout(timer);
    }, [metamaskConnected]);




    const [networkAdded, setNetworkAdded] = useState(true);

    const addPolygonNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x89',
                    chainName: 'Polygon',
                    nativeCurrency: {
                        name: 'MATIC',
                        symbol: 'MATIC',
                        decimals: 18
                    },
                    rpcUrls: ['https://polygon-rpc.com/'],

                }]
            });
            setNetworkAdded(true)

        } catch (error) {
            console.error("Failed to add Polygon network to MetaMask:", error);

        }
    };

    async function switchNetwork() {
        if (typeof window.ethereum !== 'undefined') {
            try {

                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x89' }],
                });

                setNetworkAdded(true);
            } catch (error) {
                if (error.code === 4902) {

                    setNetworkAdded(false);
                } else {
                    console.error("Error switching to Polygon network:", error);
                }
            }
        } else {

        }
    }

    /* 
        useEffect(() => {
            console.log('metamaskConnected', metamaskConnected)
        }, [metamaskConnected])
     */



    return (
        <>
            {showAuthWindow && (
                <div className="auth-container">
                    <div className="auth-window">
                        <div className="auth-header">
                            <span className="version-status-string slim-version">
                                <i className="material-icons">science</i>
                                <p>Release Beta: 0.0.2</p>
                            </span>
                            <div className='promo-action'>
                                <div style={{ height: 'auto' }} className='split-logo'>
                                    <img src={logo} alt='logo' className='logo' />
                                    <div className='vertical-line'></div>
                                    <h1>Developer</h1>
                                </div>
                                <h1>Start Hosting Apps On The Blockchain</h1>
                                <p>
                                    An all New Internet Is Here. Build and Host Apps on the Blockchain
                                </p>
                            </div>
                        </div>
                        <div className="meta-btn-container">
                            <OnboardingButton />
                        </div>
                    </div>
                </div>
            )}
            {!showAuthWindow && metamaskConnected && !isOnChain && (
                <div className="auth-container">
                    <SwapNetwork />
                </div>
            )}

        </>


    );
}

export default Auth;

